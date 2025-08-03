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

    const { labReportId, filename, clientEmail, clientFirstName, clientLastName, useClientPriority, filePath, fileName, quickAnalysis, bucket } = await request.json()
    
    console.log('[ANALYZE] Request params:', { 
      labReportId, 
      filename, 
      clientEmail,
      hasFirstName: !!clientFirstName,
      hasLastName: !!clientLastName,
      useClientPriority,
      filePath,
      fileName,
      quickAnalysis,
      bucket
    })
    
    // Handle quick analysis mode
    if (quickAnalysis === true && filePath) {
      console.log('[ANALYZE] Quick analysis mode - analyzing file directly from storage')
      
      let fileBuffer: Buffer | null = null
      
      try {
        // Download file from Supabase Storage for quick analysis
        console.log('[ANALYZE] Downloading file for quick analysis:', {
          filePath,
          bucket,
          fileName
        })
        
        // Clean the file path - remove any URL encoding or special characters that might cause issues
        const cleanPath = decodeURIComponent(filePath).trim()
        
        console.log('[ANALYZE] Original path:', filePath)
        console.log('[ANALYZE] Cleaned path:', cleanPath)
        
        // Determine the correct bucket
        let storageBucket = bucket
        if (!storageBucket) {
          // Check file extension and name patterns
          const lowerFileName = (fileName || cleanPath || '').toLowerCase()
          if (lowerFileName.includes('naq') || lowerFileName.includes('question') || 
              lowerFileName.includes('symptom') || lowerFileName.includes('burden')) {
            storageBucket = 'lab-files'
          } else if (lowerFileName.endsWith('.pdf')) {
            storageBucket = 'lab-files'
          } else {
            storageBucket = 'general'
          }
        }
        
        console.log('[ANALYZE] Using bucket:', storageBucket, 'for path:', cleanPath)
        
        // Try to load the file with better error handling
        try {
          // For quick analysis, we need to use the service role client
          // because the files were uploaded with service role
          const { SupabaseStorageService } = await import('@/lib/supabase-storage')
          const storageService = new SupabaseStorageService(true) // Use service role
          
          console.log('[ANALYZE] Attempting to download file with service role client')
          
          // For quick analysis, determine bucket from file path or use provided bucket
          let actualBucket = bucket || 'general'
          
          // If no bucket provided, try to determine from file path
          if (!bucket) {
            // For quick analysis, we don't have report type, so just check the path
            const pathParts = cleanPath.split('/')
            if (/^\d{4}$/.test(pathParts[0])) {
              // Date-based path, default to lab-files for PDF files
              actualBucket = 'lab-files'
            }
          }
          
          console.log('[ANALYZE] Using bucket:', actualBucket, 'for path:', cleanPath)
          
          fileBuffer = await storageService.downloadFile(actualBucket, cleanPath)
          
          if (!fileBuffer) {
            console.error('[ANALYZE] File buffer is null after loadFile call')
            
            // Try alternative buckets if the first attempt fails
            const alternateBuckets = ['lab-files'].filter(b => b !== actualBucket)
            for (const altBucket of alternateBuckets) {
              console.log('[ANALYZE] Trying alternate bucket:', altBucket)
              fileBuffer = await storageService.downloadFile(altBucket, cleanPath)
              if (fileBuffer) {
                console.log('[ANALYZE] Found file in alternate bucket:', altBucket)
                storageBucket = altBucket
                break
              }
            }
          }
        } catch (loadError) {
          console.error('[ANALYZE] Error loading file:', loadError)
        }
        
        if (!fileBuffer) {
          return NextResponse.json(
            { 
              error: 'Failed to retrieve file from storage',
              details: `The file could not be found in storage. Tried buckets: ${storageBucket}, lab-files, general`,
              filePath,
              bucket: storageBucket,
              fileName
            },
            { status: 404 }
          )
        }
        
        console.log('[ANALYZE] File retrieved successfully for quick analysis:', {
          size: fileBuffer.length,
          sizeKB: (fileBuffer.length / 1024).toFixed(2) + ' KB'
        })
        
        // Initialize the master analyzer
        console.log('[ANALYZE] Initializing master analyzer for quick analysis...')
        const analyzer = MasterAnalyzer.getInstance()
        
        // Perform analysis with retry logic
        let analysisResult: any = null
        let lastError: any = null
        
        console.log('[ANALYZE] Starting quick analysis with retry logic...')
        
        for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
          try {
            console.log(`[ANALYZE] Quick analysis attempt ${attempt}/${RETRY_CONFIG.maxRetries}...`)
            analysisResult = await analyzer.analyzeReport(fileBuffer)
            console.log(`[ANALYZE] Quick analysis successful on attempt ${attempt}`)
            break // Success, exit retry loop
            
          } catch (attemptError) {
            lastError = attemptError
            console.error(`[ANALYZE] Quick analysis attempt ${attempt} failed:`, {
              error: attemptError instanceof Error ? attemptError.message : attemptError,
              stack: attemptError instanceof Error ? attemptError.stack : undefined,
              isClaudeError: attemptError instanceof Error && attemptError.message.includes('AI analysis failed'),
              isPDFError: attemptError instanceof Error && attemptError.message.includes('PDF'),
              isVisionError: attemptError instanceof Error && attemptError.message.includes('vision')
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
          throw lastError || new Error('Quick analysis failed after all retry attempts')
        }
        
        console.log('[ANALYZE] Quick analysis completed successfully:', {
          reportType: analysisResult.reportType,
          processingTime: analysisResult.processingTime,
          confidence: analysisResult.confidence
        })
        
        // Return quick analysis results
        const response = {
          success: true,
          quickAnalysis: true,
          fileName: fileName || 'Unknown',
          analysis: analysisResult,
          message: 'Quick analysis completed successfully',
          processingTime: Date.now() - startTime,
          confidence: analysisResult.confidence,
          summary: analyzer.getAnalysisSummary(analysisResult),
          reportType: analysisResult.reportType,
          recommendations: analysisResult.recommendations || [],
          keyFindings: analysisResult.keyFindings || []
        }
        
        console.log('[ANALYZE] ========== Quick analysis complete ==========', {
          totalTime: `${Date.now() - startTime}ms`,
          reportType: analysisResult.reportType
        })
        
        return NextResponse.json(response, {
          headers: {
            ...createRateLimitHeaders(rateLimiter, rateLimitClientId)
          }
        })
        
      } catch (analysisError) {
        logError('QUICK_ANALYSIS_PROCESSING', analysisError, {
          filePath,
          fileName,
          fileSize: fileBuffer?.length
        })
        
        // Extract detailed error information
        let errorDetails = 'Unknown quick analysis error'
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
        
        return NextResponse.json(
          { 
            error: 'Quick analysis failed',
            errorType,
            details: errorDetails,
            fileName: fileName || 'Unknown',
            suggestion: errorType === 'CLAUDE_API_ERROR' 
              ? 'This may be a temporary API issue. Please try again in a few moments.'
              : 'Please ensure the file is a valid lab report PDF and try again.'
          },
          { status: 500 }
        )
      }
    }
    
    // Regular analysis mode (requires labReportId)
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

        // Check if file_path exists
        if (!labReport.file_path) {
          console.error('[ANALYZE] No file path found in lab report')
          return NextResponse.json(
            { 
              error: 'No file path found for this lab report',
              details: 'The lab report record does not contain a file path',
              labReportId: labReport.id
            },
            { status: 400 }
          )
        }

        // Download file from Supabase Storage
        console.log('[ANALYZE] Attempting to download file from storage...')
        
        // Determine the correct bucket based on file path and report type
        const primaryBucket = determineBucketFromPath(labReport.file_path, labReport.report_type)
        console.log('[ANALYZE] Determined primary bucket:', primaryBucket)
        
        try {
          
          // Use service role client for loading files
          const { SupabaseStorageService } = await import('@/lib/supabase-storage')
          const storageService = new SupabaseStorageService(true) // Use service role
          
          fileBuffer = await storageService.downloadFile(primaryBucket, labReport.file_path)
          
          if (!fileBuffer) {
            // If not in primary bucket, try general as fallback
            console.log('[ANALYZE] File not in primary bucket, trying general bucket as fallback...')
            fileBuffer = await storageService.downloadFile('general', labReport.file_path)

          }
            
            if (!fileBuffer) {
              logError('FILE_RETRIEVAL', new Error('Failed to retrieve file'), {
                bucket: primaryBucket,
                path: labReport.file_path,
                cleanPath: labReport.file_path,
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
                  bucket: primaryBucket,
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
            bucket: primaryBucket,
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
      
      // Declare analysis result variable
      let analysisResult: any = null
      let lastError: any = null
      
      // For now, always use standard analysis
      // Client priority is only implemented for specific report types (not needed for standard lab report analysis)
      console.log('[ANALYZE] Starting standard file analysis with retry logic...')
      
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
    
    // Check if it's a date-based path (e.g., "2025/08/01/filename.pdf")
    if (/^\d{4}$/.test(possibleBucket)) {
      console.log('[ANALYZE] Date-based path detected')
      // For date-based paths, determine bucket by report type
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
    
    if (validBuckets.includes(possibleBucket)) {
      console.log('[ANALYZE] Bucket found in path:', possibleBucket)
      return possibleBucket
    }
  }
  
  // Determine bucket based on report type
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
