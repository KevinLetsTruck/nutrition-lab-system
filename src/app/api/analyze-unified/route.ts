import { NextRequest, NextResponse } from 'next/server'
import { UnifiedAnalysisOrchestrator } from '@/lib/analysis/unified-analysis-orchestrator'
import { supabase } from '@/lib/supabase'
import { createLabReport, updateLabReport } from '@/database/queries/lab-reports'

export async function POST(request: NextRequest) {
  console.log('[ANALYZE-UNIFIED] Starting unified analysis endpoint')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const clientId = formData.get('clientId') as string | null
    const reportType = formData.get('reportType') as string | null
    const analysisType = formData.get('analysisType') as string || 'document'

    // Validate inputs
    if (!file && !clientId) {
      return NextResponse.json(
        { error: 'Either file or clientId must be provided' },
        { status: 400 }
      )
    }

    let fileBuffer: Buffer | undefined
    let labReport: any = null

    // Process file if provided
    if (file) {
      console.log('[ANALYZE-UNIFIED] Processing file:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)

      // Create initial lab report record
      labReport = await createLabReport({
        client_id: clientId || crypto.randomUUID(),
        file_name: file.name,
        report_type: reportType || 'unknown',
        upload_date: new Date(),
        status: 'processing',
        file_size: file.size,
        mime_type: file.type
      })

      console.log('[ANALYZE-UNIFIED] Created lab report:', labReport.id)
    }

    // Initialize orchestrator and perform analysis
    const orchestrator = new UnifiedAnalysisOrchestrator()
    
    const result = await orchestrator.analyzeDocument({
      fileBuffer,
      clientId: clientId || undefined,
      analysisType: analysisType as 'document' | 'comprehensive' | 'quick',
      reportType: reportType || undefined,
      metadata: {
        fileName: file?.name,
        fileSize: file?.size,
        uploadedAt: new Date().toISOString()
      }
    })

    console.log('[ANALYZE-UNIFIED] Analysis result:', {
      success: result.success,
      analysisId: result.analysisId,
      documentType: result.documentType,
      hasExtractedData: !!result.extractedData,
      hasFunctionalAnalysis: !!result.functionalAnalysis,
      errors: result.errors,
      warnings: result.warnings,
      processingTime: result.processingTime
    })

    // Update lab report if created
    if (labReport) {
      if (result.success) {
        await updateLabReport(labReport.id, {
          status: 'completed',
          analysis_results: result,
          report_type: result.documentType || reportType || 'unknown',
          processing_time: result.processingTime,
          notes: result.warnings?.join('; ')
        })
      } else {
        await updateLabReport(labReport.id, {
          status: 'failed',
          notes: result.errors?.join('; ') || 'Analysis failed'
        })
      }
    }

    // Return appropriate response
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Analysis completed successfully',
        reportId: labReport?.id,
        analysisId: result.analysisId,
        documentType: result.documentType,
        analysis: {
          extractedData: result.extractedData,
          functionalAnalysis: result.functionalAnalysis,
          recommendations: result.recommendations,
          protocols: result.protocols
        },
        warnings: result.warnings,
        processingTime: result.processingTime
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis failed',
          errors: result.errors,
          warnings: result.warnings,
          reportId: labReport?.id,
          suggestion: 'Please ensure the document is readable and try again'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[ANALYZE-UNIFIED] Unexpected error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  
  return NextResponse.json({
    status: 'ready',
    endpoint: 'analyze-unified',
    capabilities: [
      'document-analysis',
      'comprehensive-analysis',
      'quick-analysis'
    ],
    configuration: {
      anthropicApiKey: hasApiKey ? 'configured' : 'missing',
      supabase: hasSupabase ? 'configured' : 'missing'
    },
    timestamp: new Date().toISOString()
  })
}