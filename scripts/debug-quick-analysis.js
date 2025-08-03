const fs = require('fs')
const path = require('path')

async function debugQuickAnalysis() {
  console.log('=== Debugging Quick Analysis Flow ===\n')
  
  try {
    // Test 1: Check if the quick-analysis endpoint exists
    console.log('1. Testing quick-analysis endpoint...')
    const testResponse = await fetch('http://localhost:3000/api/quick-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath: 'test/path.pdf',
        fileName: 'test.pdf',
        bucket: 'general'
      })
    })
    
    console.log('Response status:', testResponse.status)
    const testData = await testResponse.text()
    console.log('Response:', testData.substring(0, 500))
    
    // Test 2: Check if upload endpoint works
    console.log('\n2. Testing upload endpoint...')
    const formData = new FormData()
    const testContent = 'Test PDF content'
    const file = new File([testContent], 'test.pdf', { type: 'application/pdf' })
    formData.append('file', file)
    formData.append('quickAnalysis', 'true')
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log('Upload response status:', uploadResponse.status)
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json()
      console.log('Upload response:', JSON.stringify(uploadData, null, 2))
    } else {
      const errorText = await uploadResponse.text()
      console.log('Upload error:', errorText)
    }
    
  } catch (error) {
    console.error('Debug failed:', error)
  }
}

debugQuickAnalysis() 