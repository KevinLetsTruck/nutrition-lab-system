#!/usr/bin/env node

/**
 * Test script to verify PDF vision analysis functionality
 * This tests the new OCR/Vision support for nutrition lab PDFs
 */

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import PDFLabParser from '../src/lib/lab-analyzers/pdf-parser.js'
import MasterAnalyzer from '../src/lib/lab-analyzers/master-analyzer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function testVisionAnalysis() {
  console.log('=== Testing PDF Vision Analysis ===\n')
  
  try {
    // Test 1: Create a sample PDF that would need vision analysis
    console.log('📋 Test 1: Testing with minimal text PDF')
    const minimalTextPdf = Buffer.from(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 50 >>
stream
BT
/F1 12 Tf
100 700 Td
(Chart: [Image]) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
316
%%EOF`)
    
    const parser = PDFLabParser.getInstance()
    
    console.log('🔍 Parsing PDF with vision support...')
    const result = await parser.parseLabReport(minimalTextPdf)
    
    console.log('\n📊 Results:')
    console.log('- Has image content:', result.hasImageContent)
    console.log('- Used vision analysis:', !!result.visionAnalysisText)
    console.log('- Raw text length:', result.rawText.length)
    console.log('- Vision text length:', result.visionAnalysisText?.length || 0)
    console.log('- Combined text length:', result.combinedText?.length || 0)
    
    // Test 2: Test with master analyzer
    console.log('\n📋 Test 2: Testing with master analyzer')
    const masterAnalyzer = MasterAnalyzer.getInstance()
    
    console.log('🔍 Running full analysis pipeline...')
    const analysisResult = await masterAnalyzer.analyzeReport(minimalTextPdf)
    
    console.log('\n📊 Analysis Results:')
    console.log('- Report type:', analysisResult.reportType)
    console.log('- Confidence:', (analysisResult.confidence * 100).toFixed(1) + '%')
    console.log('- Processing time:', analysisResult.processingTime + 'ms')
    
    // Test 3: Test with an actual test PDF if available
    const testPdfPath = path.join(__dirname, 'test-pdf.pdf')
    try {
      console.log('\n📋 Test 3: Testing with actual PDF file')
      const pdfBuffer = await readFile(testPdfPath)
      console.log('- PDF size:', (pdfBuffer.length / 1024).toFixed(2) + ' KB')
      
      const actualResult = await parser.parseLabReport(pdfBuffer)
      console.log('- Has image content:', actualResult.hasImageContent)
      console.log('- Used vision analysis:', !!actualResult.visionAnalysisText)
      
      const actualAnalysis = await masterAnalyzer.analyzeReport(pdfBuffer)
      console.log('- Report type detected:', actualAnalysis.reportType)
      console.log('- Analysis confidence:', (actualAnalysis.confidence * 100).toFixed(1) + '%')
      
    } catch (e) {
      console.log('⚠️  No test PDF found at', testPdfPath)
      console.log('   Create a test PDF with charts/images to test vision functionality')
    }
    
    console.log('\n✅ Vision analysis tests completed!')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('\nFull error:', error)
    process.exit(1)
  }
}

// Run the test
testVisionAnalysis().catch(console.error) 