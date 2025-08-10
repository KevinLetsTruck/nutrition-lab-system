import { NextRequest, NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'
import { ClientDataAggregator } from '@/lib/analysis/client-data-aggregator'

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('clientId') || '336ac9e9-dda3-477f-89d5-241df47b8745'
  
  try {
    // Check environment
    const hasKey = !!process.env.ANTHROPIC_API_KEY
    console.log('[TEST] ANTHROPIC_API_KEY available:', hasKey)
    
    if (!hasKey) {
      return NextResponse.json({
        error: 'ANTHROPIC_API_KEY not found',
        availableEnvs: Object.keys(process.env).filter(k => k.includes('ANTHROPIC') || k.includes('API')),
        recommendation: 'Make sure ANTHROPIC_API_KEY is set in Vercel environment variables'
      }, { status: 500 })
    }
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try to aggregate data
    const aggregator = new ClientDataAggregator(supabase)
    const clientData = await aggregator.aggregateAllClientData(clientId)
    
    return NextResponse.json({
      success: true,
      hasAnthropicKey: hasKey,
      hasClientData: !!clientData,
      dataTypes: {
        assessments: clientData.assessmentHistory?.length || 0,
        notes: clientData.sessionNotes?.length || 0,
        documents: clientData.uploadedDocuments?.length || 0,
        labResults: clientData.labResults?.length || 0
      },
      message: 'Data aggregation successful, ready for analysis'
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}