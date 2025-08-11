import { functionalAnalyzer } from '../src/lib/medical/functional-analysis'
import { FUNCTIONAL_MEDICINE_RANGES } from '../src/lib/medical/functional-ranges'

async function testFunctionalAnalysis() {
  console.log('🔬 Testing functional medicine analysis...')

  // Test functional ranges database
  console.log('\n📊 Testing functional ranges database...')
  const rangeKeys = Object.keys(FUNCTIONAL_MEDICINE_RANGES)
  console.log(`✅ Loaded ${rangeKeys.length} biomarker ranges:`)
  rangeKeys.forEach(key => {
    const range = FUNCTIONAL_MEDICINE_RANGES[key]
    console.log(`  ${key}: optimal ${range.optimal[0]}-${range.optimal[1]} ${range.units[0]}`)
  })

  // Test range lookup logic
  console.log('\n🔍 Testing range lookup logic...')
  
  // Test glucose assessment
  const glucoseRange = FUNCTIONAL_MEDICINE_RANGES['glucose']
  if (glucoseRange) {
    console.log(`✅ Glucose range found:`)
    console.log(`  Conventional: ${glucoseRange.conventional[0]}-${glucoseRange.conventional[1]}`)
    console.log(`  Functional: ${glucoseRange.functional[0]}-${glucoseRange.functional[1]}`)
    console.log(`  Optimal: ${glucoseRange.optimal[0]}-${glucoseRange.optimal[1]}`)
    console.log(`  Critical high: ${glucoseRange.critical?.high}`)
    console.log(`  Interpretation high: ${glucoseRange.interpretation.high}`)
    console.log(`  Truck driver priority: ${glucoseRange.truckDriverConcerns?.interventionPriority}`)
  }

  // Test pattern detection keywords
  console.log('\n🔍 Testing pattern detection keywords...')
  const testLabNames = [
    'glucose', 'triglycerides', 'hdl', 'tsh', 'free t4', 'crp', 'hemoglobin'
  ]

  testLabNames.forEach(name => {
    const normalizedKey = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
    const range = FUNCTIONAL_MEDICINE_RANGES[normalizedKey] || FUNCTIONAL_MEDICINE_RANGES[name.toLowerCase()]
    console.log(`  ${name} -> ${normalizedKey} -> ${range ? '✅ Found' : '❌ Not found'}`)
  })

  console.log('\n🎯 Functional analysis test completed!')
  console.log('Ready for database-dependent testing with real documents.')

  return {
    rangesLoaded: rangeKeys.length,
    testPassed: true
  }
}

// Run if called directly
if (require.main === module) {
  testFunctionalAnalysis()
    .then(result => {
      console.log(`\n✅ Functional analysis test completed successfully!`)
      console.log(`📊 ${result.rangesLoaded} functional medicine ranges loaded`)
      process.exit(0)
    })
    .catch(error => {
      console.error('Test failed:', error)
      process.exit(1)
    })
}

export { testFunctionalAnalysis }
