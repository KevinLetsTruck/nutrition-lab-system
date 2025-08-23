const fs = require('fs');
const path = require('path');

// Questions that should be converted from LIKERT_SCALE to YES_NO
const questionsToFix = [
  { file: 'assimilation-chunk3.ts', id: 'ASM052' },
  { file: 'energy-questions.ts', id: 'ENE006' },
  { file: 'energy-questions.ts', id: 'ENE_SO01' },
  { file: 'energy-questions.ts', id: 'ENE_SO03' },
  { file: 'energy-questions.ts', id: 'ENE_SO07' },
];

// Function to fix a specific question in a file
function fixQuestion(filePath, questionId) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Create regex to find the specific question block
  const questionBlockRegex = new RegExp(
    `(\\{[\\s\\S]*?id:\\s*"${questionId}"[\\s\\S]*?)type:\\s*"LIKERT_SCALE"([\\s\\S]*?\\})`,
    'g'
  );
  
  // Replace LIKERT_SCALE with YES_NO
  content = content.replace(questionBlockRegex, (match, before, after) => {
    let newBlock = `${before}type: "YES_NO"${after}`;
    
    // Remove scale-related properties and add options
    newBlock = newBlock.replace(/scaleMin:\s*"[^"]*",?\s*/g, '');
    newBlock = newBlock.replace(/scaleMax:\s*"[^"]*",?\s*/g, '');
    newBlock = newBlock.replace(/scale:\s*\{[^}]*\},?\s*/g, '');
    
    // Add YES_NO options after type if not already present
    if (!newBlock.includes('options:')) {
      newBlock = newBlock.replace(
        /(type:\s*"YES_NO",?\s*)/,
        `$1
    options: [
      { value: "yes", label: "Yes", score: 3 },
      { value: "no", label: "No", score: 0 },
      { value: "unsure", label: "Unsure", score: 1 },
    ],
    `
      );
    }
    
    return newBlock;
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${questionId} in ${path.basename(filePath)}`);
}

// Process each question
questionsToFix.forEach(({ file, id }) => {
  const filePath = path.join(__dirname, '../lib/assessment/questions', file);
  fixQuestion(filePath, id);
});

console.log('\nAll questions fixed! Now reseeding the database...');
