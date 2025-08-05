import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/auth-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const labResultId = searchParams.get('lab_result_id')
  const clientId = searchParams.get('client_id')
  const patternCategory = searchParams.get('category')

  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('lab_patterns')
      .select(`
        *,
        lab_results!inner(
          id,
          collection_date,
          lab_name
        )
      `)
      .order('confidence_score', { ascending: false })

    if (labResultId) {
      query = query.eq('lab_result_id', labResultId)
    }

    if (clientId) {
      query = query.eq('lab_results.client_id', clientId)
    }

    if (patternCategory) {
      query = query.eq('pattern_category', patternCategory)
    }

    const { data: patterns, error } = await query

    if (error) {
      throw error
    }

    // Group patterns by category
    const groupedPatterns = patterns?.reduce((acc: any, pattern: any) => {
      const category = pattern.pattern_category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(pattern)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      patterns: patterns || [],
      grouped_patterns: groupedPatterns || {},
      total_count: patterns?.length || 0,
      categories: Object.keys(groupedPatterns || {})
    })

  } catch (error) {
    console.error('[LAB-PATTERNS] Get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { client_id } = await request.json()

    if (!client_id) {
      return NextResponse.json(
        { error: 'Client ID required' },
        { status: 400 }
      )
    }

    // Get all patterns for client across all lab results
    const { data: patterns, error } = await supabase
      .from('lab_patterns')
      .select(`
        *,
        lab_results!inner(
          id,
          collection_date,
          report_date,
          lab_name,
          client_id
        )
      `)
      .eq('lab_results.client_id', client_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Analyze pattern trends over time
    const patternTrends = analyzePatternTrends(patterns || [])

    // Identify persistent patterns
    const persistentPatterns = identifyPersistentPatterns(patterns || [])

    // Calculate pattern correlations
    const correlations = calculatePatternCorrelations(patterns || [])

    return NextResponse.json({
      success: true,
      patterns: patterns || [],
      analysis: {
        pattern_trends: patternTrends,
        persistent_patterns: persistentPatterns,
        correlations: correlations,
        total_patterns: patterns?.length || 0,
        unique_patterns: [...new Set(patterns?.map(p => p.pattern_name))].length
      }
    })

  } catch (error) {
    console.error('[LAB-PATTERNS] Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze patterns' },
      { status: 500 }
    )
  }
}

function analyzePatternTrends(patterns: any[]): any {
  // Group patterns by name and track over time
  const trends: Record<string, any> = {}

  patterns.forEach(pattern => {
    const name = pattern.pattern_name
    const date = new Date(pattern.lab_results.collection_date || pattern.created_at)

    if (!trends[name]) {
      trends[name] = {
        occurrences: [],
        confidence_scores: [],
        dates: []
      }
    }

    trends[name].occurrences.push(pattern)
    trends[name].confidence_scores.push(pattern.confidence_score)
    trends[name].dates.push(date)
  })

  // Calculate trend direction for each pattern
  Object.keys(trends).forEach(patternName => {
    const data = trends[patternName]
    const scores = data.confidence_scores

    if (scores.length >= 2) {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
      const secondHalf = scores.slice(Math.floor(scores.length / 2))
      
      const firstAvg = firstHalf.reduce((a: number, b: number) => a + b, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a: number, b: number) => a + b, 0) / secondHalf.length
      
      const change = ((secondAvg - firstAvg) / firstAvg) * 100

      trends[patternName].trend = change < -10 ? 'improving' : change > 10 ? 'worsening' : 'stable'
      trends[patternName].trend_percentage = change
    } else {
      trends[patternName].trend = 'insufficient_data'
    }

    trends[patternName].occurrence_count = data.occurrences.length
    trends[patternName].average_confidence = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
  })

  return trends
}

function identifyPersistentPatterns(patterns: any[]): any[] {
  // Group by lab result date
  const resultsByDate: Record<string, Set<string>> = {}

  patterns.forEach(pattern => {
    const date = pattern.lab_results.collection_date || pattern.created_at
    if (!resultsByDate[date]) {
      resultsByDate[date] = new Set()
    }
    resultsByDate[date].add(pattern.pattern_name)
  })

  const dates = Object.keys(resultsByDate).sort()
  if (dates.length < 2) return []

  // Find patterns that appear in all results
  const firstDatePatterns = Array.from(resultsByDate[dates[0]])
  const persistentPatterns = firstDatePatterns.filter(patternName =>
    dates.every(date => resultsByDate[date].has(patternName))
  )

  return persistentPatterns.map(name => {
    const occurrences = patterns.filter(p => p.pattern_name === name)
    return {
      pattern_name: name,
      occurrence_count: occurrences.length,
      date_range: {
        first: dates[0],
        last: dates[dates.length - 1]
      },
      average_confidence: occurrences.reduce((sum, p) => sum + p.confidence_score, 0) / occurrences.length
    }
  })
}

function calculatePatternCorrelations(patterns: any[]): any {
  // Group patterns by lab result
  const patternsByResult: Record<string, string[]> = {}

  patterns.forEach(pattern => {
    const resultId = pattern.lab_result_id
    if (!patternsByResult[resultId]) {
      patternsByResult[resultId] = []
    }
    patternsByResult[resultId].push(pattern.pattern_name)
  })

  // Calculate co-occurrence frequencies
  const coOccurrence: Record<string, Record<string, number>> = {}
  const patternCounts: Record<string, number> = {}

  Object.values(patternsByResult).forEach(resultPatterns => {
    // Update individual pattern counts
    resultPatterns.forEach(pattern => {
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1
    })

    // Update co-occurrence counts
    for (let i = 0; i < resultPatterns.length; i++) {
      for (let j = i + 1; j < resultPatterns.length; j++) {
        const p1 = resultPatterns[i]
        const p2 = resultPatterns[j]
        
        if (!coOccurrence[p1]) coOccurrence[p1] = {}
        if (!coOccurrence[p2]) coOccurrence[p2] = {}
        
        coOccurrence[p1][p2] = (coOccurrence[p1][p2] || 0) + 1
        coOccurrence[p2][p1] = (coOccurrence[p2][p1] || 0) + 1
      }
    }
  })

  // Calculate correlation scores
  const correlations: any[] = []
  
  Object.entries(coOccurrence).forEach(([pattern1, relatedPatterns]) => {
    Object.entries(relatedPatterns).forEach(([pattern2, coCount]) => {
      if (pattern1 < pattern2) { // Avoid duplicates
        const correlation = coCount / Math.min(patternCounts[pattern1], patternCounts[pattern2])
        correlations.push({
          pattern1,
          pattern2,
          co_occurrence_count: coCount,
          correlation_score: correlation,
          strength: correlation > 0.8 ? 'strong' : correlation > 0.5 ? 'moderate' : 'weak'
        })
      }
    })
  })

  return correlations.sort((a, b) => b.correlation_score - a.correlation_score)
}