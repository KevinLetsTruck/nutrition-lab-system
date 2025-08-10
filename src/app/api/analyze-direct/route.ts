import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'
// import { supabase } from '@/lib/supabase' // TODO: Replace with Prisma

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, documentType = 'nutriq', clientId, clientName = 'Test Client' } = body
    
    if (!text) {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }
    
    console.log('[ANALYZE-DIRECT] Starting direct analysis...')
    console.log('[ANALYZE-DIRECT] Text length:', text.length)
    console.log('[ANALYZE-DIRECT] Document type:', documentType)
    
    const claudeClient = ClaudeClient.getInstance()
    
    let result: any
    
    switch (documentType) {
      case 'nutriq':
        console.log('[ANALYZE-DIRECT] Analyzing as NutriQ...')
        
        // Build a proper prompt for NutriQ analysis
        const nutriqPrompt = `You are analyzing a NutriQ nutritional assessment for ${clientName}.

Please analyze the following NutriQ report text and provide a comprehensive analysis:

${text}

Provide your analysis in the following JSON format:
{
  "nutriqAnalysis": {
    "totalScore": <number>,
    "bodySystems": {
      "system_name": {
        "score": <number>,
        "significance": "low|moderate|high",
        "notes": "Brief notes"
      }
    },
    "topConcerns": ["concern1", "concern2", "concern3"],
    "supplementPriorities": ["priority1", "priority2", "priority3"]
  },
  "recommendations": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"],
    "longTerm": ["action1", "action2"]
  },
  "analysis": "Comprehensive analysis text here..."
}`

        const systemPrompt = 'You are an expert functional medicine practitioner analyzing NutriQ assessment results.'
        
        const response = await claudeClient.analyzePractitionerReport(nutriqPrompt, systemPrompt)
        
        // Try to parse the response as JSON
        try {
          result = JSON.parse(response)
        } catch (e) {
          // If not JSON, create a structured response
          result = {
            analysis: response,
            documentType: 'nutriq',
            extractedData: { text },
            timestamp: new Date().toISOString()
          }
        }
        break
        
      default:
        // Generic analysis
        console.log('[ANALYZE-DIRECT] Performing generic analysis...')
        
        const genericPrompt = `Analyze the following health-related document and provide insights:

${text}

Focus on:
1. Key health markers or scores
2. Areas of concern
3. Recommended actions
4. Any patterns or trends`

        const genericSystemPrompt = 'You are a functional medicine expert analyzing health documents.'
        
        const genericResponse = await claudeClient.analyzePractitionerReport(genericPrompt, genericSystemPrompt)
        
        result = {
          analysis: genericResponse,
          documentType: 'generic',
          extractedData: { text },
          timestamp: new Date().toISOString()
        }
    }
    
    // If clientId provided, save to database
    if (clientId) {
      try {
        // TODO: Replace with Prisma
        /*
        const { data: labReport, error } = await supabase
          .from('lab_reports')
          .insert({
            client_id: clientId,
            report_type: documentType as any,
            report_date: new Date().toISOString().split('T')[0],
            analysis_results: result,
            status: 'completed',
            notes: 'Direct text analysis (no PDF)'
          })
          .select()
          .single()
          
        if (error) {
          console.error('[ANALYZE-DIRECT] Failed to save to database:', error)
        } else {
          console.log('[ANALYZE-DIRECT] Saved to database, ID:', labReport.id)
          result.labReportId = labReport.id
        }
        */
        console.log('[ANALYZE-DIRECT] Database save skipped - Supabase code commented out')
      } catch (dbError) {
        console.error('[ANALYZE-DIRECT] Database error:', dbError)
      }
    }
    
    console.log('[ANALYZE-DIRECT] Analysis complete')
    
    return NextResponse.json({
      success: true,
      result,
      message: 'Direct analysis completed successfully'
    })
    
  } catch (error: any) {
    console.error('[ANALYZE-DIRECT] Error:', error)
    
    return NextResponse.json({
      error: 'Direct analysis failed',
      details: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 })
  }
}