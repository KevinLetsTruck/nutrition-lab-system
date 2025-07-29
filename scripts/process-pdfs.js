#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'pdfs')
const BATCH_SIZE = 5 // Process 5 files at a time
const DELAY_BETWEEN_BATCHES = 2000 // 2 seconds

async function getPendingPDFs() {
  try {
    const files = await fs.readdir(UPLOADS_DIR)
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))
    
    console.log(`Found ${pdfFiles.length} PDF files in uploads directory`)
    return pdfFiles
  } catch (error) {
    console.error('Error reading uploads directory:', error)
    return []
  }
}

async function processPDF(filename, clientEmail, clientInfo = {}) {
  try {
    console.log(`Processing: ${filename}`)
    
    const requestBody = {
      filename,
      clientEmail,
      clientFirstName: clientInfo.firstName || 'Unknown',
      clientLastName: clientInfo.lastName || 'Client',
      clientDateOfBirth: clientInfo.dateOfBirth
    }
    
    // Make API call to analyze the PDF
    const response = await fetch('http://localhost:3000/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log(`✅ Successfully processed ${filename}`)
      console.log(`   Report Type: ${result.analysisResult.reportType}`)
      console.log(`   Confidence: ${(result.analysisResult.confidence * 100).toFixed(1)}%`)
      console.log(`   Processing Time: ${result.analysisResult.processingTime}ms`)
      console.log(`   Lab Report ID: ${result.labReportId}`)
      
      // Move processed file to processed directory
      await moveToProcessed(filename)
      
      return { success: true, filename, result }
    } else {
      console.error(`❌ Failed to process ${filename}:`, result.error)
      return { success: false, filename, error: result.error }
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message)
    return { success: false, filename, error: error.message }
  }
}

async function moveToProcessed(filename) {
  try {
    const processedDir = path.join(process.cwd(), 'uploads', 'processed')
    
    // Create processed directory if it doesn't exist
    try {
      await fs.access(processedDir)
    } catch {
      await fs.mkdir(processedDir, { recursive: true })
    }
    
    const sourcePath = path.join(UPLOADS_DIR, filename)
    const destPath = path.join(processedDir, filename)
    
    await fs.rename(sourcePath, destPath)
    console.log(`   📁 Moved to processed directory`)
  } catch (error) {
    console.error(`   ⚠️  Failed to move file: ${error.message}`)
  }
}

async function processBatch(pdfFiles, clientEmail, clientInfo) {
  const batch = pdfFiles.splice(0, BATCH_SIZE)
  
  console.log(`\n🔄 Processing batch of ${batch.length} files...`)
  
  const results = await Promise.allSettled(
    batch.map(filename => processPDF(filename, clientEmail, clientInfo))
  )
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - successful
  
  console.log(`\n📊 Batch Results: ${successful} successful, ${failed} failed`)
  
  return results
}

async function main() {
  console.log('🚀 Starting PDF batch processing...\n')
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:3000/api/analyze')
    if (!response.ok) {
      throw new Error('Server not responding')
    }
  } catch (error) {
    console.error('❌ Error: Make sure the development server is running (npm run dev)')
    process.exit(1)
  }
  
  // Get command line arguments
  const args = process.argv.slice(2)
  let clientEmail = 'default@example.com'
  let clientInfo = {}
  
  if (args.length > 0) {
    clientEmail = args[0]
  }
  
  if (args.length > 1) {
    clientInfo.firstName = args[1]
  }
  
  if (args.length > 2) {
    clientInfo.lastName = args[2]
  }
  
  if (args.length > 3) {
    clientInfo.dateOfBirth = args[3]
  }
  
  console.log(`👤 Client Email: ${clientEmail}`)
  if (clientInfo.firstName) {
    console.log(`👤 Client Name: ${clientInfo.firstName} ${clientInfo.lastName || ''}`)
  }
  
  // Get pending PDFs
  const pdfFiles = await getPendingPDFs()
  
  if (pdfFiles.length === 0) {
    console.log('📭 No PDF files found to process')
    return
  }
  
  let totalProcessed = 0
  let totalSuccessful = 0
  let totalFailed = 0
  
  // Process files in batches
  while (pdfFiles.length > 0) {
    const batchResults = await processBatch(pdfFiles, clientEmail, clientInfo)
    
    totalProcessed += batchResults.length
    totalSuccessful += batchResults.filter(r => r.status === 'fulfilled' && r.value.success).length
    totalFailed += batchResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length
    
    // Wait before processing next batch
    if (pdfFiles.length > 0) {
      console.log(`⏳ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`)
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES))
    }
  }
  
  // Final summary
  console.log('\n🎉 Batch processing completed!')
  console.log(`📊 Final Results:`)
  console.log(`   Total Processed: ${totalProcessed}`)
  console.log(`   Successful: ${totalSuccessful}`)
  console.log(`   Failed: ${totalFailed}`)
  console.log(`   Success Rate: ${((totalSuccessful / totalProcessed) * 100).toFixed(1)}%`)
  
  if (totalFailed > 0) {
    console.log('\n⚠️  Some files failed to process. Check the logs above for details.')
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Batch processing interrupted by user')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Batch processing terminated')
  process.exit(0)
})

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
}

module.exports = { processPDF, processBatch, main } 