import { NextRequest, NextResponse } from 'next/server'
import { fntpProtocolGenerator } from '@/lib/medical/protocol-generator'
import { prisma } from '@/lib/db/prisma'

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params

    // Get document with metadata to check if protocol exists
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if functional analysis has been completed
    const metadata = document.metadata as any
    const hasAnalysis = metadata && 'functionalAnalysisComplete' in metadata

    if (!hasAnalysis) {
      return NextResponse.json(
        { error: 'Functional analysis not completed - complete analysis first' },
        { status: 404 }
      )
    }

    // Check if protocol already exists
    const hasProtocol = metadata && 'fntpProtocolComplete' in metadata

    if (hasProtocol) {
      // Return existing protocol indication
      return NextResponse.json({
        document,
        protocolExists: true,
        protocolGeneratedAt: metadata.protocolGeneratedAt,
        supplementsRecommended: metadata.supplementsRecommended,
        nutritionPhase: metadata.nutritionPhase,
        message: 'FNTP protocol exists - use POST to regenerate'
      })
    }

    // Generate new protocol
    const protocol = await fntpProtocolGenerator.generateProtocol(id)

    return NextResponse.json({
      protocol,
      document,
      generatedAt: new Date(),
      message: 'FNTP protocol generated successfully'
    })

  } catch (error) {
    console.error('Protocol API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate protocol' },
      { status: 500 }
    )
  }
}

// Force regenerate protocol
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = params

    console.log(`🔄 Regenerating FNTP protocol for document: ${id}`)

    // Check if document exists and has functional analysis
    const document = await prisma.medicalDocument.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const metadata = document.metadata as any
    const hasAnalysis = metadata && 'functionalAnalysisComplete' in metadata

    if (!hasAnalysis) {
      return NextResponse.json(
        { error: 'Functional analysis not completed - complete analysis first' },
        { status: 400 }
      )
    }

    const protocol = await fntpProtocolGenerator.generateProtocol(id)

    return NextResponse.json({
      success: true,
      protocol,
      message: 'FNTP protocol regenerated successfully'
    })

  } catch (error) {
    console.error('Force protocol generation error:', error)
    return NextResponse.json(
      { error: 'Failed to regenerate protocol' },
      { status: 500 }
    )
  }
}
