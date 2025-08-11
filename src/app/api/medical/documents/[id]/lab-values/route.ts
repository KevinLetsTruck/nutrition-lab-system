import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

interface Params {
  params: {
    id: string
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params

    // Get lab values for this document
    const labValues = await prisma.labValue.findMany({
      where: { documentId: id },
      orderBy: [
        { confidence: 'desc' },
        { testName: 'asc' }
      ]
    })

    // Get document info for context
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      select: {
        id: true,
        originalFileName: true,
        documentType: true,
        ocrConfidence: true,
        metadata: true
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Group lab values by category for better organization
    const categorized = categorizeLabValues(labValues)

    // Calculate summary statistics
    const stats = {
      totalValues: labValues.length,
      highConfidence: labValues.filter(v => v.confidence >= 0.8).length,
      mediumConfidence: labValues.filter(v => v.confidence >= 0.6 && v.confidence < 0.8).length,
      lowConfidence: labValues.filter(v => v.confidence < 0.6).length,
      flaggedAbnormal: labValues.filter(v => ['high', 'low', 'critical'].includes(v.flag || '')).length,
      withReferenceRanges: labValues.filter(v => v.referenceMin !== null && v.referenceMax !== null).length
    }

    return NextResponse.json({
      document,
      labValues,
      categorized,
      stats,
      message: `Found ${labValues.length} lab values with ${stats.highConfidence} high confidence matches`
    })

  } catch (error) {
    console.error('Lab values API error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve lab values' },
      { status: 500 }
    )
  }
}

function categorizeLabValues(labValues: unknown[]) {
  const categories = {
    metabolic: [],
    lipids: [],
    cbc: [],
    thyroid: [],
    vitamins: [],
    inflammatory: [],
    other: []
  }

  const categoryPatterns = {
    metabolic: ['glucose', 'bun', 'creatinine', 'sodium', 'potassium', 'chloride', 'co2'],
    lipids: ['cholesterol', 'hdl', 'ldl', 'triglycerides'],
    cbc: ['wbc', 'rbc', 'hemoglobin', 'hematocrit', 'platelets'],
    thyroid: ['tsh', 'freeT4', 'freeT3'],
    vitamins: ['vitaminD', 'vitaminB12', 'folate', 'iron', 'ferritin'],
    inflammatory: ['crp', 'esr']
  }

  labValues.forEach(value => {
    let categorized = false
    
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => 
        value.standardName?.includes(pattern) || 
        value.testName.toLowerCase().includes(pattern)
      )) {
        categories[category as keyof typeof categories].push(value)
        categorized = true
        break
      }
    }
    
    if (!categorized) {
      categories.other.push(value)
    }
  })

  return categories
}
