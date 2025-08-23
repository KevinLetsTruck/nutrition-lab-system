// Quick test to verify questions load correctly
import { screeningQuestions } from './lib/assessment/questions/screening-questions';

console.log('Testing Question Loading...\n');
console.log('Total Screening Questions:', screeningQuestions.length);
console.log('Expected: 75\n');

// Check for duplicates
const ids = screeningQuestions.map(q => q.id);
const uniqueIds = new Set(ids);
if (ids.length !== uniqueIds.size) {
  console.error('❌ Duplicate question IDs found!');
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  console.log('Duplicates:', duplicates);
} else {
  console.log('✅ No duplicate IDs');
}

// Check seed oil questions
const seedOilQuestions = screeningQuestions.filter(q => 
  q.id.includes('_SO') || q.category === 'SEED_OIL'
);
console.log('\nSeed Oil Questions:', seedOilQuestions.length);
console.log('Seed Oil IDs:', seedOilQuestions.map(q => q.id).join(', '));

// Check question types
const types = new Set(screeningQuestions.map(q => q.type));
console.log('\nQuestion Types Used:', Array.from(types).join(', '));

// Check for required fields
const missingFields = screeningQuestions.filter(q => 
  !q.id || !q.text || !q.type || !q.module
);
if (missingFields.length > 0) {
  console.error('❌ Questions missing required fields:', missingFields.map(q => q.id));
} else {
  console.log('✅ All questions have required fields');
}

console.log('\n✅ Question validation complete!');
