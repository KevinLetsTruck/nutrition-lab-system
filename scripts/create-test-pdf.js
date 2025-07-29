#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create a simple test PDF content that mimics a NutriQ report
const testPDFContent = `
NUTRIQ ASSESSMENT REPORT

Patient Information:
Patient Name: John Doe
Date of Birth: 1985-03-15
Test Date: 2024-07-29
Reference: NQ-2024-001

Assessment Results:

BODY SYSTEM SCORES:
Energy: 65/100
Mood: 72/100
Sleep: 58/100
Stress: 45/100
Digestion: 80/100
Immunity: 70/100

Total Score: 65/100

DETAILED ANALYSIS:

Energy System (Score: 65)
- Moderate energy levels
- Some fatigue reported
- Recommendations: Increase B vitamins, improve sleep quality

Mood System (Score: 72)
- Generally positive mood
- Minor stress indicators
- Recommendations: Stress management techniques

Sleep System (Score: 58)
- Below optimal sleep quality
- Difficulty falling asleep
- Recommendations: Sleep hygiene, magnesium supplementation

Stress System (Score: 45)
- Elevated stress levels
- Cortisol imbalance
- Recommendations: Stress reduction, adaptogenic herbs

Digestion System (Score: 80)
- Good digestive health
- Minor bloating reported
- Recommendations: Probiotics, fiber intake

Immunity System (Score: 70)
- Moderate immune function
- Seasonal allergies
- Recommendations: Vitamin C, zinc supplementation

PRIORITY RECOMMENDATIONS:
1. Address sleep quality issues
2. Implement stress management
3. Optimize energy levels
4. Support immune function

FOLLOW-UP TESTS:
- Cortisol testing
- Sleep study if needed
- Comprehensive blood panel
`;

// Write the test content to a file
const testFilePath = path.join(process.cwd(), 'uploads', 'pdfs', 'test_nutriq_report.pdf');
const textFilePath = path.join(process.cwd(), 'uploads', 'pdfs', 'test_nutriq_report.txt');

// For now, create a text file that we can use for testing
fs.writeFileSync(textFilePath, testPDFContent);

console.log('✅ Test NutriQ report created:');
console.log(`📄 File: ${textFilePath}`);
console.log('');
console.log('📋 To test the system:');
console.log('1. Copy a real NutriQ PDF to uploads/pdfs/');
console.log('2. Use the test interface: http://localhost:3000/test-analysis.html');
console.log('3. Or use curl command:');
console.log('');
console.log(`curl -X POST http://localhost:3000/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "filename": "your_real_nutriq.pdf",
    "clientEmail": "test@example.com",
    "clientFirstName": "John",
    "clientLastName": "Doe",
    "clientDateOfBirth": "1985-03-15"
  }'`);
console.log('');
console.log('🔬 The system will:');
console.log('- Detect it as a NutriQ report');
console.log('- Extract body system scores');
console.log('- Generate recommendations');
console.log('- Save to database');
console.log('- Return structured results'); 