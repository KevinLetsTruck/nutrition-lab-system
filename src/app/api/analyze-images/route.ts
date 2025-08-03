import { NextRequest, NextResponse } from 'next/server'
import DatabaseService from '@/lib/database-service'
import MasterAnalyzer from '@/lib/lab-analyzers/master-analyzer'
import ClaudeClient from '@/lib/claude-client'

const db = DatabaseService.getInstance()

export async function POST(request: NextRequest) {
  console.log('[ANALYZE-IMAGES] ===== Starting image-based analysis =====')
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { 
      fileName, 
      images, 
      metadata,
      clientEmail,
      clientFirstName,
      clientLastName 
    } = body

    console.log('[ANALYZE-IMAGES] Request params:', {
      fileName,
      imageCount: images?.length || 0,
      hasMetadata: !!metadata,
      clientEmail
    })

    // Validate input
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Step 1: Use Claude Vision to extract text from images
    console.log('[ANALYZE-IMAGES] Step 1: Extracting text from images using Claude Vision...')
    
    const claudeClient = ClaudeClient.getInstance()
    
    const systemPrompt = `You are an expert at extracting information from nutrition lab reports. 
    These images are pages from a lab report PDF. Extract ALL text, data, tables, and test results.
    Pay special attention to:
    - Patient information (name, ID, date of birth)
    - Test dates and lab names
    - All numerical results with their units and reference ranges
    - NAQ (Nutritional Assessment Questionnaire) responses and scores
    - Symptom burden graphs and scores
    - Food sensitivity charts (IgG levels)
    - Hormone test results
    - Any graphs or visual data representations
    
    Format the extracted information as structured text that can be easily parsed.
    Start with identifying the type of report (NAQ/NutriQ, KBMO, Dutch, etc).`

    try {
      // Convert images to format expected by Claude
      const pageImages = images.map((img: any) => ({
        base64: img.base64,
        pageNumber: img.pageNumber
      }))

      const extractedText = await claudeClient.analyzePDFPagesAsImages(
        pageImages,
        systemPrompt
      )

      console.log('[ANALYZE-IMAGES] Text extraction complete, length:', extractedText.length)
      console.log('[ANALYZE-IMAGES] First 500 chars:', extractedText.substring(0, 500))

      // Step 2: Create a synthetic PDF buffer for the analyzer
      // The analyzer expects a Buffer, so we'll create a simple text "PDF"
      const syntheticPDF = Buffer.from(extractedText, 'utf-8')

      // Step 3: Run through the standard analysis pipeline
      console.log('[ANALYZE-IMAGES] Step 2: Running standard analysis pipeline...')
      
      const analyzer = MasterAnalyzer.getInstance()
      const analysisResult = await analyzer.analyzeReport(syntheticPDF)

      console.log('[ANALYZE-IMAGES] Analysis complete:', {
        reportType: analysisResult.reportType,
        processingTime: analysisResult.processingTime,
        confidence: analysisResult.confidence
      })

      // Step 4: Database operations would happen here if needed
      // For now, just log the client info
      console.log('[ANALYZE-IMAGES] Client info provided:', {
        email: clientEmail,
        firstName: clientFirstName,
        lastName: clientLastName
      })

      // Step 5: Generate summary
      const summary = analyzer.getAnalysisSummary(analysisResult)

      const response = {
        success: true,
        fileName,
        analysis: analysisResult,
        summary,
        processingTime: Date.now() - startTime,
        message: 'Image-based analysis completed successfully',
        metadata: {
          ...metadata,
          imagesProcessed: images.length,
          textExtractedLength: extractedText.length
        }
      }

      console.log('[ANALYZE-IMAGES] ===== Analysis complete =====', {
        processingTime: response.processingTime,
        reportType: analysisResult.reportType
      })

      return NextResponse.json(response)

    } catch (analysisError) {
      console.error('[ANALYZE-IMAGES] Analysis error:', analysisError)
      
      return NextResponse.json(
        {
          error: 'Analysis failed',
          details: analysisError instanceof Error ? analysisError.message : 'Unknown error',
          errorType: analysisError instanceof Error ? analysisError.constructor.name : 'UnknownError'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[ANALYZE-IMAGES] Request error:', error)
    
    return NextResponse.json(
      {
        error: 'Invalid request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 400 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Image-based document analysis',
    status: 'ready',
    accepts: 'Base64 encoded images from PDF pages',
    features: [
      'Scanned document support',
      'Multi-page analysis',
      'Automatic text extraction',
      'Lab report type detection'
    ]
  })
}