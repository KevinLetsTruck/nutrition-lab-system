// Test script to correctly count questions
const fs = require('fs');
const path = require('path');

function countQuestionsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Match both quoted and unquoted id patterns
    // Pattern 1: "id": "XXX000"
    const pattern1 = content.match(/"id":\s*"[A-Z]{3}\d{3}"/g) || [];
    // Pattern 2: id: "XXX000"
    const pattern2 = content.match(/id:\s*"[A-Z]{3}\d{3}"/g) || [];
    
    return pattern1.length + pattern2.length;
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

console.log('\n📊 Question Count Report\n');
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
  } else {
    console.log(`${moduleName}: ${count} questions ⚠️`);
  }
});

console.log('=' .repeat(50));
console.log(`\n✅ TOTAL QUESTIONS: ${totalQuestions}\n`);

// Now check the index.ts file
console.log('Checking index.ts imports...');
const indexPath = path.join(basePath, 'index.ts');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check which modules are imported
  console.log('\nImport status:');
  questionFiles.forEach(file => {
    const moduleName = file.replace('.ts', '');
    if (indexContent.includes(`from "./${moduleName}"`)) {
      console.log(`  ✅ ${moduleName} is imported`);
    } else {
      console.log(`  ❌ ${moduleName} is NOT imported`);
    }
  });
  
  // Check if questions are combined in questionBank
  if (indexContent.includes('...screeningQuestionsAdditional') || 
      indexContent.includes('...additionalScreeningQuestions')) {
    console.log('\n✅ Additional screening questions are included in questionBank');
  } else {
    console.log('\n❌ Additional screening questions are NOT included in questionBank');
  }
}
