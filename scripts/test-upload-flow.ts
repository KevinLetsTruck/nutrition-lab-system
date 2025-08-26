#!/usr/bin/env tsx

/**
 * Medical Document Upload Flow Test
 * 
 * Tests the complete upload workflow from API to database
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TestResult {
  step: string
  success: boolean
  message: string
  details?: any
}

async function createTestDocument(): Promise<TestResult> {
  try {
    const testDoc = await prisma.medicalDocument.create({
      data: {
        documentType: 'LAB_REPORT',
        originalFileName: 'test-lab-report.pdf',
        s3Key: 'test-uploads/test-lab-report.pdf',
        s3Url: 'https://test-bucket.s3.amazonaws.com/test-uploads/test-lab-report.pdf',
        status: 'PENDING',
        metadata: {
          testMode: true,
          uploadFlow: 'test',
          fileSize: 1024567,
          mimeType: 'application/pdf',
          createdAt: new Date().toISOString()
        }
      }
    })

    console.log(`✅ Created test document: ${testDoc.id}`)
    
    return {
      step: 'Create Document',
      success: true,
      message: `Successfully created document ${testDoc.id}`,
      details: { documentId: testDoc.id }
    }
  } catch (error) {
    console.error('❌ Failed to create test document:', error)
    return {
      step: 'Create Document',
      success: false,
      message: 'Failed to create document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function readTestDocument(documentId: string): Promise<TestResult> {
  try {
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
      include: {
        labValues: true,
        analysis: true
      }
    })

    if (!document) {
      throw new Error('Document not found')
    }

    console.log(`✅ Read document: ${document.originalFileName}`)
    console.log(`   Status: ${document.status}`)
    console.log(`   Lab Values: ${document.labValues.length}`)
    console.log(`   Analysis: ${document.analysis ? 'Yes' : 'No'}`)

    return {
      step: 'Read Document',
      success: true,
      message: `Successfully read document ${documentId}`,
      details: {
        fileName: document.originalFileName,
        status: document.status,
        labValuesCount: document.labValues.length,
        hasAnalysis: !!document.analysis
      }
    }
  } catch (error) {
    console.error('❌ Failed to read document:', error)
    return {
      step: 'Read Document',
      success: false,
      message: 'Failed to read document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function updateDocumentStatus(documentId: string): Promise<TestResult> {
  try {
    const updatedDoc = await prisma.medicalDocument.update({
      where: { id: documentId },
      data: {
        status: 'PROCESSING',
        processedAt: new Date(),
        ocrText: 'Sample extracted text from OCR processing...',
        ocrConfidence: 0.95
      }
    })

    console.log(`✅ Updated document status to: ${updatedDoc.status}`)
    console.log(`   OCR Confidence: ${updatedDoc.ocrConfidence}`)

    return {
      step: 'Update Document',
      success: true,
      message: `Successfully updated document to ${updatedDoc.status}`,
      details: {
        newStatus: updatedDoc.status,
        ocrConfidence: updatedDoc.ocrConfidence
      }
    }
  } catch (error) {
    console.error('❌ Failed to update document:', error)
    return {
      step: 'Update Document',
      success: false,
      message: 'Failed to update document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function addTestLabValues(documentId: string): Promise<TestResult> {
  try {
    const labValues = await prisma.$transaction([
      prisma.medicalLabValue.create({
        data: {
          documentId,
          testName: 'Vitamin D',
          value: 25.5,
          unit: 'ng/mL',
          referenceMin: 30,
          referenceMax: 100,
          functionalMin: 50,
          functionalMax: 80,
          flag: 'low',
          labSource: 'LabCorp',
          confidence: 0.98
        }
      }),
      prisma.medicalLabValue.create({
        data: {
          documentId,
          testName: 'B12',
          value: 450,
          unit: 'pg/mL',
          referenceMin: 300,
          referenceMax: 900,
          functionalMin: 400,
          functionalMax: 800,
          flag: 'normal',
          labSource: 'LabCorp',
          confidence: 0.99
        }
      })
    ])

    console.log(`✅ Added ${labValues.length} lab values`)
    labValues.forEach(lv => {
      console.log(`   ${lv.testName}: ${lv.value} ${lv.unit} (${lv.flag})`)
    })

    return {
      step: 'Add Lab Values',
      success: true,
      message: `Successfully added ${labValues.length} lab values`,
      details: {
        labValuesCount: labValues.length,
        tests: labValues.map(lv => ({
          name: lv.testName,
          value: lv.value,
          unit: lv.unit,
          flag: lv.flag
        }))
      }
    }
  } catch (error) {
    console.error('❌ Failed to add lab values:', error)
    return {
      step: 'Add Lab Values',
      success: false,
      message: 'Failed to add lab values',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function addTestAnalysis(documentId: string): Promise<TestResult> {
  try {
    const analysis = await prisma.medicalDocAnalysis.create({
      data: {
        documentId,
        patterns: {
          detected: ['vitamin_deficiency', 'nutrient_imbalance'],
          confidence: 0.87
        },
        rootCauses: {
          identified: ['insufficient_sun_exposure', 'dietary_insufficiency'],
          potential: ['malabsorption', 'genetic_factors']
        },
        criticalValues: {
          count: 1,
          values: ['Vitamin D: 25.5 ng/mL (Low)']
        },
        functionalStatus: {
          assessment: 'suboptimal',
          systems: ['endocrine', 'immune']
        },
        recommendations: {
          immediate: ['Vitamin D supplementation', 'Sun exposure increase'],
          longTerm: ['Dietary optimization', 'Follow-up testing'],
          followUp: ['Retest in 3 months']
        }
      }
    })

    console.log(`✅ Added analysis: ${analysis.id}`)
    console.log(`   Patterns detected: ${JSON.stringify(analysis.patterns)}`)

    return {
      step: 'Add Analysis',
      success: true,
      message: `Successfully added analysis ${analysis.id}`,
      details: {
        analysisId: analysis.id,
        patterns: analysis.patterns,
        recommendations: analysis.recommendations
      }
    }
  } catch (error) {
    console.error('❌ Failed to add analysis:', error)
    return {
      step: 'Add Analysis',
      success: false,
      message: 'Failed to add analysis',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function addProcessingQueue(documentId: string): Promise<TestResult> {
  try {
    const queueEntry = await prisma.medicalProcessingQueue.create({
      data: {
        documentId,
        jobType: 'analysis',
        priority: 5,
        status: 'COMPLETED',
        attempts: 1,
        startedAt: new Date(Date.now() - 5000),
        completedAt: new Date()
      }
    })

    console.log(`✅ Added queue entry: ${queueEntry.id}`)
    console.log(`   Job type: ${queueEntry.jobType}`)
    console.log(`   Status: ${queueEntry.status}`)

    return {
      step: 'Add Queue Entry',
      success: true,
      message: `Successfully added queue entry ${queueEntry.id}`,
      details: {
        queueId: queueEntry.id,
        jobType: queueEntry.jobType,
        status: queueEntry.status
      }
    }
  } catch (error) {
    console.error('❌ Failed to add queue entry:', error)
    return {
      step: 'Add Queue Entry',
      success: false,
      message: 'Failed to add queue entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function cleanupTestData(documentId: string): Promise<TestResult> {
  try {
    // Delete in correct order due to foreign key constraints
    await prisma.medicalProcessingQueue.deleteMany({
      where: { documentId }
    })

    await prisma.medicalDocAnalysis.deleteMany({
      where: { documentId }
    })

    await prisma.medicalLabValue.deleteMany({
      where: { documentId }
    })

    await prisma.medicalDocument.delete({
      where: { id: documentId }
    })

    console.log(`✅ Cleaned up test data for document: ${documentId}`)

    return {
      step: 'Cleanup',
      success: true,
      message: `Successfully cleaned up test data`,
      details: { documentId }
    }
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error)
    return {
      step: 'Cleanup',
      success: false,
      message: 'Failed to cleanup test data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function generateReport(results: TestResult[]): Promise<void> {
  const timestamp = new Date().toISOString()
  const allSuccess = results.every(result => result.success)

  console.log('\n' + '='.repeat(60))
  console.log('📊 MEDICAL UPLOAD FLOW TEST REPORT')
  console.log('='.repeat(60))
  console.log(`Timestamp: ${timestamp}`)
  console.log(`Overall Status: ${allSuccess ? 'PASS' : 'FAIL'}`)
  console.log('\nFlow Steps:')
  
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌'
    console.log(`${index + 1}. ${icon} ${result.step}: ${result.success ? 'PASS' : 'FAIL'}`)
    if (!result.success) {
      console.log(`   Error: ${result.message}`)
      if (result.details) {
        console.log(`   Details: ${result.details}`)
      }
    }
  })

  console.log(`\n${allSuccess ? '🎉' : '💥'} Upload flow test ${allSuccess ? 'completed successfully' : 'failed'}!`)
}

async function main() {
  console.log('🧪 Starting Medical Document Upload Flow Test...\n')

  const results: TestResult[] = []
  let documentId: string | null = null

  try {
    // 1. Create test document
    console.log('1️⃣ Creating test document...')
    const createResult = await createTestDocument()
    results.push(createResult)
    
    if (createResult.success && createResult.details?.documentId) {
      documentId = createResult.details.documentId

      // 2. Read the document
      console.log('\n2️⃣ Reading test document...')
      results.push(await readTestDocument(documentId))

      // 3. Update document status
      console.log('\n3️⃣ Updating document status...')
      results.push(await updateDocumentStatus(documentId))

      // 4. Add lab values
      console.log('\n4️⃣ Adding test lab values...')
      results.push(await addTestLabValues(documentId))

      // 5. Add analysis
      console.log('\n5️⃣ Adding test analysis...')
      results.push(await addTestAnalysis(documentId))

      // 6. Add processing queue entry
      console.log('\n6️⃣ Adding processing queue entry...')
      results.push(await addProcessingQueue(documentId))

      // 7. Cleanup
      console.log('\n7️⃣ Cleaning up test data...')
      results.push(await cleanupTestData(documentId))
    }

    // Generate report
    await generateReport(results)

  } catch (error) {
    console.error('💥 Upload flow test failed:', error)
    
    // Attempt cleanup if we have a document ID
    if (documentId) {
      console.log('\n🧹 Attempting emergency cleanup...')
      await cleanupTestData(documentId)
    }
  } finally {
    await prisma.$disconnect()
  }

  // Exit with appropriate code
  const allSuccess = results.every(result => result.success)
  process.exit(allSuccess ? 0 : 1)
}

main().catch(error => {
  console.error('💥 Upload flow test script failed:', error)
  process.exit(1)
})
