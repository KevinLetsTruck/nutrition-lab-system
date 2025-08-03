import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testPendingAnalysis() {
  console.log('🧪 Testing Analysis with Pending Report...\n')
  
  // Use one of the pending reports from our earlier check
  const testReportId = '5b5068c6-0520-4601-90ca-fb6498d3ff84'
  
  console.log(`Testing with report ID: ${testReportId}`)
  console.log('Expected file: 2025/08/01/NAQ-Questions-Answers-4_1754082527379_owajb3o49l.pdf')
  
  try {
    // Test local endpoint
    console.log('\n📍 Testing LOCAL endpoint...')
    const localResponse = await fetch(`http://localhost:3000/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        labReportId: testReportId
      })
    })
    
    const localResult = await localResponse.json()
    
    if (localResponse.ok) {
      console.log('✅ Local analysis successful!')
      console.log('Report Type:', localResult.analysisResult?.reportType)
      console.log('Processing Time:', localResult.analysisResult?.processingTime)
      console.log('Analysis Summary:', localResult.analysisResult?.analysis?.summary ? 'Present' : 'Missing')
    } else {
      console.log('❌ Local analysis failed:', localResult.error)
      console.log('Details:', localResult.details)
      console.log('Status:', localResponse.status)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testPendingAnalysis().catch(console.error)