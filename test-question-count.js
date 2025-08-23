// Test script to verify question counts
// Run with: node test-question-count.js

const fs = require('fs');
const path = require('path');

function countQuestionsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Count occurrences of "id": pattern (for questions)
    const idMatches = content.match(/"id":\s*"[A-Z]{3}\d{3}"/g) || [];
    // Also count id: pattern (without quotes)
    const idMatches2 = content.match(/id:\s*"[A-Z]{3}\d{3}"/g) || [];
    return idMatches.length + idMatches2.length;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return 0;
  }
}

// Check all question files
const questionFiles = [
  'screening-questions.ts',
  'screening-questions-additional.ts',
  'assimilation-questions.ts',
  'defense-repair-questions.ts',
  'energy-questions.ts',
  'biotransformation-questions.ts',
  'transport-questions.ts',
  'communication-questions.ts',
  'structural-questions.ts'
];

const basePath = path.join(__dirname, 'lib', 'assessment', 'questions');
let totalQuestions = 0;
const moduleCounts = {};

console.log('\n📊 FNTP Assessment Question Count Report\n');
console.log('=' .repeat(50));

questionFiles.forEach(file => {
  const filePath = path.join(basePath, file);
  const count = countQuestionsInFile(filePath);
  const moduleName = file.replace('-questions.ts', '').replace('-additional', ' (additional)').toUpperCase();
  
  if (count > 0) {
    console.log(`${moduleName}: ${count} questions`);
    
    // Aggregate screening questions
    if (file.includes('screening')) {
      moduleCounts['SCREENING'] = (moduleCounts['SCREENING'] || 0) + count;
    } else {
      moduleCounts[moduleName] = count;
    }
    
    totalQuestions += count;
  }
});

console.log('=' .repeat(50));
console.log('\n📈 Module Summary:');
console.log('-' .repeat(50));

Object.entries(moduleCounts).forEach(([module, count]) => {
  console.log(`${module}: ${count} questions`);
});

console.log('-' .repeat(50));
console.log(`\n✅ TOTAL QUESTIONS: ${totalQuestions}\n`);

// Check against targets
const targets = {
  'SCREENING': 75,
  'ASSIMILATION': 65,
  'DEFENSE-REPAIR': 60,
  'ENERGY': 70,
  'BIOTRANSFORMATION': 55,
  'TRANSPORT': 50,
  'COMMUNICATION': 75,
  'STRUCTURAL': 45
};

console.log('📋 Progress vs Targets:');
console.log('-' .repeat(50));

Object.entries(targets).forEach(([module, target]) => {
  const current = moduleCounts[module] || 0;
  const progress = Math.round((current / target) * 100);
  const status = current >= target ? '✅' : '🔄';
  console.log(`${status} ${module}: ${current}/${target} (${progress}%)`);
});

console.log('\n🎯 Goal: 495 total questions');
console.log(`📊 Current: ${totalQuestions} questions (${Math.round((totalQuestions / 495) * 100)}%)`);
console.log(`📝 Remaining: ${495 - totalQuestions} questions needed\n`);

// Seed oil question count
console.log('🌻 Seed Oil Questions:');
questionFiles.forEach(file => {
  const filePath = path.join(basePath, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const seedOilMatches = content.match(/seedOilRelevant["\s]*:["\s]*true/g) || [];
    if (seedOilMatches.length > 0) {
      console.log(`  ${file}: ${seedOilMatches.length} seed oil questions`);
    }
  } catch (error) {
    // Skip if file doesn't exist
  }
});
