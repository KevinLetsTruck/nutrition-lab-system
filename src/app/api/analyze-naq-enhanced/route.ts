import { NextRequest, NextResponse } from 'next/server'
import NutriQAnalyzer from '@/lib/lab-analyzers/nutriq-analyzer'
import DatabaseService from '@/lib/database-service'

const nutriqAnalyzer = NutriQAnalyzer.getInstance()
const db = DatabaseService.getInstance()

export async function POST(request: NextRequest) {
  console.log('[ANALYZE-NAQ-ENHANCED] Starting enhanced NAQ analysis...')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Get client data from form
    const clientData = {
      clientName: formData.get('clientName') as string || '',
      clientEmail: formData.get('clientEmail') as string || '',
      dateOfBirth: formData.get('dateOfBirth') as string || '',
      reportDate: formData.get('reportDate') as string || new Date().toISOString()
    }
    
    console.log('[ANALYZE-NAQ-ENHANCED] Processing file:', file.name)
    console.log('[ANALYZE-NAQ-ENHANCED] Client data:', clientData)
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Analyze with enhanced NAQ system
    const result = await nutriqAnalyzer.analyzeNutriQReportWithClientPriority(
      buffer,
      clientData as any
    )
    
    // Save to database if needed
    if (result.clientData.clientId) {
      try {
        await db.saveNutriQAnalysis(
          result.clientData.clientId,
          result.nutriqAnalysis,
          {
            fileName: file.name,
            analysisDate: new Date(),
            comprehensiveReport: result.comprehensiveReport
          }
        )
      } catch (dbError) {
        console.error('[ANALYZE-NAQ-ENHANCED] Database save error:', dbError)
      }
    }
    
    // Return the enhanced analysis
    return NextResponse.json({
      success: true,
      basicAnalysis: result.nutriqAnalysis,
      comprehensiveReport: result.comprehensiveReport,
      clientData: result.clientData,
      patterns: result.comprehensiveReport?.functionalMedicinePatterns || [],
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        analysisDate: new Date().toISOString(),
        reportVersion: result.comprehensiveReport?.metadata.reportVersion || '2.0'
      }
    })
    
  } catch (error) {
    console.error('[ANALYZE-NAQ-ENHANCED] Analysis error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to analyze NAQ report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Example usage endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Enhanced NAQ Analysis Endpoint',
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        file: 'NAQ PDF file (required)',
        clientName: 'Client full name (optional)',
        clientEmail: 'Client email (optional)',
        dateOfBirth: 'Client DOB (optional)',
        reportDate: 'Report date (optional)'
      },
      response: {
        success: 'boolean',
        basicAnalysis: 'Traditional NAQ analysis with body system scores',
        comprehensiveReport: 'Full functional medicine report with patterns, root causes, and protocols',
        patterns: 'Array of identified functional medicine patterns',
        metadata: 'File and analysis information'
      }
    },
    example: {
      curlCommand: `
curl -X POST http://localhost:3000/api/analyze-naq-enhanced \\
  -F "file=@/path/to/naq-report.pdf" \\
  -F "clientName=Carole Corkadel" \\
  -F "clientEmail=carole@example.com"
      `.trim()
    }
  })
}