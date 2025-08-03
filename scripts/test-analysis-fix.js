import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testAnalysisFix() {
  console.log('🧪 Testing Analysis Fix...\n')
  
  // Test with a known pending analysis
  const testReportId = 'd2776167-2d23-41b6-bf33-e6ae2ed16dbb'
  
  console.log(`Testing with report ID: ${testReportId}`)
  
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
    } else {
      console.log('❌ Local analysis failed:', localResult.error)
      console.log('Details:', localResult.details)
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testAnalysisFix().catch(console.error)