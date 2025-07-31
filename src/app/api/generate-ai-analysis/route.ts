import { NextRequest, NextResponse } from 'next/server'
import { generateAIAnalysis } from '@/lib/ai-analysis-service'

export async function POST(request: NextRequest) {
  try {
    const { reportData } = await request.json()
    
    if (!reportData) {
      return NextResponse.json({
        success: false,
        error: 'Report data is required'
      }, { status: 400 })
    }
    
    console.log('[AI-ANALYSIS] Generating AI analysis for client:', reportData.client?.name)
    
    const analysis = await generateAIAnalysis(reportData)
    
    return NextResponse.json({
      success: true,
      analysis
    })
    
  } catch (error) {
    console.error('[AI-ANALYSIS] Error generating analysis:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate AI analysis'
    }, { status: 500 })
  }
} 