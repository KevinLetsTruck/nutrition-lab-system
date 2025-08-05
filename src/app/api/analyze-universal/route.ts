import { NextRequest, NextResponse } from 'next/server'
import { UniversalDocumentProcessor } from '@/lib/document-processors/universal-document-processor'
import ClaudeClient from '@/lib/claude-client'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Handle both JSON and FormData
    const contentType = request.headers.get('content-type') || ''
    
    let fileBuffer: Buffer | null = null
    let text: string = ''
    let documentType: string = 'auto'
    let clientId: string | null = null
    let clientName: string = 'Unknown Client'
    let fileName: string = ''
    let mimeType: string = ''
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      const file = formData.get('file') as File
      clientId = formData.get('clientId') as string || null
      clientName = formData.get('clientName') as string || 'Unknown Client'
      documentType = formData.get('documentType') as string || 'auto'
      
      if (file) {
        fileName = file.name
        mimeType = file.type
        const arrayBuffer = await file.arrayBuffer()
        fileBuffer = Buffer.from(arrayBuffer)
      }
    } else {
      // Handle JSON with text or base64
      const body = await request.json()
      text = body.text || ''
      documentType = body.documentType || 'auto'
      clientId = body.clientId || null
      clientName = body.clientName || 'Unknown Client'
      
      // Support base64 input
      if (body.base64) {
        fileBuffer = Buffer.from(body.base64, 'base64')
        fileName = body.fileName || ''
        mimeType = body.mimeType || ''
      }
    }
    
    if (!fileBuffer && !text) {
      return NextResponse.json(
        { error: 'No file or text provided' },
        { status: 400 }
      )
    }
    
    console.log('[ANALYZE-UNIVERSAL] Request details:', {
      hasFile: !!fileBuffer,
      hasText: !!text,
      fileName,
      mimeType,
      documentType,
      clientId,
      bufferSize: fileBuffer?.length
    })
    
    // Process the document
    const processor = new UniversalDocumentProcessor()
    const processed = await processor.processDocument(
      fileBuffer || text,
      mimeType,
      fileName
    )
    
    console.log('[ANALYZE-UNIVERSAL] Document processed:', {
      format: processed.format,
      textLength: processed.text.length,
      confidence: processed.confidence,
      method: processed.metadata.extractionMethod,
      warnings: processed.metadata.warnings
    })
    
    // If we couldn't extract any text, return error
    // But be more lenient with minimum length - some documents might be very short
    if (!processed.text || processed.text.trim().length === 0) {
      return NextResponse.json({
        error: 'Failed to extract any text from document',
        details: {
          format: processed.format,
          warnings: processed.metadata.warnings,
          extractionMethod: processed.metadata.extractionMethod,
          textLength: processed.text ? processed.text.length : 0,
          message: 'The document appears to be empty or could not be read. It may be an image-based PDF, encrypted, or corrupted.'
        }
      }, { status: 400 })
    }
    
    // Log warning if text is very short
    if (processed.text.length < 50) {
      console.log('[ANALYZE-UNIVERSAL] Warning: Very little text extracted:', processed.text.length, 'characters')
      processed.metadata.warnings.push(`Only ${processed.text.length} characters extracted - results may be limited`)
    }
    
    // Auto-detect document type if needed
    if (documentType === 'auto') {
      documentType = await detectDocumentType(processed.text)
      console.log('[ANALYZE-UNIVERSAL] Auto-detected type:', documentType)
    }
    
    // Analyze with Claude
    const claudeClient = ClaudeClient.getInstance()
    const analysisResult = await analyzeWithClaude(
      claudeClient,
      processed.text,
      documentType,
      clientName,
      processed
    )
    
    // Save to database if clientId provided
    let labReportId: string | null = null
    if (clientId) {
      try {
        const { data: labReport, error } = await supabase
          .from('lab_reports')
          .insert({
            client_id: clientId,
            report_type: mapDocumentType(documentType),
            report_date: new Date().toISOString().split('T')[0],
            file_path: fileName || null,
            file_size: fileBuffer?.length || text.length,
            analysis_results: analysisResult,
            status: 'completed',
            notes: `Universal analysis - ${processed.metadata.extractionMethod}`
          })
          .select()
          .single()
          
        if (!error && labReport) {
          labReportId = labReport.id
          console.log('[ANALYZE-UNIVERSAL] Saved to database:', labReportId)
          
          // Save type-specific results
          await saveTypeSpecificResults(documentType, analysisResult, clientId, labReportId!)
        }
      } catch (dbError) {
        console.error('[ANALYZE-UNIVERSAL] Database error:', dbError)
      }
    }
    
    const totalTime = Date.now() - startTime
    
    return NextResponse.json({
      success: true,
      result: {
        ...analysisResult,
        labReportId,
        processingDetails: {
          format: processed.format,
          confidence: processed.confidence,
          extractionMethod: processed.metadata.extractionMethod,
          warnings: processed.metadata.warnings,
          processingTime: processed.metadata.processingTime,
          totalTime
        }
      },
      message: 'Analysis completed successfully'
    })
    
  } catch (error: any) {
    console.error('[ANALYZE-UNIVERSAL] Error:', error)
    
    const isClaudeError = error.message?.includes('Claude') || error.message?.includes('AI')
    const statusCode = isClaudeError ? 502 : 500
    
    return NextResponse.json({
      error: 'Analysis failed',
      details: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      type: error.constructor.name
    }, { status: statusCode })
  }
}

async function detectDocumentType(text: string): Promise<string> {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('nutriq') || lowerText.includes('naq') || lowerText.includes('nutritional assessment')) {
    return 'nutriq'
  }
  if (lowerText.includes('kbmo') || lowerText.includes('food sensitivity')) {
    return 'kbmo'
  }
  if (lowerText.includes('dutch') || lowerText.includes('hormone')) {
    return 'dutch'
  }
  if (lowerText.includes('fit test') || lowerText.includes('intestinal')) {
    return 'fit_test'
  }
  if (lowerText.includes('glucose') || lowerText.includes('cgm')) {
    return 'cgm'
  }
  
  return 'generic'
}

function mapDocumentType(type: string): 'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo' {
  const typeMap: Record<string, any> = {
    nutriq: 'nutriq',
    kbmo: 'kbmo',
    dutch: 'dutch',
    cgm: 'cgm',
    fit_test: 'kbmo', // Map to closest type
    generic: 'nutriq' // Default
  }
  
  return typeMap[type] || 'nutriq'
}

async function analyzeWithClaude(
  claudeClient: ClaudeClient,
  text: string,
  documentType: string,
  clientName: string,
  processed: any
): Promise<any> {
  console.log('[ANALYZE-UNIVERSAL] Starting Claude analysis...')
  
  // Build type-specific prompts
  const prompts = {
    nutriq: `Analyze this NutriQ nutritional assessment for ${clientName}.
Extract all scores, identify top concerns, and provide recommendations.
Focus on truck driver health considerations where applicable.

${text}

Provide a comprehensive functional medicine analysis including:
1. System scores and their significance
2. Root cause analysis
3. Priority interventions
4. Supplement recommendations
5. Lifestyle modifications`,

    kbmo: `Analyze this KBMO food sensitivity report for ${clientName}.
Identify reactive foods, patterns, and provide elimination/reintroduction protocols.

${text}

Include:
1. High/moderate reactive foods
2. Food family patterns
3. Gut health implications
4. Elimination diet protocol
5. Reintroduction timeline`,

    dutch: `Analyze this Dutch hormone test for ${clientName}.
Evaluate hormone patterns, metabolites, and provide interventions.

${text}

Include:
1. Hormone imbalances
2. Metabolite patterns
3. Circadian rhythm assessment
4. Targeted interventions
5. Retesting timeline`,

    generic: `Analyze this health document for ${clientName}.
Extract key data points and provide functional medicine insights.

${text}

Focus on:
1. Key findings
2. Areas of concern
3. Recommendations
4. Follow-up needed`
  }
  
  const prompt = prompts[documentType as keyof typeof prompts] || prompts.generic
  const systemPrompt = `You are an expert functional medicine practitioner analyzing health documents.
Provide detailed, actionable insights formatted for clinical use.
Consider truck driver lifestyle factors when relevant.
Return structured data when possible.`
  
  const response = await claudeClient.analyzePractitionerReport(prompt, systemPrompt)
  
  // Try to parse as JSON, otherwise return as analysis text
  try {
    return JSON.parse(response)
  } catch (e) {
    return {
      documentType,
      analysis: response,
      extractedText: text,
      metadata: {
        clientName,
        analyzedAt: new Date().toISOString(),
        documentFormat: processed.format,
        confidence: processed.confidence
      }
    }
  }
}

async function saveTypeSpecificResults(
  documentType: string,
  analysisResult: any,
  clientId: string,
  labReportId: string
): Promise<void> {
  try {
    switch (documentType) {
      case 'nutriq':
        if (analysisResult.nutriqAnalysis) {
          await supabase
            .from('nutriq_results')
            .upsert({
              client_id: clientId,
              lab_report_id: labReportId,
              total_score: analysisResult.nutriqAnalysis.totalScore || 0,
              body_systems: analysisResult.nutriqAnalysis.bodySystems || {},
              recommendations: analysisResult.recommendations || {},
              ai_analysis: analysisResult.analysis || ''
            })
        }
        break
        
      // Add other types as needed
    }
  } catch (error) {
    console.error('[ANALYZE-UNIVERSAL] Failed to save type-specific results:', error)
  }
}