const fs = require('fs');
const path = require('path');

// Read the recovered questions
const questionsDir = path.join(__dirname, 'lib/assessment/questions/recovered');
const allQuestionsPath = path.join(questionsDir, 'all-questions.json');

if (!fs.existsSync(allQuestionsPath)) {
  console.log('❌ No recovered questions found');
  process.exit(1);
}

const allQuestions = JSON.parse(fs.readFileSync(allQuestionsPath, 'utf8'));

// Create TypeScript files for each module
const modules = [
  'screening', 'assimilation', 'defense_repair', 
  'energy', 'biotransformation', 'transport', 
  'communication', 'structural'
];

console.log('📦 Creating TypeScript question files...\n');

modules.forEach(module => {
  const moduleName = module.toUpperCase().replace('_', '_');
  const fileName = `${module.replace('_', '-')}-questions.ts`;
  const filePath = path.join(__dirname, 'lib/assessment/questions', fileName);
  
  const moduleQuestions = allQuestions.filter(q => 
    q.module === moduleName.replace('-', '_')
  );
  
  if (moduleQuestions.length === 0) {
    console.log(`⚠️  No questions for ${module}`);
    return;
  }
  
  const content = `import { AssessmentQuestion } from '../types';

export const ${module.replace('_', '')}Questions: AssessmentQuestion[] = ${JSON.stringify(moduleQuestions, null, 2)};
`;
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created ${fileName} with ${moduleQuestions.length} questions`);
});

console.log('\n✨ Question files restored successfully!');
