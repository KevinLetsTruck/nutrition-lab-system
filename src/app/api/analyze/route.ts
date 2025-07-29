import { NextRequest, NextResponse } from 'next/server'
import { loadFile } from '@/lib/file-utils'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import DatabaseService from '@/lib/database-service'
import { getRateLimiter, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter'
import { db } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimiter = getRateLimiter('analyze')
    const rateLimitClientId = getClientIdentifier(request)
    
    if (!rateLimiter.isAllowed(rateLimitClientId)) {
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
        labReport = await db.getLabReportById(labReportId)
        if (!labReport) {
          return NextResponse.json(
            { error: 'Lab report not found' },
            { status: 404 }
          )
        }

        // Download file from Supabase Storage
        if (labReport.file_path) {
          // Extract bucket from file path or use default
          const bucket = determineBucketFromPath(labReport.file_path, labReport.report_type)
          fileBuffer = await loadFile(bucket, labReport.file_path)
          
          if (!fileBuffer) {
            return NextResponse.json(
              { error: 'Failed to retrieve file from storage' },
              { status: 500 }
            )
          }
        } else {
          return NextResponse.json(
            { error: 'No file path found for this lab report' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('Error retrieving lab report:', error)
        return NextResponse.json(
          { error: 'Failed to retrieve lab report' },
          { status: 500 }
        )
      }
    } else {
      // For backward compatibility, if filename is provided directly
      return NextResponse.json(
        { error: 'Direct filename analysis is deprecated. Please use labReportId.' },
        { status: 400 }
      )
    }

    // Update report status to processing
    await db.updateLabReport(labReport.id, { status: 'processing' })

    try {
      // Initialize the master analyzer
      const analyzer = MasterAnalyzer.getInstance()
      
      // Analyze the file
      const analysisResult = await analyzer.analyzeReport(fileBuffer)

      // Update report with analysis results
      await db.updateLabReport(labReport.id, {
        status: 'completed',
        analysis_results: analysisResult
      })

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
      console.error('Analysis error:', analysisError)
      
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
    console.error('Analysis error:', error)
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
  // If path contains bucket information, extract it
  if (filePath.includes('/')) {
    const pathParts = filePath.split('/')
    // Check if first part is a bucket name
    const possibleBucket = pathParts[0]
    if (Object.values(require('@/lib/supabase-storage').SupabaseStorageService.BUCKETS).includes(possibleBucket as any)) {
      return possibleBucket
    }
  }
  
  // Fallback to bucket based on report type
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
