// Test script to validate all questions
import { allQuestions, getQuestionStats, validateQuestionIds, getSeedOilQuestions } from './lib/assessment/questions';

console.log('🧪 ASSESSMENT QUESTION VALIDATION\n');
console.log('=' .repeat(50));

// Get statistics
const stats = getQuestionStats();
console.log('\n📊 QUESTION STATISTICS:');
console.log(`Total Questions: ${stats.total}`);
console.log(`Completion: ${stats.completionPercentage}%`);
console.log(`Seed Oil Questions: ${stats.seedOilCount}`);

console.log('\n📦 QUESTIONS BY MODULE:');
Object.entries(stats.byModule).forEach(([module, count]) => {
  console.log(`  ${module}: ${count} questions`);
});

console.log('\n🎯 QUESTIONS BY TYPE:');
Object.entries(stats.byType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count} questions`);
});

// Validate unique IDs
console.log('\n🔍 VALIDATING UNIQUE IDs:');
const validation = validateQuestionIds();
if (validation.valid) {
  console.log('✅ All question IDs are unique');
} else {
  console.error('❌ Duplicate IDs found:', validation.duplicates);
}

// Check required fields
console.log('\n📋 CHECKING REQUIRED FIELDS:');
const missingFields = allQuestions.filter(q => 
  !q.id || !q.text || !q.type || !q.module
);
if (missingFields.length === 0) {
  console.log('✅ All questions have required fields');
} else {
  console.error('❌ Questions missing required fields:');
  missingFields.forEach(q => console.log(`  - ${q.id || 'NO ID'}`));
}

// Validate seed oil questions
console.log('\n🌻 SEED OIL QUESTION VALIDATION:');
const seedOilQuestions = getSeedOilQuestions();
const seedOilByModule = seedOilQuestions.reduce((acc, q) => {
  acc[q.module] = (acc[q.module] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

Object.entries(seedOilByModule).forEach(([module, count]) => {
  console.log(`  ${module}: ${count} seed oil questions`);
});

// Check for any malformed options
console.log('\n⚙️ CHECKING QUESTION OPTIONS:');
let optionErrors = 0;
allQuestions.forEach(q => {
  if (['MULTIPLE_CHOICE', 'MULTI_SELECT', 'FREQUENCY'].includes(q.type)) {
    if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
      console.error(`❌ ${q.id}: Missing or invalid options`);
      optionErrors++;
    }
  }
  if (q.type === 'LIKERT_SCALE') {
    if (!q.scale || typeof q.scale.min !== 'number' || typeof q.scale.max !== 'number') {
      console.error(`❌ ${q.id}: Invalid Likert scale configuration`);
      optionErrors++;
    }
  }
});

if (optionErrors === 0) {
  console.log('✅ All question options are properly configured');
}

// Summary
console.log('\n' + '=' .repeat(50));
console.log('📊 VALIDATION SUMMARY:');
console.log(`✅ ${stats.total} questions loaded successfully`);
console.log(`✅ ${Object.keys(stats.byModule).length} modules with questions`);
console.log(`✅ ${stats.seedOilCount} seed oil questions integrated`);
console.log(`📈 ${stats.completionPercentage}% of total questions complete`);

// Next steps
console.log('\n🎯 NEXT STEPS:');
console.log('1. Run: npm run db:seed to populate database');
console.log('2. Test assessment flow with current questions');
console.log('3. Continue adding remaining modules');
console.log('\n✅ Validation Complete!');
