#!/usr/bin/env tsx

/**
 * Medical System Foundation Verification Script
 * 
 * Verifies database connection, schema, and basic operations
 */

import { PrismaClient } from '@prisma/client'
import { exit } from 'process'

const prisma = new PrismaClient()

interface VerificationResult {
  success: boolean
  message: string
  details?: any
}

async function verifyDatabaseConnection(): Promise<VerificationResult> {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    return { success: true, message: 'Database connection working' }
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return { 
      success: false, 
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function verifyMedicalTables(): Promise<VerificationResult> {
  const results: Record<string, boolean> = {}
  
  try {
    // Test MedicalDocument table
    try {
      await prisma.medicalDocument.findMany({ take: 1 })
      results.medicalDocument = true
      console.log('✅ MedicalDocument table exists')
    } catch (error) {
      results.medicalDocument = false
      console.error('❌ MedicalDocument table missing or inaccessible')
    }

    // Test MedicalLabValue table
    try {
      await prisma.medicalLabValue.findMany({ take: 1 })
      results.medicalLabValue = true
      console.log('✅ MedicalLabValue table exists')
    } catch (error) {
      results.medicalLabValue = false
      console.error('❌ MedicalLabValue table missing or inaccessible')
    }

    // Test MedicalDocAnalysis table
    try {
      await prisma.medicalDocAnalysis.findMany({ take: 1 })
      results.medicalDocAnalysis = true
      console.log('✅ MedicalDocAnalysis table exists')
    } catch (error) {
      results.medicalDocAnalysis = false
      console.error('❌ MedicalDocAnalysis table missing or inaccessible')
    }

    // Test MedicalProcessingQueue table
    try {
      await prisma.medicalProcessingQueue.findMany({ take: 1 })
      results.medicalProcessingQueue = true
      console.log('✅ MedicalProcessingQueue table exists')
    } catch (error) {
      results.medicalProcessingQueue = false
      console.error('❌ MedicalProcessingQueue table missing or inaccessible')
    }

    // Test Client table (existing)
    try {
      await prisma.client.findMany({ take: 1 })
      results.client = true
      console.log('✅ Client table exists')
    } catch (error) {
      results.client = false
      console.error('❌ Client table missing or inaccessible')
    }

    const allTablesExist = Object.values(results).every(exists => exists)
    
    return {
      success: allTablesExist,
      message: allTablesExist ? 'All medical tables exist' : 'Some medical tables are missing',
      details: results
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to verify tables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testBasicCRUDOperations(): Promise<VerificationResult> {
  try {
    console.log('\n🧪 Testing basic CRUD operations...')

    // Create test document
    const testDoc = await prisma.medicalDocument.create({
      data: {
        documentType: 'TEST_VERIFICATION',
        originalFileName: 'test-verification.pdf',
        status: 'PENDING',
        metadata: {
          testMode: true,
          createdBy: 'verification-script',
          timestamp: new Date().toISOString()
        }
      }
    })
    console.log(`✅ CREATE: Created test document ${testDoc.id}`)

    // Read test document
    const readDoc = await prisma.medicalDocument.findUnique({
      where: { id: testDoc.id }
    })
    if (!readDoc) {
      throw new Error('Failed to read created document')
    }
    console.log(`✅ READ: Successfully read document ${readDoc.id}`)

    // Update test document
    const updatedDoc = await prisma.medicalDocument.update({
      where: { id: testDoc.id },
      data: { 
        status: 'COMPLETED',
        processedAt: new Date()
      }
    })
    console.log(`✅ UPDATE: Updated document status to ${updatedDoc.status}`)

    // Delete test document
    await prisma.medicalDocument.delete({
      where: { id: testDoc.id }
    })
    console.log(`✅ DELETE: Removed test document ${testDoc.id}`)

    return {
      success: true,
      message: 'Basic CRUD operations working correctly'
    }
  } catch (error) {
    console.error('❌ CRUD operations failed:', error)
    return {
      success: false,
      message: 'CRUD operations failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testRelationships(): Promise<VerificationResult> {
  try {
    console.log('\n🔗 Testing table relationships...')

    // Get a client to test relationships
    const existingClient = await prisma.client.findFirst()
    
    if (!existingClient) {
      console.log('⚠️ No existing clients found, skipping relationship test')
      return {
        success: true,
        message: 'No clients to test relationships with'
      }
    }

    // Create document with client relationship
    const testDoc = await prisma.medicalDocument.create({
      data: {
        clientId: existingClient.id,
        documentType: 'RELATIONSHIP_TEST',
        originalFileName: 'relationship-test.pdf',
        status: 'PENDING',
        metadata: { testMode: true }
      }
    })

    // Test client -> medical documents relationship
    const clientWithDocs = await prisma.client.findUnique({
      where: { id: existingClient.id },
      include: { medicalDocuments: true }
    })

    const hasRelationship = clientWithDocs?.medicalDocuments.some(doc => doc.id === testDoc.id)
    
    if (!hasRelationship) {
      throw new Error('Client -> MedicalDocument relationship not working')
    }

    console.log(`✅ RELATIONSHIP: Client -> MedicalDocument working`)

    // Clean up
    await prisma.medicalDocument.delete({
      where: { id: testDoc.id }
    })

    return {
      success: true,
      message: 'Table relationships working correctly'
    }
  } catch (error) {
    console.error('❌ Relationship test failed:', error)
    return {
      success: false,
      message: 'Relationship test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function generateReport(results: VerificationResult[]): Promise<void> {
  const timestamp = new Date().toISOString()
  const allSuccess = results.every(result => result.success)
  
  const report = {
    timestamp,
    overallStatus: allSuccess ? 'PASS' : 'FAIL',
    results: results.map(r => ({
      test: r.message,
      status: r.success ? 'PASS' : 'FAIL',
      details: r.details
    }))
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 MEDICAL SYSTEM VERIFICATION REPORT')
  console.log('='.repeat(60))
  console.log(`Timestamp: ${timestamp}`)
  console.log(`Overall Status: ${report.overallStatus}`)
  console.log('\nTest Results:')
  
  report.results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌'
    console.log(`${icon} ${result.test}: ${result.status}`)
    if (result.details && result.status === 'FAIL') {
      console.log(`   Details: ${result.details}`)
    }
  })

  // Save to file
  const reportContent = `# Medical System Verification Report

Generated: ${timestamp}

## Overall Status: ${report.overallStatus}

## Test Results

${report.results.map(result => 
  `- **${result.test}**: ${result.status}\n${result.details && result.status === 'FAIL' ? `  - Details: ${result.details}\n` : ''}`
).join('\n')}

## Next Steps

${allSuccess 
  ? '✅ All tests passed! The medical system foundation is working correctly.' 
  : '❌ Some tests failed. Review the details above and fix issues before proceeding.'
}
`

  const fs = require('fs')
  fs.writeFileSync('medical-system-status.md', reportContent)
  console.log('\n📄 Report saved to medical-system-status.md')
}

async function main() {
  console.log('🏥 Starting Medical System Foundation Verification...\n')

  const results: VerificationResult[] = []

  // 1. Test database connection
  console.log('1️⃣ Testing database connection...')
  results.push(await verifyDatabaseConnection())

  // 2. Verify medical tables exist
  console.log('\n2️⃣ Verifying medical tables...')
  results.push(await verifyMedicalTables())

  // 3. Test basic CRUD operations
  results.push(await testBasicCRUDOperations())

  // 4. Test relationships
  results.push(await testRelationships())

  // Generate and display report
  await generateReport(results)

  // Cleanup
  await prisma.$disconnect()

  // Exit with appropriate code
  const allSuccess = results.every(result => result.success)
  process.exit(allSuccess ? 0 : 1)
}

main().catch(error => {
  console.error('💥 Verification script failed:', error)
  process.exit(1)
})
