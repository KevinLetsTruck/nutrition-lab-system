#!/usr/bin/env tsx

/**
 * Direct Test of Enhanced Lab Value Extraction
 * 
 * This script directly tests the enhanced lab value extraction patterns
 * without going through the upload endpoint
 */

import { labValueExtractor } from '../src/lib/medical/lab-extractor';

// Sample test data for each document type
const testData = {
  NAQ: `
NAQ Questions/Answers - Assessment
Client: John Smith
Date: 2025-01-12

Upper Gastrointestinal System

52. 0 1 2 3 Belching or gas within one hour after eating
53. 0 1 2 3 Heartburn or burning sensation in chest
54. 0 1 2 3 Feeling full after eating small amounts

Lower Gastrointestinal System  

85. 0 1 2 3 Abdominal cramping
86. 0 1 2 3 Diarrhea or loose stools
87. 0 1 2 3 Constipation

Upper GI Total: 15
Lower GI Total: 8
  `,

  KBMO_FOOD_SENSITIVITY: `
KBMO Diagnostics - Food Sensitivity Test
IgG1-4 and C3d Analysis
Client: Jane Doe

Dairy
Milk, Cow          4+ Severe Reaction
Cheese, Cheddar    3+ High Reaction
Yogurt             2+ Moderate Reaction

Grains
Wheat, Gliadin     4+ Severe Reaction  
Oats               1+ Low Reaction
Rice, Brown        Negative

Vegetables
Tomato             2+ Moderate Reaction
Potato, White      1+ Low Reaction
Broccoli           Negative
  `,

  DUTCH_HORMONE: `
DUTCH Complete - Precision Analytical
Client: Sarah Johnson

Sex Hormones & Metabolites

Cortisol A - Waking     Low end of range    12.0  ng/mg  10 - 50
Cortisol B - Bedtime    Within range        2.5   ng/mg  1.0 - 5.0
Estradiol (E2)          High end of luteal range  4.00  ng/mg  1.8 - 4.5
Testosterone            Above range         85.0  ng/mg  15 - 70

Organic Acids

Vanillylmandelate       15.2  ug/mg
Homovanillate           8.7   ug/mg
5-Hydroxyindoleacetate  3.2   ug/mg
  `,

  TRADITIONAL_LAB: `
Basic Metabolic Panel
Lab Corp - Quest Diagnostics

Glucose: 110 mg/dL (70-99) HIGH
BUN: 18 mg/dL (7-20) NORMAL
Creatinine: 0.9 mg/dL (0.7-1.3) NORMAL
Sodium: 142 mEq/L (136-145) NORMAL
Potassium: 4.2 mEq/L (3.5-5.1) NORMAL
Chloride: 103 mEq/L (98-107) NORMAL
CO2: 25 mEq/L (22-29) NORMAL

Lipid Panel
Total Cholesterol: 215 mg/dL (100-199) HIGH
HDL: 45 mg/dL (40-60) NORMAL
LDL: 135 mg/dL (0-99) HIGH
Triglycerides: 175 mg/dL (0-149) HIGH
  `
};

async function testLabExtractor() {
  console.log('🧪 Testing Enhanced Lab Value Extraction - Direct Test\n');
  
  for (const [docType, testText] of Object.entries(testData)) {
    console.log(`\n📋 Testing ${docType} Document Type`);
    console.log('=' .repeat(50));
    
    try {
      const mockDocumentId = `test-${docType.toLowerCase()}-${Date.now()}`;
      
      // Direct call to lab extractor (test mode = true to skip database save)
      const result = await labValueExtractor.extractLabValues(mockDocumentId, testText, true);
      
      console.log(`✅ Extraction completed in ${result.processingTime}ms`);
      console.log(`📊 Total values found: ${result.totalFound}`);
      console.log(`🎯 High confidence values: ${result.highConfidenceCount}`);
      console.log(`🔍 Patterns detected:`, JSON.stringify(result.patterns, null, 2));
      
      console.log('\n📋 Extracted Values:');
      result.extractedValues.forEach((value, index) => {
        console.log(`  ${index + 1}. ${value.testName}`);
        if (value.value !== null && value.value !== undefined) {
          console.log(`     Value: ${value.value} ${value.unit || ''}`);
        }
        if (value.valueText) console.log(`     Text: ${value.valueText}`);
        if (value.flag) console.log(`     Flag: ${value.flag}`);
        if (value.documentType) console.log(`     Type: ${value.documentType}`);
        if (value.questionNumber) console.log(`     Question #: ${value.questionNumber}`);
        if (value.foodItem) console.log(`     Food: ${value.foodItem}`);
        if (value.reactionLevel) console.log(`     Reaction: ${value.reactionLevel}`);
        if (value.category) console.log(`     Category: ${value.category}`);
        console.log(`     Confidence: ${(value.confidence * 100).toFixed(0)}%`);
        console.log('');
      });
      
      // Expected results validation
      const expectedCounts = {
        NAQ: { min: 5, description: "symptom questions and section totals" },
        KBMO_FOOD_SENSITIVITY: { min: 7, description: "food sensitivity reactions" },
        DUTCH_HORMONE: { min: 6, description: "hormone values and organic acids" },
        TRADITIONAL_LAB: { min: 10, description: "traditional lab values" }
      };
      
      const expected = expectedCounts[docType];
      if (result.totalFound >= expected.min) {
        console.log(`✅ SUCCESS: Found ${result.totalFound} values (expected at least ${expected.min} ${expected.description})`);
      } else {
        console.log(`⚠️  WARNING: Found only ${result.totalFound} values (expected at least ${expected.min} ${expected.description})`);
      }
      
      // Check for document headers that should have been filtered out
      const suspiciousValues = result.extractedValues.filter(v => 
        v.testName.toLowerCase().includes('client') ||
        v.testName.toLowerCase().includes('date') ||
        v.testName.toLowerCase().includes('provider') ||
        v.testName.toLowerCase().includes('diagnostics') ||
        v.testName.toLowerCase().includes('lab corp') ||
        v.testName.toLowerCase().includes('quest')
      );
      
      if (suspiciousValues.length > 0) {
        console.log(`⚠️  WARNING: Found ${suspiciousValues.length} suspicious header-like values that should have been filtered`);
        suspiciousValues.forEach(v => console.log(`    - ${v.testName}`));
      } else {
        console.log(`✅ GOOD: No document headers were incorrectly extracted as lab values`);
      }
      
      // Document type specific validation
      const correctTypeValues = result.extractedValues.filter(v => v.documentType === docType);
      console.log(`📋 Document Type Detection: ${correctTypeValues.length}/${result.totalFound} values correctly tagged as ${docType}`);
      
    } catch (error) {
      console.error(`❌ Test failed for ${docType}:`, error.message);
      console.error('Stack:', error.stack);
    }
  }
  
  console.log('\n🎯 Enhanced Extraction Test Complete!');
  console.log('The enhanced extractor should show:');
  console.log('  - High accuracy in value extraction');
  console.log('  - Proper document type detection');
  console.log('  - Minimal header/noise extraction');
  console.log('  - Appropriate confidence scores');
}

// Run the test
testLabExtractor().catch(console.error);
