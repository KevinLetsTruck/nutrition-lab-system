#!/usr/bin/env node

const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000'

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testClaudeConnection() {
  log('\n🔌 Testing Claude API Connection...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/test-claude-connection`)
    const data = await response.json()
    
    if (data.success) {
      log('✅ Claude API connection successful!', 'green')
      log(`   Model: ${data.model}`, 'green')
      log(`   API Key Length: ${data.apiKeyInfo?.length}`, 'green')
      return true
    } else {
      log('❌ Claude API connection failed!', 'red')
      log(`   Error Type: ${data.errorType}`, 'red')
      log(`   Error: ${data.error}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ Failed to test Claude connection', 'red')
    log(`   ${error.message}`, 'red')
    return false
  }
}

async function testUnifiedAnalysis(filePath) {
  log(`\n📄 Testing Unified Analysis with file: ${path.basename(filePath)}...`, 'blue')
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${filePath}`, 'red')
      return false
    }

    const fileStats = fs.statSync(filePath)
    log(`   File size: ${(fileStats.size / 1024).toFixed(2)} KB`, 'blue')

    // Create form data
    const form = new FormData()
    form.append('file', fs.createReadStream(filePath))
    form.append('analysisType', 'document')

    // Send request
    const response = await fetch(`${API_BASE_URL}/api/analyze-unified`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    const data = await response.json()
    
    if (data.success) {
      log('✅ Analysis successful!', 'green')
      log(`   Analysis ID: ${data.analysisId}`, 'green')
      log(`   Document Type: ${data.documentType}`, 'green')
      log(`   Processing Time: ${data.processingTime}ms`, 'green')
      
      if (data.warnings) {
        log(`   ⚠️  Warnings: ${data.warnings.join(', ')}`, 'yellow')
      }
      
      // Show extracted data summary
      if (data.analysis?.extractedData) {
        log('\n📊 Extracted Data:', 'magenta')
        console.log(JSON.stringify(data.analysis.extractedData, null, 2))
      }
      
      return true
    } else {
      log('❌ Analysis failed!', 'red')
      log(`   Error: ${data.error}`, 'red')
      if (data.errors) {
        log(`   Details: ${data.errors.join(', ')}`, 'red')
      }
      if (data.suggestion) {
        log(`   💡 ${data.suggestion}`, 'yellow')
      }
      return false
    }
  } catch (error) {
    log('❌ Failed to perform analysis', 'red')
    log(`   ${error.message}`, 'red')
    return false
  }
}

async function testSystemStatus() {
  log('\n🏥 Checking System Status...', 'blue')
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze-unified`)
    const data = await response.json()
    
    log('✅ System is ready!', 'green')
    log(`   Endpoint: ${data.endpoint}`, 'green')
    log(`   Capabilities: ${data.capabilities.join(', ')}`, 'green')
    log(`   Anthropic API: ${data.configuration.anthropicApiKey}`, 
        data.configuration.anthropicApiKey === 'configured' ? 'green' : 'red')
    log(`   Supabase: ${data.configuration.supabase}`,
        data.configuration.supabase === 'configured' ? 'green' : 'red')
    
  } catch (error) {
    log('❌ Failed to check system status', 'red')
    log(`   ${error.message}`, 'red')
  }
}

async function runAllTests() {
  log('🚀 Starting Unified Analysis System Tests', 'magenta')
  log('=' .repeat(50), 'magenta')
  
  // Test 1: System Status
  await testSystemStatus()
  
  // Test 2: Claude Connection
  const connectionOk = await testClaudeConnection()
  
  if (!connectionOk) {
    log('\n⚠️  Claude connection failed. Please check your ANTHROPIC_API_KEY', 'yellow')
    log('   You can set it in Vercel with:', 'yellow')
    log('   vercel env add ANTHROPIC_API_KEY production', 'yellow')
    return
  }
  
  // Test 3: Document Analysis (if test file provided)
  const testFile = process.argv[2]
  if (testFile) {
    await testUnifiedAnalysis(testFile)
  } else {
    log('\n💡 Tip: Provide a PDF file path to test document analysis', 'yellow')
    log('   Example: node scripts/test-unified-system.js test-files/sample.pdf', 'yellow')
  }
  
  log('\n✨ Tests completed!', 'magenta')
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red')
  process.exit(1)
})