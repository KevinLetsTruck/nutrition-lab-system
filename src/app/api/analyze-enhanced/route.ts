import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'
// import { SupabaseStorageService } from '@/lib/supabase-storage' // TODO: Replace with file storage
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import { DocumentProcessorFactory } from '@/lib/document-processors/document-processor-factory'
import { TextractProcessor } from '@/lib/document-processors/textract-processor'

const db = DatabaseService.getInstance()

export async function POST(request: NextRequest) {
  console.log('[ANALYZE-ENHANCED] ===== Starting enhanced analysis =====')
  const startTime = Date.now()
  let primaryBucket = 'general'

  try {
    const body = await request.json()
    const { 
      labReportId, 
      clientEmail,
      clientFirstName,
      clientLastName,
      useTextract = true // Default to using Textract
    } = body

    console.log('[ANALYZE-ENHANCED] Request params:', {
      labReportId,
      clientEmail,
      useTextract
    })

    // Get lab report from database
    const analysisStatus = await db.getAnalysisStatus(labReportId)
    if (!analysisStatus) {
      return NextResponse.json(
        { error: 'Lab report not found' },
        { status: 404 }
      )
    }
    
    const labReport = {
      id: analysisStatus.id,
      file_path: analysisStatus.filePath,
      report_type: analysisStatus.reportType,
      status: analysisStatus.status,
      bucket: 'general', // Default bucket, will be determined from path
      client_id: analysisStatus.clientId
    }

    console.log('[ANALYZE-ENHANCED] Lab report found:', {
      id: labReport.id,
      filePath: labReport.file_path,
      reportType: labReport.report_type,
      status: labReport.status,
      bucket: labReport.bucket
    })

    // Determine bucket from stored info or path
    primaryBucket = labReport.bucket || determineBucketFromPath(labReport.file_path, labReport.report_type)
    
    // Download file from storage
    console.log('[ANALYZE-ENHANCED] Downloading from bucket:', primaryBucket)
    // TODO: Replace with file storage service
    // const storageService = new SupabaseStorageService(true) // Use service role
    
    let fileBuffer: Buffer
    try {
      // const downloaded = await storageService.downloadFile(primaryBucket, labReport.file_path)
      const downloaded = null
      if (!downloaded) {
        throw new Error('File not found in storage')
      }
      fileBuffer = downloaded
      console.log('[ANALYZE-ENHANCED] File downloaded successfully, size:', fileBuffer.length)
    } catch (error) {
      // Try fallback bucket
      console.log('[ANALYZE-ENHANCED] Failed to download from primary bucket, trying general bucket')
      // const fallbackDownload = await storageService.downloadFile('general', labReport.file_path)
      const fallbackDownload = null
      if (!fallbackDownload) {
        throw new Error('File not found in any bucket')
      }
      fileBuffer = fallbackDownload
    }

    // Update status to processing
    await db.updateAnalysisStatus(labReportId, 'processing')

    // Step 1: Extract content using appropriate processor
    console.log('[ANALYZE-ENHANCED] Step 1: Extracting document content...')
    
    let extractedContent
    let extractionMethod = 'unknown'
    
    if (useTextract) {
      try {
        const processor = await DocumentProcessorFactory.getProcessor()
        extractedContent = await processor.extractFromDocument(fileBuffer)
        extractionMethod = processor instanceof TextractProcessor ? 'textract' : 'claude'
        
        console.log('[ANALYZE-ENHANCED] Content extracted successfully:', {
          method: extractionMethod,
          textLength: extractedContent.text.length,
          tableCount: extractedContent.tables.length,
          keyValueCount: extractedContent.keyValuePairs.length,
          confidence: extractedContent.confidence.toFixed(2)
        })
        
        // If Textract, also extract lab patterns
        if (processor instanceof TextractProcessor) {
          const patterns = processor.extractLabReportPatterns(extractedContent)
          console.log('[ANALYZE-ENHANCED] Lab patterns extracted:', {
            patientInfo: Object.keys(patterns.patientInfo).length,
            testResults: patterns.testResults.length,
            dates: patterns.dates.length
          })
        }
      } catch (extractError) {
        console.error('[ANALYZE-ENHANCED] Textract failed, falling back to standard parser:', extractError)
        // Fall back to standard PDF parsing
        extractionMethod = 'pdf-parse'
      }
    }

    // Step 2: Analyze the extracted content
    console.log('[ANALYZE-ENHANCED] Step 2: Running analysis pipeline...')
    
    const analyzer = MasterAnalyzer.getInstance()
    let analysisResult
    
    if (extractedContent && extractedContent.text) {
      // Create a synthetic PDF buffer with the extracted text for the analyzer
      const textBuffer = Buffer.from(extractedContent.text, 'utf-8')
      analysisResult = await analyzer.analyzeReport(textBuffer)
      
      // Enhance analysis with structured data from Textract
      if (extractedContent.tables.length > 0 || extractedContent.keyValuePairs.length > 0) {
        analysisResult = {
          ...analysisResult,
          extractedData: {
            tables: extractedContent.tables,
            keyValuePairs: extractedContent.keyValuePairs,
            confidence: extractedContent.confidence
          },
          extractionMethod
        }
      }
    } else {
      // Fallback to direct PDF analysis
      analysisResult = await analyzer.analyzeReport(fileBuffer)
      analysisResult = {
        ...analysisResult,
        extractionMethod: 'standard'
      }
    }

    console.log('[ANALYZE-ENHANCED] Analysis complete:', {
      reportType: analysisResult.reportType,
      processingTime: analysisResult.processingTime,
      confidence: analysisResult.confidence,
      extractionMethod: (analysisResult as any).extractionMethod || extractionMethod
    })

    // Update database with results
    await db.updateAnalysisStatus(
      labReportId, 
      'completed', 
      `Analyzed using ${(analysisResult as any).extractionMethod || extractionMethod} extraction`
    )

    // AI analysis generation would happen here if needed
    // This could be triggered separately or as part of a queue

    const response = {
      success: true,
      labReportId,
      analysis: analysisResult,
      processingTime: Date.now() - startTime,
      extractionMethod: (analysisResult as any).extractionMethod || extractionMethod,
      message: 'Enhanced analysis completed successfully'
    }

    console.log('[ANALYZE-ENHANCED] ===== Analysis complete =====', {
      processingTime: response.processingTime,
      reportType: analysisResult.reportType,
      method: response.extractionMethod
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('[ANALYZE-ENHANCED] Error:', error)
    
    // Update status to failed
    try {
      const requestBody = await request.clone().json()
      if (requestBody.labReportId) {
        await db.updateAnalysisStatus(
          requestBody.labReportId,
          'failed',
          error instanceof Error ? error.message : 'Unknown error'
        )
      }
    } catch (dbError) {
      console.error('[ANALYZE-ENHANCED] Failed to update status:', dbError)
    }

    return NextResponse.json(
      {
        error: 'Analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        bucket: primaryBucket
      },
      { status: 500 }
    )
  }
}

/**
 * Determine bucket from file path and report type
 */
function determineBucketFromPath(filePath: string, reportType: string): string {
  console.log('[ANALYZE-ENHANCED] determineBucketFromPath called with:', { filePath, reportType })
  
  // Check if path contains date pattern (YYYY/MM/DD)
  if (filePath.includes('/')) {
    const pathParts = filePath.split('/')
    const possibleBucket = pathParts[0]
    
    // Check if it's a date-based path
    if (/^\d{4}$/.test(possibleBucket)) {
      console.log('[ANALYZE-ENHANCED] Date-based path detected')
      // Map report types to appropriate buckets
      switch (reportType) {
        case 'nutriq':
        case 'kbmo':
        case 'dutch':
          return 'lab-files'
        case 'cgm':
          return 'cgm-images'
        case 'food_photo':
          return 'food-photos'
        default:
          return 'general'
      }
    }
    
    // Check if it's already a bucket name
    const validBuckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
    if (validBuckets.includes(possibleBucket)) {
      console.log('[ANALYZE-ENHANCED] Bucket found in path:', possibleBucket)
      return possibleBucket
    }
  }
  
  // Default bucket mapping by report type
  switch (reportType) {
    case 'nutriq':
    case 'kbmo':
    case 'dutch':
      return 'lab-files'
    case 'cgm':
      return 'cgm-images'
    case 'food_photo':
      return 'food-photos'
    default:
      return 'general'
  }
}

export async function GET() {
  const hasTextract = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  
  return NextResponse.json({
    service: 'Enhanced document analysis',
    status: 'ready',
    features: {
      textract: hasTextract ? 'configured' : 'not configured',
      fallback: 'claude-vision',
      supportedFormats: ['PDF', 'scanned PDFs', 'image-based PDFs'],
      extraction: ['text', 'tables', 'forms', 'key-value pairs']
    }
  })
}