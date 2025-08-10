import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient, db } from '@/lib/supabase'
import DatabaseService from '@/lib/database-service'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'

/**
 * Simplified upload endpoint that works without AWS Textract
 * Uses pdf-parse for text extraction as primary method
 */
export async function POST(request: NextRequest) {
  console.log('[UPLOAD-SIMPLE] Starting simplified upload process...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const clientEmail = formData.get('clientEmail') as string
    const clientFirstName = formData.get('clientFirstName') as string
    const clientLastName = formData.get('clientLastName') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    console.log('[UPLOAD-SIMPLE] File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Step 1: Get or create client
    const supabase = createServerSupabaseClient()
    const dbService = DatabaseService.getInstance()
    
    let clientId: string
    
    if (clientEmail) {
      // Try to find existing client
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', clientEmail)
        .single()
      
      if (existingClient) {
        clientId = existingClient.id
        console.log('[UPLOAD-SIMPLE] Found existing client:', clientId)
      } else {
        // Create new client
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            email: clientEmail,
            first_name: clientFirstName || 'Unknown',
            last_name: clientLastName || 'Unknown'
          })
          .select()
          .single()
        
        if (clientError) {
          throw new Error(`Failed to create client: ${clientError.message}`)
        }
        
        clientId = newClient.id
        console.log('[UPLOAD-SIMPLE] Created new client:', clientId)
      }
    } else {
      return NextResponse.json(
        { error: 'Client email is required' },
        { status: 400 }
      )
    }
    
    // Step 2: Save file to Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `lab-reports/${clientId}/${fileName}`
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    const { error: uploadError } = await supabase.storage
      .from('general')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (uploadError) {
      console.error('[UPLOAD-SIMPLE] Storage upload failed:', uploadError)
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }
    
    console.log('[UPLOAD-SIMPLE] File uploaded to storage:', filePath)
    
    // Step 3: Create lab report record
    const labReport = await db.createLabReport({
      client_id: clientId,
      report_type: 'nutriq', // Default to nutriq, will be updated after analysis
      report_date: new Date().toISOString().split('T')[0],
      file_path: filePath,
      file_size: file.size,
      notes: `Processing ${file.name}`
    })
    
    console.log('[UPLOAD-SIMPLE] Created lab report:', labReport.id)
    
    // Step 4: Extract text using pdf-parse (no AWS required)
    let extractedText = ''
    let extractionMethod = 'none'
    
    try {
      console.log('[UPLOAD-SIMPLE] Attempting text extraction with pdf-parse...')
      // Dynamic import to avoid build issues
      const pdf = (await import('pdf-parse')).default
      const pdfData = await pdf(fileBuffer)
      extractedText = pdfData.text
      extractionMethod = 'pdf-parse'
      
      console.log('[UPLOAD-SIMPLE] Text extracted successfully:', {
        method: extractionMethod,
        textLength: extractedText.length,
        pages: pdfData.numpages
      })
      
      // Save raw text to database
      await db.updateLabReport(labReport.id, {
        notes: `Extracted ${extractedText.length} characters from ${pdfData.numpages} pages using ${extractionMethod}`,
        analysis_results: {
          raw_text: extractedText,
          parsed_data: {
            extractionMethod,
            pageCount: pdfData.numpages,
            extractedAt: new Date().toISOString()
          }
        }
      })
      
    } catch (error) {
      console.error('[UPLOAD-SIMPLE] PDF text extraction failed:', error)
      // Continue anyway - analysis might still work
    }
    
    // Step 5: Analyze the document
    try {
      console.log('[UPLOAD-SIMPLE] Starting document analysis...')
      const analyzer = MasterAnalyzer.getInstance()
      const analysisResult = await analyzer.analyzeReport(fileBuffer)
      
      console.log('[UPLOAD-SIMPLE] Analysis complete:', {
        reportType: analysisResult.reportType,
        confidence: analysisResult.confidence
      })
      
      // Update report with analysis results
      await db.updateLabReport(labReport.id, {
        analysis_results: analysisResult.analyzedReport,
        status: 'completed',
        notes: `Analysis completed for ${analysisResult.reportType} report`
      })
      
      // Store type-specific results
      if (analysisResult.reportType === 'nutriq' && analysisResult.analyzedReport) {
        const nutriqData = analysisResult.analyzedReport as any
        if (nutriqData.nutriqAnalysis) {
          await supabase
            .from('nutriq_results')
            .upsert({
              client_id: clientId,
              lab_report_id: labReport.id,
              total_score: nutriqData.nutriqAnalysis.totalScore,
              body_systems: nutriqData.nutriqAnalysis.bodySystems,
              recommendations: nutriqData.recommendations,
              ai_analysis: nutriqData.analysis
            })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Document uploaded and analyzed successfully',
        labReportId: labReport.id,
        reportType: analysisResult.reportType,
        extractionMethod,
        analysisConfidence: analysisResult.confidence,
        clientId
      })
      
    } catch (analysisError) {
      console.error('[UPLOAD-SIMPLE] Analysis failed:', analysisError)
      
      // Update report status
      await db.updateLabReport(labReport.id, {
        status: 'failed',
        notes: `Analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`
      })
      
      return NextResponse.json({
        success: false,
        message: 'Document uploaded but analysis failed',
        labReportId: labReport.id,
        extractionMethod,
        error: analysisError instanceof Error ? analysisError.message : 'Analysis failed',
        suggestion: 'Please ensure the PDF is a valid lab report. Text-based PDFs work best.',
        clientId
      })
    }
    
  } catch (error) {
    console.error('[UPLOAD-SIMPLE] Upload failed:', error)
    
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}