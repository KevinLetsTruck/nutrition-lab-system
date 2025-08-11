import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { functionalAnalyzer } from '@/lib/medical/functional-analysis'

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params

    // Get document with metadata
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      select: {
        id: true,
        originalFileName: true,
        documentType: true,
        metadata: true,
        client: {
          select: { id: true, name: true }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Check if functional analysis has been completed
    const hasAnalysis = document.metadata && 
      typeof document.metadata === 'object' && 
      'functionalAnalysisComplete' in document.metadata

    if (!hasAnalysis) {
      return NextResponse.json(
        { error: 'Functional analysis not yet completed - ensure lab values have been extracted first' },
        { status: 404 }
      )
    }

    // Get lab values for context
    const labValues = await prisma.labValue.findMany({
      where: { documentId: id },
      orderBy: { confidence: 'desc' }
    })

    // Since we're storing analysis results in document metadata, extract them
    const metadata = document.metadata as any
    const analysis = {
      overallHealth: {
        score: metadata.overallHealthScore || 0,
        grade: metadata.healthGrade || 'F',
        summary: `Health grade ${metadata.healthGrade || 'F'} with ${metadata.patternsDetected || 0} patterns detected`
      },
      patternsDetected: metadata.patternsDetected || 0,
      criticalFindings: metadata.criticalFindings || 0,
      dotRiskLevel: metadata.dotRiskLevel || 'low'
    }

    return NextResponse.json({
      document,
      analysis,
      labValues,
      generatedAt: document.metadata,
      message: 'Functional medicine analysis retrieved successfully'
    })

  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analysis' },
      { status: 500 }
    )
  }
}

// Force re-analysis
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = params

    console.log(`🔄 Forcing re-analysis for document: ${id}`)

    // Check if document exists and has lab values
    const document = await prisma.medicalDocument.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const labValuesCount = await prisma.labValue.count({
      where: { documentId: id }
    })

    if (labValuesCount === 0) {
      return NextResponse.json(
        { error: 'No lab values found - please complete lab extraction first' },
        { status: 400 }
      )
    }

    const result = await functionalAnalyzer.analyzeDocument(id)

    return NextResponse.json({
      success: true,
      analysis: result,
      message: 'Analysis completed successfully'
    })

  } catch (error) {
    console.error('Force analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    )
  }
}
