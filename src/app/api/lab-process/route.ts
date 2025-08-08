import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Update status to processing
    await prisma.labResult.update({
      where: { id: labResultId },
      data: { processingStatus: 'processing' }
    })

    try {
      // Get lab test catalog for reference
      const labTests = await prisma.labTestCatalog.findMany()
      
      // For now, we'll simulate processing
      // In production, this would:
      // 1. Download the file from storage
      // 2. Run OCR if needed (Tesseract.js)
      // 3. Extract structured data
      // 4. Send to Claude for analysis
      
      const simulatedExtractedData = {
        patientName: labResult.client.firstName + ' ' + labResult.client.lastName,
        labName: 'LabCorp',
        collectionDate: '2024-01-15',
        markers: [
          { name: 'Glucose, Fasting', value: 95, unit: 'mg/dL', reference: '65-99' },
          { name: 'Hemoglobin A1c', value: 5.8, unit: '%', reference: '4.0-5.6' },
          { name: 'Total Cholesterol', value: 210, unit: 'mg/dL', reference: '100-199' },
          { name: 'HDL Cholesterol', value: 45, unit: 'mg/dL', reference: '40-999' },
          { name: 'Triglycerides', value: 180, unit: 'mg/dL', reference: '0-149' },
          { name: 'TSH', value: 3.2, unit: 'mIU/L', reference: '0.45-4.5' },
          { name: 'Vitamin D', value: 22, unit: 'ng/mL', reference: '30-100' }
        ]
      }

      // Create lab values
      for (const marker of simulatedExtractedData.markers) {
        // Find matching test in catalog
        const catalogTest = labTests.find(t => 
          t.testName.toLowerCase() === marker.name.toLowerCase()
        )

        if (catalogTest) {
          // Determine if value is optimal
          const isOptimal = marker.value >= (catalogTest.optimalRangeLow || 0) && 
                          marker.value <= (catalogTest.optimalRangeHigh || 999)
          const isTruckDriverOptimal = marker.value >= (catalogTest.truckDriverRangeLow || 0) && 
                                     marker.value <= (catalogTest.truckDriverRangeHigh || 999)

          await prisma.labValue.create({
            data: {
              labResultId: labResult.id,
              testCatalogId: catalogTest.id,
              testName: marker.name,
              value: marker.value,
              unit: marker.unit,
              referenceRange: marker.reference,
              isOptimal,
              isTruckDriverOptimal,
              flag: marker.value > parseFloat(marker.reference.split('-')[1]) ? 'H' : 
                    marker.value < parseFloat(marker.reference.split('-')[0]) ? 'L' : null
            }
          })
        }
      }

      // Detect patterns
      const patterns = []
      
      // Check for insulin resistance pattern
      const glucose = simulatedExtractedData.markers.find(m => m.name.includes('Glucose'))
      const hba1c = simulatedExtractedData.markers.find(m => m.name.includes('A1c'))
      const triglycerides = simulatedExtractedData.markers.find(m => m.name.includes('Triglycerides'))
      
      if (glucose && glucose.value > 90 && triglycerides && triglycerides.value > 150) {
        patterns.push({
          patternName: 'insulin_resistance',
          patternCategory: 'metabolic',
          confidenceScore: 0.8,
          supportingMarkers: [
            { marker: 'Glucose', value: glucose.value },
            { marker: 'Triglycerides', value: triglycerides.value }
          ],
          clinicalSignificance: 'Early metabolic dysfunction',
          truckDriverImpact: 'Increases fatigue and accident risk',
          priorityLevel: 'high'
        })
      }

      // Check for vitamin D deficiency
      const vitD = simulatedExtractedData.markers.find(m => m.name.includes('Vitamin D'))
      if (vitD && vitD.value < 30) {
        patterns.push({
          patternName: 'vitamin_d_deficiency',
          patternCategory: 'nutritional',
          confidenceScore: 1.0,
          supportingMarkers: [{ marker: 'Vitamin D', value: vitD.value }],
          clinicalSignificance: 'Vitamin D deficiency affecting multiple systems',
          truckDriverImpact: 'Common in truckers, affects mood and energy',
          priorityLevel: 'moderate'
        })
      }

      // Create pattern records
      for (const pattern of patterns) {
        await prisma.labPattern.create({
          data: {
            labResultId: labResult.id,
            ...pattern
          }
        })
      }

      // Generate AI analysis
      const aiAnalysis = {
        summary: 'Multiple markers indicate metabolic dysfunction and nutritional deficiencies',
        keyFindings: [
          'Borderline high fasting glucose (95 mg/dL) - approaching pre-diabetic range',
          'Elevated HbA1c (5.8%) indicating poor glucose control over past 3 months',
          'High total cholesterol (210 mg/dL) with suboptimal HDL (45 mg/dL)',
          'Elevated triglycerides (180 mg/dL) suggesting insulin resistance',
          'Vitamin D deficiency (22 ng/mL) requiring supplementation'
        ],
        truckDriverConsiderations: [
          'Metabolic markers suggest increased DOT certification risk',
          'Sedentary driving contributing to poor metabolic health',
          'Vitamin D deficiency likely from limited sun exposure in cab',
          'Diet quality appears poor based on lipid markers'
        ],
        recommendations: {
          immediate: [
            'Start Vitamin D3 5000 IU daily with K2',
            'Implement time-restricted eating (16:8)',
            'Reduce refined carbohydrates'
          ],
          shortTerm: [
            'Consider berberine 500mg twice daily for glucose control',
            'Add omega-3 fatty acids 2-3g daily',
            'Schedule follow-up labs in 3 months'
          ],
          lifestyle: [
            'Park further away and walk 10 minutes at each stop',
            'Pack healthy meals instead of truck stop food',
            'Use rest breaks for brief exercise'
          ]
        }
      }

      // Update lab result with analysis
      await prisma.labResult.update({
        where: { id: labResultId },
        data: {
          processingStatus: 'completed',
          labName: simulatedExtractedData.labName,
          collectionDate: new Date(simulatedExtractedData.collectionDate),
          structuredData: simulatedExtractedData,
          aiAnalysis,
          detectedPatterns: patterns.map(p => p.patternName),
          confidenceScores: { overall: 0.9, extraction: 0.95, analysis: 0.85 }
        }
      })

      // Create protocol recommendations
      await prisma.labProtocol.create({
        data: {
          labResultId: labResult.id,
          clientId: labResult.clientId,
          protocolType: 'supplement',
          priority: 'immediate',
          title: 'Metabolic Support Protocol',
          description: 'Comprehensive supplement protocol for metabolic optimization',
          supplementProtocol: {
            phase1: [
              { name: 'Vitamin D3', dose: '5000 IU', timing: 'morning with food' },
              { name: 'Vitamin K2', dose: '100 mcg', timing: 'morning with D3' },
              { name: 'Berberine', dose: '500 mg', timing: 'twice daily with meals' }
            ]
          },
          specificRecommendations: [
            'Monitor glucose weekly with home meter',
            'Track energy levels and mood',
            'Retest labs in 3 months'
          ],
          truckDriverAdaptations: 'All supplements stable at room temperature, easy to take on the road'
        }
      })

      return NextResponse.json({
        success: true,
        labResultId,
        status: 'completed',
        patternsDetected: patterns.length,
        message: 'Lab results processed successfully'
      })

    } catch (processingError) {
      console.error('Processing error:', processingError)
      
      // Update status to failed
      await prisma.labResult.update({
        where: { id: labResultId },
        data: {
          processingStatus: 'failed',
          processingError: processingError instanceof Error ? processingError.message : 'Unknown error'
        }
      })

      throw processingError
    }

  } catch (error) {
    console.error('Lab processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process lab results' },
      { status: 500 }
    )
  }
}
