import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import DatabaseService from '@/lib/database-service'
import { getRateLimiter, getClientIdentifier, createRateLimitHeaders } from '@/lib/rate-limiter'

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

    const { filename, clientEmail, clientFirstName, clientLastName } = await request.json()
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      )
    }

    if (!clientEmail) {
      return NextResponse.json(
        { error: 'Client email is required' },
        { status: 400 }
      )
    }

    // For now, we'll analyze the file content directly since we're not saving to filesystem
    // In production, you'd retrieve the file from cloud storage here
    console.log('Analyzing file:', filename)
    
    // TODO: In production, implement cloud storage retrieval here
    // For example: const pdfBuffer = await getFileFromSupabaseStorage(filename)
    
    // For now, we'll return an error since we need the actual file content
    return NextResponse.json(
      { 
        error: 'File analysis requires actual file content',
        details: 'In production, implement cloud storage integration to retrieve uploaded files'
      },
      { status: 501 }
    )
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
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
      message: 'Analysis endpoint ready'
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
