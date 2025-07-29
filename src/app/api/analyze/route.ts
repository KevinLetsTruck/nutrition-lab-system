import { NextRequest, NextResponse } from 'next/server'
import { loadFile } from '@/lib/file-utils'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import DatabaseService from '@/lib/database-service'
import { getRateLimiter, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter'
import { db } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('[ANALYZE] Starting analysis request')
  
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
    
    console.log('[ANALYZE] Request params:', { labReportId, filename, clientEmail })
    
    if (!labReportId && !filename) {
      return NextResponse.json(
        { error: 'Either labReportId or filename must be provided' },
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
            { error: 'Lab report not found' },
            { status: 404 }
          )
        }

        console.log('[ANALYZE] Lab report found:', {
          id: labReport.id,
          file_path: labReport.file_path,
          report_type: labReport.report_type,
          status: labReport.status
        })

        // Download file from Supabase Storage
        if (labReport.file_path) {
          // Extract bucket from file path or use default
          const bucket = determineBucketFromPath(labReport.file_path, labReport.report_type)
          console.log('[ANALYZE] Determined bucket:', bucket)
          console.log('[ANALYZE] Attempting to download file from storage...')
          
          fileBuffer = await loadFile(bucket, labReport.file_path)
          
          if (!fileBuffer) {
            console.error('[ANALYZE] Failed to retrieve file from storage')
            console.error('[ANALYZE] Bucket:', bucket)
            console.error('[ANALYZE] Path:', labReport.file_path)
            return NextResponse.json(
              { error: 'Failed to retrieve file from storage' },
              { status: 500 }
            )
          }
          
          console.log('[ANALYZE] File retrieved successfully, size:', fileBuffer.length, 'bytes')
        } else {
          console.error('[ANALYZE] No file path found in lab report')
          return NextResponse.json(
            { error: 'No file path found for this lab report' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('[ANALYZE] Error retrieving lab report:', error)
        console.error('[ANALYZE] Error details:', error instanceof Error ? error.stack : error)
        return NextResponse.json(
          { error: 'Failed to retrieve lab report' },
          { status: 500 }
        )
      }
    } else {
      // For backward compatibility, if filename is provided directly
      console.log('[ANALYZE] Direct filename analysis requested (deprecated)')
      return NextResponse.json(
        { error: 'Direct filename analysis is deprecated. Please use labReportId.' },
        { status: 400 }
      )
    }

    // Update report status to processing
    console.log('[ANALYZE] Updating report status to processing...')
    await db.updateLabReport(labReport.id, { status: 'processing' })

    try {
      // Initialize the master analyzer
      console.log('[ANALYZE] Initializing master analyzer...')
      const analyzer = MasterAnalyzer.getInstance()
      
      // Analyze the file
      console.log('[ANALYZE] Starting file analysis...')
      const analysisResult = await analyzer.analyzeReport(fileBuffer)
      
      console.log('[ANALYZE] Analysis completed successfully')

      // Update report with analysis results
      console.log('[ANALYZE] Updating report with results...')
      await db.updateLabReport(labReport.id, {
        status: 'completed',
        analysis_results: analysisResult
      })

      console.log('[ANALYZE] Analysis saved to database')

      return NextResponse.json({
        success: true,
        labReportId: labReport.id,
        analysis: analysisResult,
        message: 'Analysis completed successfully'
      }, {
        headers: {
          ...createRateLimitHeaders(rateLimiter, rateLimitClientId)
        }
      })

    } catch (analysisError) {
      console.error('[ANALYZE] Analysis error:', analysisError)
      console.error('[ANALYZE] Analysis error stack:', analysisError instanceof Error ? analysisError.stack : analysisError)
      
      // Update report status to failed
      await db.updateLabReport(labReport.id, {
        status: 'failed',
        notes: `Analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`
      })

      return NextResponse.json(
        { 
          error: 'Failed to analyze file',
          details: analysisError instanceof Error ? analysisError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('[ANALYZE] Top-level error:', error)
    console.error('[ANALYZE] Top-level error stack:', error instanceof Error ? error.stack : error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze file',
        details: error instanceof Error ? error.message : 'Unknown error'
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
    if (Object.values(require('@/lib/supabase-storage').SupabaseStorageService.BUCKETS).includes(possibleBucket as any)) {
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
