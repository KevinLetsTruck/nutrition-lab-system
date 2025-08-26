// Standalone test that doesn't require database access
import { LabValueExtractor } from '../src/lib/medical/lab-extractor'

async function testLabExtractionStandalone() {
  console.log('🧪 Testing lab value extraction (standalone mode)...')

  // Create extractor instance
  const extractor = new LabValueExtractor()

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
    // Test text preprocessing
    console.log('🔧 Testing text preprocessing...')
    const cleanedText = (extractor as any).preprocessText(sampleLabText)
    console.log('✅ Text preprocessed successfully')

    // Test pattern detection
    console.log('📊 Testing pattern detection...')
    const patterns = (extractor as any).detectStructurePatterns(cleanedText)
    console.log('Pattern detection results:', patterns)

    // Test table structure extraction
    console.log('📋 Testing table structure extraction...')
    const tableValues = (extractor as any).extractFromTableStructure(cleanedText)
    console.log(`Found ${tableValues.length} values from table structure`)

    // Test pattern matching extraction
    console.log('🔍 Testing pattern matching extraction...')
    const patternValues = (extractor as any).extractWithPatternMatching(cleanedText)
    console.log(`Found ${patternValues.length} values from pattern matching`)

    // Test duplicate removal
    console.log('🔄 Testing duplicate removal...')
    const allValues = [...tableValues, ...patternValues]
    const mergedValues = (extractor as any).removeDuplicatesAndMerge(allValues)
    console.log(`Merged to ${mergedValues.length} unique values`)

    // Test validation
    console.log('✅ Testing validation...')
    const validatedValues = (extractor as any).validateAndFlagValues(mergedValues)
    console.log(`Validated ${validatedValues.length} values`)

    // Display results
    console.log('\n🎯 Final Extraction Results:')
    console.log(`Total values found: ${validatedValues.length}`)
    const highConfidence = validatedValues.filter((v: any) => v.confidence >= 0.8).length
    console.log(`High confidence: ${highConfidence}`)
    
    console.log('\n📝 Extracted Values:')
    validatedValues.forEach((value: any) => {
      console.log(`  ${value.testName}: ${value.value} ${value.unit || ''} (${(value.confidence * 100).toFixed(1)}% confidence)`)
      if (value.standardName) {
        console.log(`    📍 Standard: ${value.standardName}`)
      }
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
      metabolic: validatedValues.filter((v: any) => ['glucose', 'bun', 'creatinine', 'sodium', 'potassium', 'chloride', 'co2'].includes(v.standardName || '')),
      lipids: validatedValues.filter((v: any) => ['totalCholesterol', 'hdl', 'ldl', 'triglycerides'].includes(v.standardName || '')),
      thyroid: validatedValues.filter((v: any) => ['tsh', 'freeT4', 'freeT3'].includes(v.standardName || ''))
    }

    Object.entries(categories).forEach(([category, values]) => {
      if (values.length > 0) {
        console.log(`  ${category}: ${values.length} values`)
        values.forEach((v: any) => console.log(`    - ${v.testName} (${v.standardName})`))
      }
    })

    return {
      totalFound: validatedValues.length,
      highConfidenceCount: highConfidence,
      patterns,
      extractedValues: validatedValues
    }

  } catch (error) {
    console.error('❌ Lab extraction test failed:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  testLabExtractionStandalone()
    .then(result => {
      console.log('\n✅ Lab extraction test completed successfully!')
      console.log(`🎯 Summary: ${result.totalFound} values extracted, ${result.highConfidenceCount} high confidence`)
      process.exit(0)
    })
    .catch(error => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

export { testLabExtractionStandalone }
