import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const labResult = await prisma.labResult.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        labValues: {
          include: {
            testCatalog: true
          },
          orderBy: {
            testName: 'asc'
          }
        },
        labPatterns: {
          orderBy: {
            confidenceScore: 'desc'
          }
        },
        labProtocols: {
          orderBy: {
            priority: 'asc'
          }
        }
      }
    })

    if (!labResult) {
      return NextResponse.json(
        { error: 'Lab result not found' },
        { status: 404 }
      )
    }

    // Transform the data for the frontend
    const transformedResult = {
      id: labResult.id,
      processingStatus: labResult.processingStatus,
      labName: labResult.labName,
      collectionDate: labResult.collectionDate,
      aiAnalysis: labResult.aiAnalysis || {
        summary: 'Analysis pending...',
        keyFindings: [],
        truckDriverConsiderations: [],
        recommendations: {
          immediate: [],
          shortTerm: [],
          lifestyle: []
        }
      },
      labValues: labResult.labValues.map(value => ({
        testName: value.testName,
        value: value.value,
        unit: value.unit,
        referenceRange: value.referenceRange,
        flag: value.flag,
        isOptimal: value.isOptimal,
        isTruckDriverOptimal: value.isTruckDriverOptimal,
        testCatalog: value.testCatalog ? {
          optimalRangeLow: value.testCatalog.optimalRangeLow,
          optimalRangeHigh: value.testCatalog.optimalRangeHigh,
          clinicalSignificance: value.testCatalog.clinicalSignificance,
          truckDriverConsiderations: value.testCatalog.truckDriverConsiderations
        } : null
      })),
      patterns: labResult.labPatterns.map(pattern => ({
        patternName: pattern.patternName,
        patternCategory: pattern.patternCategory,
        confidenceScore: pattern.confidenceScore,
        clinicalSignificance: pattern.clinicalSignificance,
        truckDriverImpact: pattern.truckDriverImpact,
        priorityLevel: pattern.priorityLevel
      })),
      protocols: labResult.labProtocols.map(protocol => ({
        protocolType: protocol.protocolType,
        title: protocol.title,
        description: protocol.description,
        priority: protocol.priority,
        supplementProtocol: protocol.supplementProtocol,
        specificRecommendations: protocol.specificRecommendations,
        truckDriverAdaptations: protocol.truckDriverAdaptations
      }))
    }

    return NextResponse.json(transformedResult)

  } catch (error) {
    console.error('Error fetching lab result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lab result' },
      { status: 500 }
    )
  }
}
