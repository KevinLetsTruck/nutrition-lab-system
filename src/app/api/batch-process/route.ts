import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import { MedicalTerminologyProcessor } from '@/lib/document-processors/medical-terminology-processor'
import { v4 as uuidv4 } from 'uuid'

interface BatchDocument {
  fileName: string
  fileBuffer: Buffer
  documentType?: string
  metadata?: any
}

interface BatchProcessingJob {
  jobId: string
  clientId: string
  totalDocuments: number
  processedDocuments: number
  status: 'queued' | 'processing' | 'completed' | 'failed'
  results: any[]
  errors: any[]
  startTime: Date
  endTime?: Date
}

// In-memory job tracking (should be replaced with Redis or database in production)
const batchJobs = new Map<string, BatchProcessingJob>()

export async function POST(request: NextRequest) {
  console.log('[BATCH-PROCESS] Starting batch document processing')
  
  try {
    const formData = await request.formData()
    const clientId = formData.get('clientId') as string
    const processType = formData.get('processType') as string || 'comprehensive'
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      )
    }

    // Extract all documents from form data
    const documents: BatchDocument[] = []
    const entries = Array.from(formData.entries())
    
    for (const [key, value] of entries) {
      if (key.startsWith('document_') && value instanceof File) {
        const file = value as File
        const buffer = Buffer.from(await file.arrayBuffer())
        
        documents.push({
          fileName: file.name,
          fileBuffer: buffer,
          documentType: formData.get(`${key}_type`) as string,
          metadata: JSON.parse(formData.get(`${key}_metadata`) as string || '{}')
        })
      }
    }

    if (documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided' },
        { status: 400 }
      )
    }

    console.log(`[BATCH-PROCESS] Processing ${documents.length} documents for client ${clientId}`)

    // Create batch job
    const jobId = uuidv4()
    const job: BatchProcessingJob = {
      jobId,
      clientId,
      totalDocuments: documents.length,
      processedDocuments: 0,
      status: 'queued',
      results: [],
      errors: [],
      startTime: new Date()
    }

    batchJobs.set(jobId, job)

    // Start processing asynchronously
    processBatchAsync(job, documents, processType)

    // Return job ID immediately for status tracking
    return NextResponse.json({
      success: true,
      jobId,
      message: `Batch processing started for ${documents.length} documents`,
      statusUrl: `/api/batch-process/status/${jobId}`
    })

  } catch (error) {
    console.error('[BATCH-PROCESS] Error:', error)
    return NextResponse.json(
      { error: 'Batch processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function processBatchAsync(
  job: BatchProcessingJob,
  documents: BatchDocument[],
  processType: string
) {
  try {
    job.status = 'processing'
    const analyzer = MasterAnalyzer.getInstance()
    const medicalProcessor = new MedicalTerminologyProcessor()

    // Process documents with concurrency limit
    const concurrencyLimit = 3 // Process 3 documents at a time
    const results = []

    for (let i = 0; i < documents.length; i += concurrencyLimit) {
      const batch = documents.slice(i, i + concurrencyLimit)
      
      const batchPromises = batch.map(async (doc) => {
        try {
          console.log(`[BATCH-PROCESS] Processing document: ${doc.fileName}`)
          
          // Step 1: Analyze document with existing analyzer
          const analysisResult = await analyzer.analyzeReport(
            doc.fileBuffer,
            doc.fileName
          )

          // Step 2: Enhance with medical terminology processing if text-based
          if (analysisResult.parsedData?.rawText) {
            const enhancedText = await medicalProcessor.enhanceOCRResults(
              analysisResult.parsedData.rawText,
              analysisResult.reportType
            )
            
            // Merge enhanced text into analysis result
            analysisResult.parsedData.enhancedText = enhancedText.enhancedText
            analysisResult.parsedData.medicalTerms = enhancedText.medicalTerms
            analysisResult.parsedData.ocrConfidence = enhancedText.overallConfidence
          }

          // Step 3: Store results in database
          const storedResult = await storeAnalysisResult(
            job.clientId,
            doc.fileName,
            analysisResult
          )

          job.processedDocuments++
          return {
            success: true,
            fileName: doc.fileName,
            documentType: analysisResult.reportType,
            analysisId: storedResult.id,
            summary: extractSummary(analysisResult)
          }

        } catch (error) {
          console.error(`[BATCH-PROCESS] Error processing ${doc.fileName}:`, error)
          job.errors.push({
            fileName: doc.fileName,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          
          job.processedDocuments++
          return {
            success: false,
            fileName: doc.fileName,
            error: error instanceof Error ? error.message : 'Processing failed'
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      job.results = results
    }

    // Update job status
    job.status = 'completed'
    job.endTime = new Date()

    // Trigger comprehensive analysis if all documents processed successfully
    if (processType === 'comprehensive' && job.errors.length === 0) {
      await triggerComprehensiveAnalysis(job.clientId, results)
    }

    console.log(`[BATCH-PROCESS] Job ${job.jobId} completed. Processed: ${job.processedDocuments}/${job.totalDocuments}`)

  } catch (error) {
    console.error('[BATCH-PROCESS] Fatal error in batch processing:', error)
    job.status = 'failed'
    job.endTime = new Date()
    job.errors.push({
      general: error instanceof Error ? error.message : 'Batch processing failed'
    })
  }
}

async function storeAnalysisResult(
  clientId: string,
  fileName: string,
  analysisResult: any
): Promise<any> {
  // Store in appropriate table based on report type
  const reportType = analysisResult.reportType || 'unknown'
  
  // First, create or update the main lab report entry
  const { data: labReport, error: labError } = await supabase
    .from('lab_reports')
    .upsert({
      client_id: clientId,
      report_type: reportType,
      report_date: new Date().toISOString(),
      file_name: fileName,
      raw_text: analysisResult.parsedData?.enhancedText || analysisResult.parsedData?.rawText,
      parsed_data: analysisResult.parsedData,
      confidence_score: analysisResult.parsedData?.ocrConfidence,
      status: 'analyzed'
    })
    .select()
    .single()

  if (labError) {
    throw new Error(`Failed to store lab report: ${labError.message}`)
  }

  // Store type-specific results
  switch (reportType) {
    case 'nutriq':
      await supabase
        .from('nutriq_results')
        .upsert({
          client_id: clientId,
          lab_report_id: labReport.id,
          total_score: analysisResult.structuredData?.totalScore,
          body_systems: analysisResult.structuredData?.bodySystems,
          symptom_data: analysisResult.structuredData?.symptoms,
          recommendations: analysisResult.recommendations,
          ai_analysis: analysisResult.analysis
        })
      break

    case 'kbmo':
      await supabase
        .from('kbmo_results')
        .upsert({
          client_id: clientId,
          lab_report_id: labReport.id,
          sensitivity_data: analysisResult.structuredData?.sensitivities,
          igg_levels: analysisResult.structuredData?.iggLevels,
          foods_to_avoid: analysisResult.structuredData?.avoidFoods,
          foods_to_rotate: analysisResult.structuredData?.rotateFoods,
          ai_analysis: analysisResult.analysis
        })
      break

    case 'dutch':
      await supabase
        .from('dutch_results')
        .upsert({
          client_id: clientId,
          lab_report_id: labReport.id,
          hormone_levels: analysisResult.structuredData?.hormones,
          metabolites: analysisResult.structuredData?.metabolites,
          cortisol_pattern: analysisResult.structuredData?.cortisolPattern,
          recommendations: analysisResult.recommendations,
          ai_analysis: analysisResult.analysis
        })
      break
  }

  return labReport
}

function extractSummary(analysisResult: any): any {
  return {
    reportType: analysisResult.reportType,
    confidence: analysisResult.parsedData?.ocrConfidence || 0,
    keyFindings: analysisResult.structuredData?.keyFindings || [],
    criticalValues: analysisResult.structuredData?.criticalValues || [],
    recommendations: analysisResult.recommendations?.slice(0, 3) || []
  }
}

async function triggerComprehensiveAnalysis(clientId: string, results: any[]) {
  try {
    console.log(`[BATCH-PROCESS] Triggering comprehensive analysis for client ${clientId}`)
    
    // Call the comprehensive analysis endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clients/${clientId}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batchResults: results
      })
    })

    if (!response.ok) {
      console.error('[BATCH-PROCESS] Comprehensive analysis trigger failed:', await response.text())
    }
  } catch (error) {
    console.error('[BATCH-PROCESS] Error triggering comprehensive analysis:', error)
  }
}

// Status endpoint for checking batch job progress
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId?: string } }
) {
  const url = new URL(request.url)
  const jobId = url.pathname.split('/').pop()

  if (!jobId || jobId === 'batch-process') {
    // Return all jobs (for admin monitoring)
    const jobs = Array.from(batchJobs.values()).map(job => ({
      jobId: job.jobId,
      clientId: job.clientId,
      status: job.status,
      progress: `${job.processedDocuments}/${job.totalDocuments}`,
      startTime: job.startTime,
      endTime: job.endTime
    }))

    return NextResponse.json({ jobs })
  }

  const job = batchJobs.get(jobId)
  
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }

  const response = {
    jobId: job.jobId,
    status: job.status,
    progress: {
      total: job.totalDocuments,
      processed: job.processedDocuments,
      percentage: Math.round((job.processedDocuments / job.totalDocuments) * 100)
    },
    results: job.results,
    errors: job.errors,
    startTime: job.startTime,
    endTime: job.endTime,
    duration: job.endTime ? 
      `${Math.round((job.endTime.getTime() - job.startTime.getTime()) / 1000)}s` : 
      undefined
  }

  return NextResponse.json(response)
}

// Cleanup old jobs (should run periodically)
export async function DELETE(request: NextRequest) {
  const { maxAge = 3600000 } = await request.json() // Default: 1 hour
  
  const now = Date.now()
  let cleaned = 0

  for (const [jobId, job] of batchJobs.entries()) {
    if (job.endTime && (now - job.endTime.getTime()) > maxAge) {
      batchJobs.delete(jobId)
      cleaned++
    }
  }

  return NextResponse.json({
    success: true,
    cleaned,
    remaining: batchJobs.size
  })
}