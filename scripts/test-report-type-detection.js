import { MasterAnalyzer } from '../src/lib/lab-analyzers/master-analyzer.js'
import { readFile } from 'fs/promises'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testReportTypeDetection() {
  console.log('🧪 Testing Report Type Detection...\n')
  
  try {
    // Test with a known NAQ file
    const testFiles = [
      { name: 'NAQ-Questions-Answers-4.pdf', expectedType: 'nutriq' },
      { name: 'Symptom-Burden-Comparision-Graph.pdf', expectedType: 'nutriq' }
    ]
    
    console.log('Anthropic API Key:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing')
    
    const analyzer = MasterAnalyzer.getInstance()
    console.log('✅ Analyzer instance created\n')
    
    // Create a simple test PDF content
    const testContent = `NAQ Questions and Answers
    
Nutritional Assessment Questionnaire
Patient Name: Test Patient
Date: 2025-08-01

Section 1: Energy
Q1: How is your energy level? Answer: Low
Q2: Do you feel fatigued? Answer: Yes

Section 2: Digestion
Q1: Any digestive issues? Answer: Sometimes
Q2: Bloating after meals? Answer: Yes

Symptom Burden Score: 45/100
`
    
    // Convert to buffer (simulate PDF content)
    const pdfBuffer = Buffer.from(testContent)
    
    console.log('Testing with sample NAQ content...')
    console.log('Content preview:', testContent.substring(0, 100) + '...\n')
    
    try {
      const result = await analyzer.analyzeReport(pdfBuffer)
      
      console.log('\n✅ Analysis Result:')
      console.log('Detected Type:', result.reportType)
      console.log('Expected Type: nutriq')
      console.log('Match:', result.reportType === 'nutriq' ? '✅' : '❌')
      console.log('Processing Time:', result.processingTime + 'ms')
      console.log('Confidence:', (result.confidence * 100).toFixed(1) + '%')
      
      if (result.reportType !== 'nutriq') {
        console.log('\n⚠️  WARNING: Report type mismatch!')
        console.log('This NAQ file was detected as:', result.reportType)
        console.log('This explains why the analysis is failing.')
      }
      
    } catch (error) {
      console.error('\n❌ Analysis failed:', error.message)
      console.error('Error type:', error.constructor.name)
      
      if (error.message.includes('PDF')) {
        console.log('\nℹ️  Note: This test uses plain text instead of a real PDF.')
        console.log('The actual error might be due to PDF parsing, not type detection.')
      }
    }
    
  } catch (error) {
    console.error('❌ Test setup error:', error)
  }
}

testReportTypeDetection().catch(console.error)