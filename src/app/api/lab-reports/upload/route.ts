import { NextRequest, NextResponse } from 'next/server'
// Use production-friendly PDF processor
import { PDFProcessor } from '@/lib/pdf-processor-production'
import { getServerSession } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  console.log('[LabReports] Upload endpoint called')

  try {
    // Get user session
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const reportType = formData.get('reportType') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('[LabReports] Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      clientId,
      reportType
    })

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF files are supported.' 
      }, { status: 400 })
    }

    // Check file size (5MB limit for Claude API)
    const maxSizeMB = 5
    if (file.size > maxSizeMB * 1024 * 1024) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${maxSizeMB}MB due to Claude API limits.`,
        suggestion: 'Please compress your PDF or split it into smaller files.'
      }, { status: 400 })
    }

    // Get client info if provided
    let clientName: string | undefined
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('first_name, last_name')
        .eq('id', clientId)
        .single()
      
      if (client) {
        clientName = `${client.first_name} ${client.last_name}`.trim()
      }
    }

    // Initialize PDF processor
    const processor = new PDFProcessor({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
      maxRetries: 3,
      maxPDFSizeMB: 5  // Claude API limit
    })

    // Process the PDF
    const labReport = await processor.processLabReport(file, {
      clientName,
      reportType
    })

    console.log('[LabReports] Processing complete:', {
      reportType: labReport.metadata.reportType,
      method: labReport.metadata.processingMethod,
      confidence: labReport.metadata.confidence,
      resultsCount: labReport.testResults.length
    })

    // Store the report in database
    const reportRecord = {
      id: crypto.randomUUID(),
      user_id: session.userId,
      client_id: clientId || null,
      file_name: file.name,
      file_size: file.size,
      report_type: labReport.metadata.reportType,
      processing_method: labReport.metadata.processingMethod,
      confidence_score: labReport.metadata.confidence,
      patient_info: labReport.patientInfo,
      test_results: labReport.testResults,
      clinical_notes: labReport.clinicalNotes,
      metadata: labReport.metadata,
      created_at: new Date().toISOString()
    }

    const { data: savedReport, error: saveError } = await supabase
      .from('lab_reports')
      .insert(reportRecord)
      .select()
      .single()

    if (saveError) {
      console.error('[LabReports] Failed to save report:', saveError)
      // Continue anyway - we have the processed data
    }

    // Upload original PDF to storage
    if (savedReport) {
      const fileBuffer = await file.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('lab-reports')
        .upload(`${session.userId}/${savedReport.id}/${file.name}`, fileBuffer, {
          contentType: file.type,
          upsert: true
        })

      if (uploadError) {
        console.error('[LabReports] Failed to upload PDF:', uploadError)
      }
    }

    // Get processing stats for monitoring
    const stats = processor.getProcessingStats()
    console.log('[LabReports] Processing stats:', stats)

    // Return the processed lab report
    return NextResponse.json({
      success: true,
      report: labReport,
      reportId: savedReport?.id,
      stats: {
        processingTime: stats.averageProcessingTime,
        method: labReport.metadata.processingMethod,
        confidence: labReport.metadata.confidence
      }
    })

  } catch (error) {
    console.error('[LabReports] Upload error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isAuthError = errorMessage.includes('API key') || errorMessage.includes('401')
    const isRateLimit = errorMessage.includes('rate limit') || errorMessage.includes('429')
    
    return NextResponse.json({
      error: 'Failed to process lab report',
      details: errorMessage,
      errorType: isAuthError ? 'auth' : isRateLimit ? 'rate_limit' : 'processing'
    }, { 
      status: isAuthError ? 401 : isRateLimit ? 429 : 500 
    })
  }
}

// GET endpoint to retrieve lab reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const reportType = searchParams.get('reportType')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('lab_reports')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (clientId) {
      query = query.eq('client_id', clientId)
    }

    if (reportType) {
      query = query.eq('report_type', reportType)
    }

    const { data: reports, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      reports: reports || [],
      count: reports?.length || 0
    })

  } catch (error) {
    console.error('[LabReports] GET error:', error)
    return NextResponse.json({
      error: 'Failed to fetch lab reports',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}