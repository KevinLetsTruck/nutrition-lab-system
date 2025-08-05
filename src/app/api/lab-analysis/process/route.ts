import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import LabAIAnalyzer from '@/lib/lab-analysis/ai-analyzer'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { LabValue, LabTestCatalog } from '@/types/lab-analysis'

export async function POST(request: NextRequest) {
  console.log('[LAB-PROCESS] Starting lab analysis processing...')

  // Initialize services inside the handler
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
  
  const aiAnalyzer = new LabAIAnalyzer()

  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lab_result_id } = await request.json()

    if (!lab_result_id) {
      return NextResponse.json(
        { error: 'Lab result ID required' },
        { status: 400 }
      )
    }

    // Get lab result and extracted data
    const { data: labResult, error: fetchError } = await supabase
      .from('lab_results')
      .select('*')
      .eq('id', lab_result_id)
      .single()

    if (fetchError || !labResult) {
      return NextResponse.json(
        { error: 'Lab result not found' },
        { status: 404 }
      )
    }

    if (labResult.processing_status !== 'completed' || !labResult.structured_data) {
      return NextResponse.json(
        { error: 'Lab result not ready for analysis' },
        { status: 400 }
      )
    }

    console.log('[LAB-PROCESS] Processing lab result:', lab_result_id)

    // Get test catalog
    const { data: testCatalog, error: catalogError } = await supabase
      .from('lab_test_catalog')
      .select('*')

    if (catalogError || !testCatalog) {
      console.error('[LAB-PROCESS] Failed to load test catalog:', catalogError)
      return NextResponse.json(
        { error: 'Failed to load test catalog' },
        { status: 500 }
      )
    }

    // Convert extracted test results to lab values
    const labValues = await createLabValues(
      labResult.id,
      labResult.structured_data.test_results,
      testCatalog,
      supabase
    )

    // Get client context
    const { data: client } = await supabase
      .from('clients')
      .select('date_of_birth, gender')
      .eq('id', labResult.client_id)
      .single()

    const clientContext = client ? {
      age: client.date_of_birth ? calculateAge(client.date_of_birth) : undefined,
      gender: client.gender,
      isCommercialDriver: true // Assume all clients are truck drivers for now
    } : undefined

    // Run AI analysis
    const aiAnalysis = await aiAnalyzer.analyzeLabResults(
      labValues,
      testCatalog as LabTestCatalog[],
      clientContext
    )

    // Update lab result with AI analysis
    const { error: updateError } = await supabase
      .from('lab_results')
      .update({
        ai_analysis: aiAnalysis,
        detected_patterns: aiAnalysis.pattern_analysis.primary_patterns
      })
      .eq('id', lab_result_id)

    if (updateError) {
      console.error('[LAB-PROCESS] Failed to update analysis:', updateError)
    }

    // Save detected patterns
    for (const pattern of aiAnalysis.pattern_analysis.primary_patterns) {
      await supabase
        .from('lab_patterns')
        .insert({
          lab_result_id: labResult.id,
          pattern_name: pattern.pattern_name,
          pattern_category: pattern.pattern_category,
          confidence_score: pattern.confidence_score,
          supporting_markers: pattern.supporting_markers,
          clinical_significance: pattern.clinical_significance,
          truck_driver_impact: pattern.truck_driver_impact,
          priority_level: pattern.priority_level
        })
    }

    // Trigger protocol generation
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/lab-analysis/protocols`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lab_result_id })
    })

    return NextResponse.json({
      success: true,
      lab_result_id,
      analysis: aiAnalysis,
      patterns_detected: aiAnalysis.pattern_analysis.primary_patterns.length,
      message: 'Lab analysis completed successfully'
    })

  } catch (error) {
    console.error('[LAB-PROCESS] Fatal error:', error)
    return NextResponse.json(
      { error: 'Failed to process lab analysis' },
      { status: 500 }
    )
  }
}

async function createLabValues(
  labResultId: string,
  extractedResults: any[],
  testCatalog: any[],
  supabase: any
): Promise<LabValue[]> {
  const labValues: LabValue[] = []

  for (const result of extractedResults) {
    // Find matching test in catalog
    const catalogMatch = testCatalog.find(test => {
      const testNameLower = result.test_name.toLowerCase()
      return test.test_name.toLowerCase() === testNameLower ||
             test.test_code.toLowerCase() === testNameLower ||
             test.test_name.toLowerCase().includes(testNameLower) ||
             testNameLower.includes(test.test_name.toLowerCase())
    })

    // Parse value
    const numericValue = parseFloat(result.value)
    const isNumeric = !isNaN(numericValue)

    // Determine if value is optimal
    let isOptimal = false
    let isTruckDriverOptimal = false

    if (catalogMatch && isNumeric) {
      isOptimal = numericValue >= (catalogMatch.optimal_range_low || 0) &&
                  numericValue <= (catalogMatch.optimal_range_high || Infinity)
      
      isTruckDriverOptimal = numericValue >= (catalogMatch.truck_driver_range_low || 0) &&
                             numericValue <= (catalogMatch.truck_driver_range_high || Infinity)
    }

    const labValue: LabValue = {
      id: '', // Will be assigned by database
      lab_result_id: labResultId,
      test_catalog_id: catalogMatch?.id,
      test_name: result.test_name,
      value: isNumeric ? numericValue : undefined,
      value_text: !isNumeric ? result.value : undefined,
      unit: result.unit,
      reference_range: result.reference_range,
      flag: result.flag,
      is_optimal: isOptimal,
      is_truck_driver_optimal: isTruckDriverOptimal,
      interpretation: catalogMatch?.clinical_significance,
      created_at: new Date()
    }

    // Save to database
    const { data: savedValue } = await supabase
      .from('lab_values')
      .insert(labValue)
      .select()
      .single()

    if (savedValue) {
      labValues.push({ ...labValue, id: savedValue.id })
    }
  }

  return labValues
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Lab Analysis Processing Endpoint',
    usage: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        lab_result_id: 'UUID of lab result to process (required)'
      },
      response: {
        success: 'boolean',
        lab_result_id: 'UUID',
        analysis: 'AI analysis results',
        patterns_detected: 'Number of patterns found',
        message: 'Status message'
      }
    }
  })
}