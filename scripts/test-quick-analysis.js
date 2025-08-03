const fs = require('fs')
const path = require('path')

async function testQuickAnalysis() {
  console.log('Testing quick-analysis flow...')
  
  try {
    // Step 1: Upload a test file
    console.log('\n1. Uploading test file...')
    const formData = new FormData()
    
    // Create a simple test PDF file
    const testPdfPath = path.join(__dirname, 'test-quick-analysis.pdf')
    const testContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF for Quick Analysis) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF'
    
    fs.writeFileSync(testPdfPath, testContent)
    
    const file = new File([testContent], 'test-quick-analysis.pdf', { type: 'application/pdf' })
    formData.append('file', file)
    formData.append('quickAnalysis', 'true')
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('Upload failed:', uploadResponse.status, errorText)
      return
    }
    
    const uploadData = await uploadResponse.json()
    console.log('Upload response:', JSON.stringify(uploadData, null, 2))
    
    if (!uploadData.success || !uploadData.files || uploadData.files.length === 0) {
      console.error('Upload failed:', uploadData.error)
      return
    }
    
    const uploadedFile = uploadData.files[0]
    console.log('Uploaded file:', uploadedFile)
    
    // Step 2: Analyze the file
    console.log('\n2. Analyzing file...')
    const analysisResponse = await fetch('http://localhost:3000/api/quick-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath: uploadedFile.storagePath || uploadedFile.filePath,
        fileName: 'test-quick-analysis.pdf',
        bucket: uploadedFile.bucket
      })
    })
    
    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text()
      console.error('Analysis failed:', analysisResponse.status, errorText)
      return
    }
    
    const analysisData = await analysisResponse.json()
    console.log('Analysis response:', JSON.stringify(analysisData, null, 2))
    
    // Clean up
    fs.unlinkSync(testPdfPath)
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testQuickAnalysis() 