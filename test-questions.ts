// Test script to count all questions
import { allQuestions, getQuestionStats } from './lib/assessment/questions/index';

console.log('\n=== QUESTION BANK AUDIT ===\n');

const stats = getQuestionStats();
console.log('Total Questions:', stats.total);
console.log('\nBy Module:');
Object.entries(stats.byModule).forEach(([module, count]) => {
  console.log(`  ${module}: ${count}`);
});

console.log('\nBy Type:');
Object.entries(stats.byType).forEach(([type, count]) => {
  console.log(`  ${type}: ${count}`);
});

console.log('\nSeed Oil Questions:', stats.seedOilCount);
console.log('Completion Percentage:', stats.completionPercentage + '%');

// Validate uniqueness
const ids = allQuestions.map(q => q.id);
const uniqueIds = new Set(ids);
console.log('\nUnique IDs:', uniqueIds.size);
console.log('Duplicate IDs:', ids.length - uniqueIds.size);

// Check for actual question content
const withText = allQuestions.filter(q => q.text && q.text.length > 0);
console.log('Questions with text:', withText.length);

export {};
