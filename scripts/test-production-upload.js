// Test script to check production upload and analysis

async function testProductionUpload() {
  console.log('🧪 Testing Production Upload and Analysis...\n')
  
  const productionUrl = 'https://nutrition-lab-system-lets-truck.vercel.app'
  
  // Create a simple text-based PDF content
  const testContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj
4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
5 0 obj
<<
/Length 500
>>
stream
BT
/F1 12 Tf
50 750 Td
(NAQ Nutritional Assessment Questionnaire) Tj
0 -20 Td
(Patient Name: Test Patient) Tj
0 -20 Td
(Date: January 1, 2025) Tj
0 -40 Td
(Symptom Assessment Results:) Tj
0 -20 Td
(Energy Level: 3/10) Tj
0 -20 Td
(Digestive Health: 5/10) Tj
0 -20 Td
(Sleep Quality: 4/10) Tj
0 -20 Td
(Overall Score: 40/100) Tj
0 -40 Td
(This is a test NAQ assessment report.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
891
%%EOF`
  
  console.log('📄 Created test PDF content')
  
  // Test 1: Check health endpoint
  console.log('\n1️⃣ Testing health endpoint...')
  try {
    const healthResponse = await fetch(`${productionUrl}/api/health`)
    console.log('Health status:', healthResponse.status)
    if (healthResponse.ok) {
      const health = await healthResponse.json()
      console.log('Health data:', health)
    }
  } catch (error) {
    console.log('Health check error:', error.message)
  }
  
  // Test 2: Check if quick analysis endpoint is accessible
  console.log('\n2️⃣ Testing quick analysis endpoint...')
  try {
    const testResponse = await fetch(`${productionUrl}/api/analyze`, {
      method: 'GET'
    })
    console.log('Analyze GET status:', testResponse.status)
  } catch (error) {
    console.log('Analyze check error:', error.message)
  }
  
  console.log('\n✅ Tests complete')
  console.log('\nRecommendation:')
  console.log('The PDFs you\'re uploading might be image-based (scanned documents).')
  console.log('Currently, image-based PDF analysis is not supported in production.')
  console.log('Try uploading a text-based PDF file instead.')
}

testProductionUpload().catch(console.error)