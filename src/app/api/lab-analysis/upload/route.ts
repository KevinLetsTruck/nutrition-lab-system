import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import LabOCRProcessor from '@/lib/lab-analysis/ocr-processor'
import { getAuthenticatedUser } from '@/lib/auth-utils'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const ocrProcessor = new LabOCRProcessor()

export async function POST(request: NextRequest) {
  console.log('[LAB-UPLOAD] Starting lab document upload...')

  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const clientId = formData.get('client_id') as string

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID required' },
        { status: 400 }
      )
    }

    console.log(`[LAB-UPLOAD] Processing ${files.length} files for client ${clientId}`)

    const uploadResults = []

    for (const file of files) {
      try {
        console.log(`[LAB-UPLOAD] Processing file: ${file.name}`)

        // Upload file to Supabase storage
        const fileName = `${clientId}/${Date.now()}-${file.name}`
        const fileBuffer = Buffer.from(await file.arrayBuffer())

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lab-documents')
          .upload(fileName, fileBuffer, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) {
          console.error('[LAB-UPLOAD] Storage error:', uploadError)
          uploadResults.push({
            fileName: file.name,
            success: false,
            error: uploadError.message
          })
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('lab-documents')
          .getPublicUrl(fileName)

        // Create lab result record
        const { data: labResult, error: dbError } = await supabase
          .from('lab_results')
          .insert({
            client_id: clientId,
            file_url: publicUrl,
            file_type: file.type.includes('pdf') ? 'pdf' : 'image',
            processing_status: 'pending'
          })
          .select()
          .single()

        if (dbError) {
          console.error('[LAB-UPLOAD] Database error:', dbError)
          uploadResults.push({
            fileName: file.name,
            success: false,
            error: dbError.message
          })
          continue
        }

        uploadResults.push({
          fileName: file.name,
          success: true,
          labResultId: labResult.id,
          fileUrl: publicUrl
        })

        // Queue for processing (in production, this would be a background job)
        processLabDocument(labResult.id, fileBuffer, file.type.includes('pdf') ? 'pdf' : 'image')

      } catch (error) {
        console.error(`[LAB-UPLOAD] Error processing ${file.name}:`, error)
        uploadResults.push({
          fileName: file.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results: uploadResults,
      message: `Uploaded ${uploadResults.filter(r => r.success).length} of ${files.length} files`
    })

  } catch (error) {
    console.error('[LAB-UPLOAD] Fatal error:', error)
    return NextResponse.json(
      { error: 'Failed to upload lab documents' },
      { status: 500 }
    )
  }
}

// Background processing function (in production, this would be a separate worker)
async function processLabDocument(
  labResultId: string, 
  fileBuffer: Buffer, 
  fileType: 'pdf' | 'image'
) {
  try {
    console.log(`[LAB-UPLOAD] Starting OCR processing for ${labResultId}`)

    // Update status to processing
    await supabase
      .from('lab_results')
      .update({ processing_status: 'processing' })
      .eq('id', labResultId)

    // Run OCR
    const ocrResult = await ocrProcessor.processLabDocument(fileBuffer, fileType)

    if (ocrResult.success) {
      // Update with OCR results
      await supabase
        .from('lab_results')
        .update({
          processing_status: 'completed',
          raw_text: ocrResult.text,
          structured_data: ocrResult.structured_data,
          confidence_scores: {
            ocr_accuracy: ocrResult.confidence,
            value_extraction: ocrResult.structured_data?.test_results?.length ? 0.8 : 0.3,
            overall_confidence: ocrResult.confidence
          }
        })
        .eq('id', labResultId)

      console.log(`[LAB-UPLOAD] OCR completed for ${labResultId}`)

      // Trigger analysis
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/lab-analysis/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_result_id: labResultId })
      })
    } else {
      // Update with error
      await supabase
        .from('lab_results')
        .update({
          processing_status: 'failed',
          processing_error: ocrResult.errors?.join(', ')
        })
        .eq('id', labResultId)
    }
  } catch (error) {
    console.error(`[LAB-UPLOAD] Processing error for ${labResultId}:`, error)
    await supabase
      .from('lab_results')
      .update({
        processing_status: 'failed',
        processing_error: error instanceof Error ? error.message : 'Processing failed'
      })
      .eq('id', labResultId)
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Lab Document Upload Endpoint',
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        files: 'Lab PDF or image files (required, multiple allowed)',
        client_id: 'Client UUID (required)'
      },
      response: {
        success: 'boolean',
        results: 'Array of upload results',
        message: 'Summary message'
      }
    }
  })
}