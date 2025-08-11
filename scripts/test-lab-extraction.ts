import { labValueExtractor } from '../src/lib/medical/lab-extractor'

async function testLabExtraction() {
  console.log('🧪 Testing lab value extraction...')

  // Test with sample lab report text
  const sampleLabText = `
    COMPREHENSIVE METABOLIC PANEL
    
    Glucose             120 mg/dL        70-99
    BUN                 18  mg/dL        7-20
    Creatinine          1.1 mg/dL        0.7-1.3      Normal
    Sodium              142 mEq/L        136-145
    Potassium           4.2 mEq/L        3.5-5.1
    Chloride            103 mEq/L        98-107
    CO2                 25  mEq/L        22-29
    
    LIPID PANEL
    Total Cholesterol   185 mg/dL        <200
    HDL Cholesterol     45  mg/dL        >40          Low
    LDL Cholesterol     115 mg/dL        <100         High
    Triglycerides       125 mg/dL        <150
    
    THYROID PANEL
    TSH                 2.5 mIU/mL       0.4-4.0
    Free T4             1.2 ng/dL        0.8-1.8
    Free T3             3.1 pg/mL        2.3-4.2
  `

  try {
    const result = await labValueExtractor.extractLabValues('test-document-id', sampleLabText)
    
    console.log('\n📊 Extraction Results:')
    console.log(`Total values found: ${result.totalFound}`)
    console.log(`High confidence: ${result.highConfidenceCount}`)
    console.log(`Processing time: ${result.processingTime}ms`)
    console.log('\nPattern detection:', result.patterns)
    
    console.log('\n🔍 Extracted Values:')
    result.extractedValues.forEach(value => {
      console.log(`  ${value.testName}: ${value.value} ${value.unit || ''} (${(value.confidence * 100).toFixed(1)}% confidence)`)
      if (value.flag && value.flag !== 'normal') {
        console.log(`    ⚠️ Flag: ${value.flag}`)
      }
      if (value.referenceMin !== undefined && value.referenceMax !== undefined) {
        console.log(`    📏 Reference: ${value.referenceMin}-${value.referenceMax}`)
      }
    })

    // Test categorization by standard names
    console.log('\n📋 Categorization Test:')
    const categories = {
      metabolic: result.extractedValues.filter(v => ['glucose', 'bun', 'creatinine', 'sodium', 'potassium', 'chloride', 'co2'].includes(v.standardName || '')),
      lipids: result.extractedValues.filter(v => ['totalCholesterol', 'hdl', 'ldl', 'triglycerides'].includes(v.standardName || '')),
      thyroid: result.extractedValues.filter(v => ['tsh', 'freeT4', 'freeT3'].includes(v.standardName || ''))
    }

    Object.entries(categories).forEach(([category, values]) => {
      if (values.length > 0) {
        console.log(`  ${category}: ${values.length} values`)
        values.forEach(v => console.log(`    - ${v.testName} (${v.standardName})`))
      }
    })

    return result

  } catch (error) {
    console.error('❌ Lab extraction test failed:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  testLabExtraction()
    .then(result => {
      console.log('\n✅ Lab extraction test completed successfully!')
      process.exit(0)
    })
    .catch(error => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

export { testLabExtraction }
