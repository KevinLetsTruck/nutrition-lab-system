import { NextRequest, NextResponse } from 'next/server'
import { loadFile } from '@/lib/file-utils'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import DatabaseService from '@/lib/database-service'
import { getRateLimiter, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter'
import { db } from '@/lib/supabase'

// Add retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
}

// Utility function for exponential backoff
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Enhanced error logging function
function logError(context: string, error: any, additionalInfo?: any) {
  console.error(`[ANALYZE ERROR - ${context}]`, {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    name: error?.name,
    status: error?.status,
    statusCode: error?.statusCode,
    response: error?.response,
    ...(additionalInfo && { additionalInfo })
  })
}

export async function POST(request: NextRequest) {
  console.log('[ANALYZE] ========== Starting new analysis request ==========')
  const startTime = Date.now()
  
  try {
    // Rate limiting
    const rateLimiter = getRateLimiter('analyze')
    const rateLimitClientId = getClientIdentifier(request)
    
    if (!rateLimiter.isAllowed(rateLimitClientId)) {
      console.log('[ANALYZE] Rate limit exceeded for client:', rateLimitClientId)
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(rateLimiter.getResetTime(rateLimitClientId) / 1000)
        },
        { 
          status: 429,
          headers: {
            ...createRateLimitHeaders(rateLimiter, rateLimitClientId),
            'Retry-After': Math.ceil(rateLimiter.getResetTime(rateLimitClientId) / 1000).toString()
          }
        }
      )
    }

    const { labReportId, filename, clientEmail, clientFirstName, clientLastName } = await request.json()
    
    console.log('[ANALYZE] Request params:', { 
      labReportId, 
      filename, 
      clientEmail,
      hasFirstName: !!clientFirstName,
      hasLastName: !!clientLastName 
    })
    
    if (!labReportId && !filename) {
      return NextResponse.json(
        { 
          error: 'Either labReportId or filename must be provided',
          details: 'Missing required parameters'
        },
        { status: 400 }
      )
    }

    let labReport: any = null
    let fileBuffer: Buffer | null = null

    // If labReportId is provided, get the report from database
    if (labReportId) {
      try {
        console.log('[ANALYZE] Fetching lab report from database:', labReportId)
        labReport = await db.getLabReportById(labReportId)
        
        if (!labReport) {
          console.log('[ANALYZE] Lab report not found:', labReportId)
          return NextResponse.json(
            { 
              error: 'Lab report not found',
              details: `No report found with ID: ${labReportId}`
            },
            { status: 404 }
          )
        }

        console.log('[ANALYZE] Lab report found:', {
          id: labReport.id,
          file_path: labReport.file_path,
          report_type: labReport.report_type,
          status: labReport.status,
          created_at: labReport.created_at
        })

        // Download file from Supabase Storage
        if (labReport.file_path) {
          // Extract bucket from file path or use default
          const bucket = determineBucketFromPath(labReport.file_path, labReport.report_type)
          
          // Clean the file path - remove bucket name if it's included
          let cleanPath = labReport.file_path
          if (cleanPath.startsWith(bucket + '/')) {
            cleanPath = cleanPath.substring(bucket.length + 1)
          }
          
          console.log('[ANALYZE] File download attempt:', {
            bucket,
            originalPath: labReport.file_path,
            cleanPath,
            reportType: labReport.report_type
          })
          
          try {
            fileBuffer = await loadFile(bucket, cleanPath)
            
            if (!fileBuffer) {
              // Try with original path if clean path fails
              console.log('[ANALYZE] Retrying with original path...')
              fileBuffer = await loadFile(bucket, labReport.file_path)
            }
            
            if (!fileBuffer) {
              logError('FILE_RETRIEVAL', new Error('Failed to retrieve file'), {
                bucket,
                path: labReport.file_path,
                cleanPath,
                reportType: labReport.report_type
              })
              
              // Update report status to failed
              await db.updateLabReport(labReport.id, {
                status: 'failed',
                notes: 'Failed to retrieve file from storage - file may have been deleted or moved'
              })
              
              return NextResponse.json(
                { 
                  error: 'Failed to retrieve file from storage',
                  details: 'The file could not be found in storage. It may have been deleted or moved.',
                  bucket,
                  path: labReport.file_path
                },
                { status: 404 }
              )
            }
            
            console.log('[ANALYZE] File retrieved successfully:', {
              size: fileBuffer.length,
              sizeKB: (fileBuffer.length / 1024).toFixed(2) + ' KB'
            })
            
          } catch (storageError) {
            logError('STORAGE_ACCESS', storageError, {
              bucket,
              path: labReport.file_path
            })
            
            return NextResponse.json(
              { 
                error: 'Storage access error',
                details: storageError instanceof Error ? storageError.message : 'Failed to access file storage'
              },
              { status: 500 }
            )
          }
        } else {
          console.error('[ANALYZE] No file path found in lab report')
          return NextResponse.json(
            { 
              error: 'No file path found for this lab report',
              details: 'The lab report record does not contain a file path'
            },
            { status: 400 }
          )
        }
      } catch (error) {
        logError('LAB_REPORT_RETRIEVAL', error, { labReportId })
        return NextResponse.json(
          { 
            error: 'Failed to retrieve lab report',
            details: error instanceof Error ? error.message : 'Database error'
          },
          { status: 500 }
        )
      }
    } else {
      // For backward compatibility, if filename is provided directly
      console.log('[ANALYZE] Direct filename analysis requested (deprecated)')
      return NextResponse.json(
        { 
          error: 'Direct filename analysis is deprecated',
          details: 'Please use labReportId instead of filename'
        },
        { status: 400 }
      )
    }

    // Update report status to processing
    console.log('[ANALYZE] Updating report status to processing...')
    try {
      await db.updateLabReport(labReport.id, { 
        status: 'processing'
      })
    } catch (updateError) {
      logError('STATUS_UPDATE', updateError, { 
        reportId: labReport.id, 
        status: 'processing' 
      })
    }

    try {
      // Initialize the master analyzer
      console.log('[ANALYZE] Initializing master analyzer...')
      const analyzer = MasterAnalyzer.getInstance()
      
      // Analyze the file with retry logic
      console.log('[ANALYZE] Starting file analysis with retry logic...')
      let analysisResult = null
      let lastError = null
      
      for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
          console.log(`[ANALYZE] Analysis attempt ${attempt}/${RETRY_CONFIG.maxRetries}...`)
          analysisResult = await analyzer.analyzeReport(fileBuffer)
          console.log(`[ANALYZE] Analysis successful on attempt ${attempt}`)
          break // Success, exit retry loop
          
        } catch (attemptError) {
          lastError = attemptError
          console.error(`[ANALYZE] Analysis attempt ${attempt} failed:`, {
            error: attemptError instanceof Error ? attemptError.message : attemptError,
            isClaudeError: attemptError instanceof Error && attemptError.message.includes('AI analysis failed')
          })
          
          if (attempt < RETRY_CONFIG.maxRetries) {
            const delay = Math.min(
              RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
              RETRY_CONFIG.maxDelay
            )
            console.log(`[ANALYZE] Waiting ${delay}ms before retry...`)
            await sleep(delay)
          }
        }
      }
      
      if (!analysisResult) {
        throw lastError || new Error('Analysis failed after all retry attempts')
      }

      console.log('[ANALYZE] Analysis completed successfully:', {
        reportType: analysisResult.reportType,
        processingTime: analysisResult.processingTime,
        confidence: analysisResult.confidence
      })

      // Validate analysis before storing
      const validation = analyzer.validateAnalysisForStorage(analysisResult)
      if (!validation.valid) {
        console.warn('[ANALYZE] Analysis validation warnings:', validation.reasons)
        // Continue anyway - we'll store partial results
      }

      // Update report with analysis results
      console.log('[ANALYZE] Updating report with results...')
      await db.updateLabReport(labReport.id, {
        status: 'completed',
        analysis_results: analysisResult
      })

      console.log('[ANALYZE] Analysis saved to database successfully')

      // Return successful response
      const response = {
        success: true,
        labReportId: labReport.id,
        analysis: analysisResult,
        message: 'Analysis completed successfully',
        processingTime: Date.now() - startTime,
        confidence: analysisResult.confidence,
        summary: analyzer.getAnalysisSummary(analysisResult)
      }

      console.log('[ANALYZE] ========== Analysis complete ==========', {
        totalTime: `${Date.now() - startTime}ms`,
        reportType: analysisResult.reportType
      })

      return NextResponse.json(response, {
        headers: {
          ...createRateLimitHeaders(rateLimiter, rateLimitClientId)
        }
      })

    } catch (analysisError) {
      logError('ANALYSIS_PROCESSING', analysisError, {
        reportId: labReport.id,
        reportType: labReport.report_type,
        fileSize: fileBuffer?.length
      })
      
      // Extract detailed error information
      let errorDetails = 'Unknown analysis error'
      let errorType = 'UNKNOWN_ERROR'
      
      if (analysisError instanceof Error) {
        errorDetails = analysisError.message
        
        // Categorize the error
        if (analysisError.message.includes('AI analysis failed')) {
          errorType = 'CLAUDE_API_ERROR'
          // Extract Claude-specific error details
          const claudeMatch = analysisError.message.match(/AI analysis failed: (.+)/)
          if (claudeMatch) {
            errorDetails = claudeMatch[1]
          }
        } else if (analysisError.message.includes('parse')) {
          errorType = 'PARSING_ERROR'
        } else if (analysisError.message.includes('PDF')) {
          errorType = 'PDF_ERROR'
        }
      }
      
      // Update report status to failed with detailed error
      await db.updateLabReport(labReport.id, {
        status: 'failed',
        notes: `Analysis failed: ${errorDetails} (${errorType})`
      })

      return NextResponse.json(
        { 
          error: 'Analysis failed',
          errorType,
          details: errorDetails,
          reportId: labReport.id,
          suggestion: errorType === 'CLAUDE_API_ERROR' 
            ? 'This may be a temporary API issue. Please try again in a few moments.'
            : 'Please ensure the file is a valid lab report PDF and try again.'
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    logError('TOP_LEVEL', error)
    
    return NextResponse.json(
      { 
        error: 'Request processing failed',
        details: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Helper function to determine bucket from file path or report type
function determineBucketFromPath(filePath: string, reportType: string): string {
  console.log('[ANALYZE] determineBucketFromPath called with:', { filePath, reportType })
  
  // If path contains bucket information, extract it
  if (filePath.includes('/')) {
    const pathParts = filePath.split('/')
    // Check if first part is a bucket name
    const possibleBucket = pathParts[0]
    const validBuckets = ['lab-files', 'cgm-images', 'food-photos', 'medical-records', 'supplements', 'general']
    if (validBuckets.includes(possibleBucket)) {
      console.log('[ANALYZE] Bucket found in path:', possibleBucket)
      return possibleBucket
    }
  }
  
  // Fallback to bucket based on report type
  let bucket: string
  switch (reportType) {
    case 'nutriq':
    case 'kbmo':
    case 'dutch':
      bucket = 'lab-files'
      break
    case 'cgm':
      bucket = 'cgm-images'
      break
    case 'food_photo':
      bucket = 'food-photos'
      break
    default:
      bucket = 'general'
  }
  
  console.log('[ANALYZE] Bucket determined from report type:', bucket)
  return bucket
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const labReportId = searchParams.get('id')
    const clientEmail = searchParams.get('client')
    
    const databaseService = DatabaseService.getInstance()
    
    if (labReportId) {
      // Get specific analysis status
      const analysis = await databaseService.getAnalysisStatus(labReportId)
      
      if (!analysis) {
        return NextResponse.json(
          { error: 'Analysis not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        analysis
      })
    }
    
    if (clientEmail) {
      // Get all reports for a client
      const clientId = await databaseService.findOrCreateClient(clientEmail)
      const reports = await databaseService.getClientReports(clientId)
      
      return NextResponse.json({
        success: true,
        reports
      })
    }
    
    // Get pending analyses
    const pendingAnalyses = await databaseService.getPendingAnalyses()
    
    return NextResponse.json({
      success: true,
      pendingAnalyses,
      message: 'Analysis endpoint ready - Supabase Storage enabled'
    })
    
  } catch (error) {
    console.error('GET analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve analysis data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
