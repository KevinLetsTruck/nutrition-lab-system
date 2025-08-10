import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'
import ProtocolGenerator from '@/lib/lab-analysis/protocol-generator'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { LabPattern, AIAnalysis, ClientPreferences } from '@/types/lab-analysis'

export async function POST(request: NextRequest) {
  console.log('[LAB-PROTOCOLS] Starting protocol generation...')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  const protocolGenerator = new ProtocolGenerator()

  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      lab_result_id, 
      client_preferences 
    }: { 
      lab_result_id: string
      client_preferences?: ClientPreferences 
    } = await request.json()

    if (!lab_result_id) {
      return NextResponse.json(
        { error: 'Lab result ID required' },
        { status: 400 }
      )
    }

    // Get lab result with analysis
    const { data: labResult, error: fetchError } = await supabase
      .from('lab_results')
      .select('*, lab_patterns(*)')
      .eq('id', lab_result_id)
      .single()

    if (fetchError || !labResult) {
      return NextResponse.json(
        { error: 'Lab result not found' },
        { status: 404 }
      )
    }

    if (!labResult.ai_analysis) {
      return NextResponse.json(
        { error: 'Lab result not analyzed yet' },
        { status: 400 }
      )
    }

    console.log('[LAB-PROTOCOLS] Generating protocols for:', lab_result_id)

    // Convert patterns from database format
    const patterns: LabPattern[] = labResult.lab_patterns.map((p: any) => ({
      pattern_name: p.pattern_name,
      pattern_category: p.pattern_category,
      confidence_score: p.confidence_score,
      supporting_markers: p.supporting_markers,
      clinical_significance: p.clinical_significance,
      truck_driver_impact: p.truck_driver_impact,
      priority_level: p.priority_level
    }))

    // Generate protocols
    const protocols = await protocolGenerator.generateProtocols(
      patterns,
      labResult.ai_analysis as AIAnalysis,
      client_preferences
    )

    // Save protocols to database
    const savedProtocols = []
    for (const protocol of protocols) {
      const { data: saved, error: saveError } = await supabase
        .from('lab_protocols')
        .insert({
          ...protocol,
          lab_result_id: labResult.id,
          client_id: labResult.client_id
        })
        .select()
        .single()

      if (saved) {
        savedProtocols.push(saved)
      } else {
        console.error('[LAB-PROTOCOLS] Failed to save protocol:', saveError)
      }
    }

    return NextResponse.json({
      success: true,
      lab_result_id,
      protocols: savedProtocols,
      protocol_count: savedProtocols.length,
      message: 'Protocols generated successfully'
    })

  } catch (error) {
    console.error('[LAB-PROTOCOLS] Fatal error:', error)
    return NextResponse.json(
      { error: 'Failed to generate protocols' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  const { searchParams } = new URL(request.url)
  const labResultId = searchParams.get('lab_result_id')
  const clientId = searchParams.get('client_id')

  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('lab_protocols')
      .select('*')
      .order('created_at', { ascending: false })

    if (labResultId) {
      query = query.eq('lab_result_id', labResultId)
    }

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    const { data: protocols, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      protocols: protocols || [],
      count: protocols?.length || 0
    })

  } catch (error) {
    console.error('[LAB-PROTOCOLS] Get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch protocols' },
      { status: 500 }
    )
  }
}