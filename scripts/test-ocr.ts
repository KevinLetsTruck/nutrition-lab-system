import { medicalOCRService } from '../src/lib/medical/ocr-service'

async function testOCR() {
  console.log('🧪 Testing OCR service...')
  
  try {
    console.log('📖 Testing Tesseract initialization...')
    
    // Initialize Tesseract
    await medicalOCRService.initializeTesseract()
    console.log('✅ Tesseract initialized successfully')
    
    console.log('⚠️ Skipping image OCR test (requires network access)')
    console.log('   Image OCR will work when processing real uploaded documents')
    
    // Test document classification
    console.log('\n🏷️ Testing document classification...')
    const classificationResult = await medicalOCRService.classifyDocument(
      'COMPREHENSIVE METABOLIC PANEL CMP GLUCOSE 120 mg/dL BUN 15 mg/dL CREATININE 1.0 mg/dL LABCORP',
      'sample_cmp_report.pdf'
    )
    
    console.log('✅ Classification Result:')
    console.log('   Document Type:', classificationResult.documentType)
    console.log('   Lab Source:', classificationResult.labSource || 'Unknown')
    console.log('   Confidence:', classificationResult.extractedData?.confidence || 0)
    
  } catch (error) {
    console.error('❌ OCR Test Failed:', error)
  } finally {
    await medicalOCRService.cleanup()
    console.log('🧹 Cleanup completed')
  }
}

// Run if called directly
if (require.main === module) {
  testOCR()
    .then(() => {
      console.log('\n🎉 OCR test completed!')
      process.exit(0)
    })
    .catch(error => {
      console.error('Test script error:', error)
      process.exit(1)
    })
}

export { testOCR }
