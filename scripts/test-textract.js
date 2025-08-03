require('dotenv').config({ path: '.env.local' })
const fs = require('fs')
const path = require('path')

async function testTextract() {
  console.log('=== Testing AWS Textract Configuration ===\n')

  // Check environment variables
  const hasAWSCreds = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  console.log('AWS Credentials configured:', hasAWSCreds ? '✓' : '✗')
  
  if (!hasAWSCreds) {
    console.log('\nPlease configure AWS credentials in .env.local:')
    console.log('AWS_ACCESS_KEY_ID=your_key_here')
    console.log('AWS_SECRET_ACCESS_KEY=your_secret_here')
    console.log('AWS_REGION=us-east-1')
    return
  }

  console.log('AWS Region:', process.env.AWS_REGION || 'us-east-1')
  console.log('\nTesting Textract connection...\n')

  try {
    // Import the processor
    const { TextractProcessor } = require('../src/lib/document-processors/textract-processor')
    const processor = new TextractProcessor()

    // Create a simple test document
    const testText = `
PATIENT INFORMATION
Name: Test Patient
Date of Birth: 01/01/1990
Patient ID: TEST123

TEST RESULTS
Test Name       Result      Reference Range
Glucose         95 mg/dL    70-100 mg/dL
Hemoglobin      14.5 g/dL   12-16 g/dL
    `.trim()

    console.log('Creating test PDF...')
    const testPDF = Buffer.from(testText, 'utf-8')

    console.log('Sending to Textract for analysis...')
    const startTime = Date.now()
    
    const result = await processor.extractFromDocument(testPDF)
    
    const processingTime = Date.now() - startTime
    console.log(`\nProcessing completed in ${processingTime}ms`)

    // Display results
    console.log('\n=== Extraction Results ===')
    console.log(`Text length: ${result.text.length} characters`)
    console.log(`Tables found: ${result.tables.length}`)
    console.log(`Key-value pairs: ${result.keyValuePairs.length}`)
    console.log(`Confidence: ${result.confidence.toFixed(2)}%`)
    console.log(`Pages: ${result.pageCount}`)

    if (result.keyValuePairs.length > 0) {
      console.log('\nKey-Value Pairs:')
      result.keyValuePairs.forEach(kv => {
        console.log(`  ${kv.key}: ${kv.value} (confidence: ${kv.confidence.toFixed(2)}%)`)
      })
    }

    if (result.tables.length > 0) {
      console.log('\nTables:')
      result.tables.forEach((table, idx) => {
        console.log(`  Table ${idx + 1} (${table.rows.length} rows):`)
        table.rows.forEach(row => {
          console.log(`    ${row.join(' | ')}`)
        })
      })
    }

    // Test lab pattern extraction
    console.log('\n=== Lab Pattern Extraction ===')
    const patterns = processor.extractLabReportPatterns(result)
    console.log('Patient Info:', patterns.patientInfo)
    console.log('Test Results:', patterns.testResults.length, 'found')
    patterns.testResults.forEach(test => {
      console.log(`  - ${test.name}: ${test.value} ${test.unit || ''} (range: ${test.range || 'N/A'})`)
    })

    console.log('\n✓ Textract is working correctly!')

  } catch (error) {
    console.error('\n✗ Textract test failed:', error.message)
    
    if (error.message.includes('Credential')) {
      console.log('\nCredential issue detected. Please check:')
      console.log('1. AWS credentials are valid')
      console.log('2. IAM user has AmazonTextractFullAccess policy')
    } else if (error.message.includes('Region')) {
      console.log('\nRegion issue detected. Try setting AWS_REGION=us-east-1')
    }
  }
}

// Run the test
testTextract().catch(console.error)