import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Lab test catalog data
const labTestData = [
  // Metabolic Panel
  {
    testCode: 'GLUCOSE',
    testName: 'Glucose, Fasting',
    category: 'metabolic',
    subcategory: 'glucose',
    unit: 'mg/dL',
    standardRangeLow: 65,
    standardRangeHigh: 99,
    optimalRangeLow: 75,
    optimalRangeHigh: 85,
    truckDriverRangeLow: 70,
    truckDriverRangeHigh: 90,
    criticalLow: 50,
    criticalHigh: 400,
    description: 'Fasting blood glucose level',
    clinicalSignificance: 'Primary marker for glucose metabolism and diabetes risk',
    truckDriverConsiderations: 'Critical for DOT certification; >126 requires medical evaluation',
    relatedPatterns: ['insulin_resistance', 'metabolic_syndrome', 'diabetes']
  },
  {
    testCode: 'INSULIN',
    testName: 'Insulin, Fasting',
    category: 'metabolic',
    subcategory: 'glucose',
    unit: 'μIU/mL',
    standardRangeLow: 2.6,
    standardRangeHigh: 24.9,
    optimalRangeLow: 2,
    optimalRangeHigh: 5,
    truckDriverRangeLow: 2,
    truckDriverRangeHigh: 6,
    criticalHigh: 50,
    description: 'Fasting insulin level',
    clinicalSignificance: 'Early marker for insulin resistance',
    truckDriverConsiderations: 'High levels indicate metabolic dysfunction affecting alertness and fatigue',
    relatedPatterns: ['insulin_resistance', 'metabolic_syndrome', 'pcos']
  },
  {
    testCode: 'HBA1C',
    testName: 'Hemoglobin A1c',
    category: 'metabolic',
    subcategory: 'glucose',
    unit: '%',
    standardRangeLow: 4.0,
    standardRangeHigh: 5.6,
    optimalRangeLow: 4.5,
    optimalRangeHigh: 5.3,
    truckDriverRangeLow: 4.5,
    truckDriverRangeHigh: 5.5,
    criticalHigh: 14,
    description: '3-month average blood glucose',
    clinicalSignificance: 'Long-term glucose control marker',
    truckDriverConsiderations: 'DOT requires <10%; optimal range prevents fatigue and cognitive issues',
    relatedPatterns: ['diabetes', 'metabolic_syndrome', 'cardiovascular_risk']
  },
  // Lipid Panel
  {
    testCode: 'CHOL_TOTAL',
    testName: 'Total Cholesterol',
    category: 'metabolic',
    subcategory: 'lipids',
    unit: 'mg/dL',
    standardRangeLow: 100,
    standardRangeHigh: 199,
    optimalRangeLow: 150,
    optimalRangeHigh: 180,
    truckDriverRangeLow: 140,
    truckDriverRangeHigh: 190,
    criticalHigh: 400,
    description: 'Total cholesterol level',
    clinicalSignificance: 'Cardiovascular risk marker',
    truckDriverConsiderations: 'Important for DOT cardiac risk assessment',
    relatedPatterns: ['dyslipidemia', 'cardiovascular_risk', 'metabolic_syndrome']
  },
  {
    testCode: 'HDL',
    testName: 'HDL Cholesterol',
    category: 'metabolic',
    subcategory: 'lipids',
    unit: 'mg/dL',
    standardRangeLow: 40,
    standardRangeHigh: 999,
    optimalRangeLow: 60,
    optimalRangeHigh: 100,
    truckDriverRangeLow: 50,
    truckDriverRangeHigh: 100,
    criticalLow: 20,
    description: 'High-density lipoprotein',
    clinicalSignificance: 'Protective cholesterol',
    truckDriverConsiderations: 'Often low in truckers due to poor diet and lack of exercise',
    relatedPatterns: ['dyslipidemia', 'metabolic_syndrome', 'inflammation']
  },
  {
    testCode: 'TRIG',
    testName: 'Triglycerides',
    category: 'metabolic',
    subcategory: 'lipids',
    unit: 'mg/dL',
    standardRangeLow: 0,
    standardRangeHigh: 149,
    optimalRangeLow: 0,
    optimalRangeHigh: 70,
    truckDriverRangeLow: 0,
    truckDriverRangeHigh: 90,
    criticalHigh: 1000,
    description: 'Triglyceride level',
    clinicalSignificance: 'Marker for metabolic health and insulin resistance',
    truckDriverConsiderations: 'Elevated by truck stop food and irregular meals',
    relatedPatterns: ['insulin_resistance', 'metabolic_syndrome', 'fatty_liver']
  },
  // Thyroid Panel
  {
    testCode: 'TSH',
    testName: 'TSH',
    category: 'hormones',
    subcategory: 'thyroid',
    unit: 'mIU/L',
    standardRangeLow: 0.45,
    standardRangeHigh: 4.5,
    optimalRangeLow: 1.0,
    optimalRangeHigh: 2.0,
    truckDriverRangeLow: 0.8,
    truckDriverRangeHigh: 2.5,
    criticalLow: 0.1,
    criticalHigh: 20,
    description: 'Thyroid stimulating hormone',
    clinicalSignificance: 'Primary thyroid function screen',
    truckDriverConsiderations: 'Affects energy, weight, and alertness critical for driving',
    relatedPatterns: ['hypothyroid', 'hyperthyroid', 'autoimmune_thyroid']
  },
  {
    testCode: 'FT4',
    testName: 'Free T4',
    category: 'hormones',
    subcategory: 'thyroid',
    unit: 'ng/dL',
    standardRangeLow: 0.82,
    standardRangeHigh: 1.77,
    optimalRangeLow: 1.0,
    optimalRangeHigh: 1.5,
    truckDriverRangeLow: 1.0,
    truckDriverRangeHigh: 1.6,
    criticalLow: 0.5,
    criticalHigh: 3.0,
    description: 'Free thyroxine',
    clinicalSignificance: 'Active thyroid hormone',
    truckDriverConsiderations: 'Low levels cause fatigue and slow reaction time',
    relatedPatterns: ['hypothyroid', 'thyroid_conversion']
  },
  {
    testCode: 'FT3',
    testName: 'Free T3',
    category: 'hormones',
    subcategory: 'thyroid',
    unit: 'pg/mL',
    standardRangeLow: 2.0,
    standardRangeHigh: 4.4,
    optimalRangeLow: 3.0,
    optimalRangeHigh: 4.0,
    truckDriverRangeLow: 2.8,
    truckDriverRangeHigh: 4.0,
    criticalLow: 1.0,
    criticalHigh: 6.0,
    description: 'Free triiodothyronine',
    clinicalSignificance: 'Most active thyroid hormone',
    truckDriverConsiderations: 'Critical for metabolism and energy production',
    relatedPatterns: ['hypothyroid', 'thyroid_conversion', 'low_t3_syndrome']
  },
  // Inflammatory Markers
  {
    testCode: 'CRP_HS',
    testName: 'hs-CRP',
    category: 'inflammation',
    subcategory: 'acute',
    unit: 'mg/L',
    standardRangeLow: 0,
    standardRangeHigh: 3.0,
    optimalRangeLow: 0,
    optimalRangeHigh: 1.0,
    truckDriverRangeLow: 0,
    truckDriverRangeHigh: 1.5,
    criticalHigh: 10,
    description: 'High-sensitivity C-reactive protein',
    clinicalSignificance: 'Cardiovascular and systemic inflammation',
    truckDriverConsiderations: 'Elevated by poor diet, sedentary lifestyle, and sleep deprivation',
    relatedPatterns: ['inflammation', 'cardiovascular_risk', 'metabolic_syndrome']
  },
  {
    testCode: 'HOMOCYST',
    testName: 'Homocysteine',
    category: 'inflammation',
    subcategory: 'methylation',
    unit: 'μmol/L',
    standardRangeLow: 0,
    standardRangeHigh: 15,
    optimalRangeLow: 5,
    optimalRangeHigh: 8,
    truckDriverRangeLow: 5,
    truckDriverRangeHigh: 9,
    criticalHigh: 50,
    description: 'Homocysteine level',
    clinicalSignificance: 'Methylation and cardiovascular risk',
    truckDriverConsiderations: 'Often elevated due to poor B-vitamin status',
    relatedPatterns: ['methylation_dysfunction', 'cardiovascular_risk', 'b_vitamin_deficiency']
  },
  {
    testCode: 'FERRITIN',
    testName: 'Ferritin',
    category: 'inflammation',
    subcategory: 'iron',
    unit: 'ng/mL',
    standardRangeLow: 30,
    standardRangeHigh: 400,
    optimalRangeLow: 50,
    optimalRangeHigh: 150,
    truckDriverRangeLow: 40,
    truckDriverRangeHigh: 170,
    criticalLow: 10,
    criticalHigh: 1000,
    description: 'Iron storage protein',
    clinicalSignificance: 'Iron status and inflammation marker',
    truckDriverConsiderations: 'Can be elevated with inflammation or hemochromatosis',
    relatedPatterns: ['iron_overload', 'inflammation', 'hemochromatosis']
  },
  // Nutritional Markers
  {
    testCode: 'VIT_D',
    testName: '25-OH Vitamin D',
    category: 'nutritional',
    subcategory: 'vitamins',
    unit: 'ng/mL',
    standardRangeLow: 30,
    standardRangeHigh: 100,
    optimalRangeLow: 50,
    optimalRangeHigh: 80,
    truckDriverRangeLow: 40,
    truckDriverRangeHigh: 80,
    criticalLow: 10,
    criticalHigh: 150,
    description: 'Vitamin D status',
    clinicalSignificance: 'Immune, bone, and mood health',
    truckDriverConsiderations: 'Often deficient due to limited sun exposure in cab',
    relatedPatterns: ['vitamin_d_deficiency', 'immune_dysfunction', 'depression']
  },
  {
    testCode: 'B12',
    testName: 'Vitamin B12',
    category: 'nutritional',
    subcategory: 'vitamins',
    unit: 'pg/mL',
    standardRangeLow: 232,
    standardRangeHigh: 1245,
    optimalRangeLow: 500,
    optimalRangeHigh: 900,
    truckDriverRangeLow: 450,
    truckDriverRangeHigh: 900,
    criticalLow: 100,
    criticalHigh: 2000,
    description: 'Vitamin B12 level',
    clinicalSignificance: 'Energy production and neurological function',
    truckDriverConsiderations: 'Deficiency causes fatigue and cognitive issues',
    relatedPatterns: ['b12_deficiency', 'methylation_dysfunction', 'fatigue']
  },
  {
    testCode: 'FOLATE',
    testName: 'Folate',
    category: 'nutritional',
    subcategory: 'vitamins',
    unit: 'ng/mL',
    standardRangeLow: 3.0,
    standardRangeHigh: 20.0,
    optimalRangeLow: 10,
    optimalRangeHigh: 20,
    truckDriverRangeLow: 8,
    truckDriverRangeHigh: 20,
    criticalLow: 2,
    criticalHigh: 30,
    description: 'Folate level',
    clinicalSignificance: 'DNA synthesis and methylation',
    truckDriverConsiderations: 'Often low due to poor vegetable intake',
    relatedPatterns: ['folate_deficiency', 'methylation_dysfunction', 'homocysteine_elevation']
  },
  {
    testCode: 'MAGNESIUM_RBC',
    testName: 'Magnesium, RBC',
    category: 'nutritional',
    subcategory: 'minerals',
    unit: 'mg/dL',
    standardRangeLow: 4.2,
    standardRangeHigh: 6.8,
    optimalRangeLow: 5.5,
    optimalRangeHigh: 6.5,
    truckDriverRangeLow: 5.2,
    truckDriverRangeHigh: 6.5,
    criticalLow: 3.0,
    criticalHigh: 8.0,
    description: 'Red blood cell magnesium',
    clinicalSignificance: 'Cellular magnesium status',
    truckDriverConsiderations: 'Deficiency causes muscle cramps, poor sleep, and anxiety',
    relatedPatterns: ['magnesium_deficiency', 'muscle_cramps', 'insomnia']
  }
]

// Pattern library data
const patternLibraryData = [
  {
    patternName: 'insulin_resistance',
    patternCategory: 'metabolic',
    description: 'Insulin resistance pattern indicating pre-diabetes risk',
    requiredMarkers: ['GLUCOSE', 'INSULIN'],
    optionalMarkers: ['HBA1C', 'TRIG', 'HDL'],
    detectionRules: {
      criteria: [
        { marker: 'GLUCOSE', condition: '>', value: 90 },
        { marker: 'INSULIN', condition: '>', value: 5 },
        { marker: 'HOMA_IR', condition: '>', value: 1.5 }
      ]
    },
    clinicalInterpretation: 'Early metabolic dysfunction requiring dietary intervention',
    functionalMedicineApproach: 'Low carb diet, time-restricted eating, berberine, chromium',
    truckDriverConsiderations: 'Impacts energy, increases accident risk, threatens DOT certification',
    interventionPriority: 'high'
  },
  {
    patternName: 'hypothyroid',
    patternCategory: 'hormonal',
    description: 'Hypothyroid pattern with or without autoimmune component',
    requiredMarkers: ['TSH', 'FT4'],
    optionalMarkers: ['FT3', 'RT3', 'TPO_AB'],
    detectionRules: {
      criteria: [
        { marker: 'TSH', condition: '>', value: 2.5 },
        { marker: 'FT4', condition: '<', value: 1.0 }
      ]
    },
    clinicalInterpretation: 'Underactive thyroid requiring evaluation and treatment',
    functionalMedicineApproach: 'Thyroid support nutrients, address root causes, medication if needed',
    truckDriverConsiderations: 'Causes severe fatigue, slow reflexes, weight gain affecting driving safety',
    interventionPriority: 'immediate'
  },
  {
    patternName: 'inflammation',
    patternCategory: 'inflammatory',
    description: 'Systemic inflammation pattern',
    requiredMarkers: ['CRP_HS'],
    optionalMarkers: ['FERRITIN', 'HOMOCYST', 'ESR'],
    detectionRules: {
      criteria: [
        { marker: 'CRP_HS', condition: '>', value: 1.0 }
      ]
    },
    clinicalInterpretation: 'Chronic inflammation increasing disease risk',
    functionalMedicineApproach: 'Anti-inflammatory diet, omega-3s, curcumin, address gut health',
    truckDriverConsiderations: 'Linked to poor diet, sedentary lifestyle, increases all chronic disease risks',
    interventionPriority: 'high'
  },
  {
    patternName: 'vitamin_d_deficiency',
    patternCategory: 'nutritional',
    description: 'Vitamin D deficiency pattern',
    requiredMarkers: ['VIT_D'],
    optionalMarkers: [],
    detectionRules: {
      criteria: [
        { marker: 'VIT_D', condition: '<', value: 30 }
      ]
    },
    clinicalInterpretation: 'Vitamin D deficiency affecting multiple systems',
    functionalMedicineApproach: 'Vitamin D3 supplementation 5000-10000 IU daily with K2',
    truckDriverConsiderations: 'Common in truckers, affects mood, immunity, and fatigue',
    interventionPriority: 'moderate'
  }
]

async function seedLabCatalog() {
  console.log('🧪 Seeding lab test catalog...')
  
  // Clear existing data
  await prisma.patternLibrary.deleteMany()
  await prisma.labTestCatalog.deleteMany()
  
  // Seed lab tests
  for (const test of labTestData) {
    await prisma.labTestCatalog.create({
      data: test
    })
  }
  console.log(`✅ Created ${labTestData.length} lab tests`)
  
  // Seed pattern library
  for (const pattern of patternLibraryData) {
    await prisma.patternLibrary.create({
      data: pattern
    })
  }
  console.log(`✅ Created ${patternLibraryData.length} patterns`)
  
  console.log('🎉 Lab catalog seeding completed!')
}

seedLabCatalog()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
