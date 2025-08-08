import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DocumentProcessor } from '@/lib/services/document-processor'

export async function POST(request: NextRequest) {
  try {
    const { labResultId } = await request.json()

    if (!labResultId) {
      return NextResponse.json(
        { error: 'Lab result ID is required' },
        { status: 400 }
      )
    }

    // Get lab result
    const labResult = await prisma.labResult.findUnique({
      where: { id: labResultId },
      include: {
        client: true
      }
    })

    if (!labResult) {
      return NextResponse.json(
        { error: 'Lab result not found' },
        { status: 404 }
      )
    }

    // Check if file URL exists
    if (!labResult.fileUrl) {
      return NextResponse.json(
        { error: 'No file URL found for this lab result' },
        { status: 400 }
      )
    }

    // Process the document
    const processor = new DocumentProcessor()
    const result = await processor.processLabDocument(
      labResultId,
      labResult.fileUrl,
      labResult.fileType || 'pdf'
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Processing failed' },
        { status: 500 }
      )
    }

    // For backward compatibility, check if we're in simulation mode
    const isSimulation = process.env.OCR_MODE === 'simulation'
    
    if (isSimulation) {
      // Fall back to simulation code for demo purposes
      const labTests = await prisma.labTestCatalog.findMany()
      // Simulation mode - skip real OCR processing
      console.log('Running in simulation mode')
    }

    return NextResponse.json({
      success: true,
      labResultId,
      status: 'completed',
      extractedMarkers: result.extractedData?.markers?.length || 0,
      confidence: result.confidence,
      message: 'Lab results processed successfully'
    })

  } catch (error) {
    console.error('Lab processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process lab results' },
      { status: 500 }
    )
  }
}
