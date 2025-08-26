const fs = require('fs');
const path = require('path');

// Function to find questions with incorrect types
function findIncorrectQuestions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Match question blocks
  const questionRegex = /{[\s\S]*?id:\s*"([^"]+)"[\s\S]*?text:\s*"([^"]+)"[\s\S]*?type:\s*"([^"]+)"[\s\S]*?}/g;
  
  let match;
  const issues = [];
  
  while ((match = questionRegex.exec(content)) !== null) {
    const [fullMatch, id, text, type] = match;
    
    // Check if question text suggests it should be YES_NO but is LIKERT_SCALE
    if (type === 'LIKERT_SCALE') {
      if (text.match(/^(Do you|Are you|Have you|Does|Is there|Can you)/i)) {
        issues.push({
          file: fileName,
          id,
          text,
          currentType: type,
          suggestedType: 'YES_NO'
        });
      }
    }
  }
  
  return issues;
}

// Process all question files
const questionsDir = path.join(__dirname, '../lib/assessment/questions');
const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.ts'));

const allIssues = [];

files.forEach(file => {
  const issues = findIncorrectQuestions(path.join(questionsDir, file));
  allIssues.push(...issues);
});

// Display results
console.log(`Found ${allIssues.length} questions that might have incorrect types:\n`);

allIssues.forEach(issue => {
  console.log(`File: ${issue.file}`);
  console.log(`ID: ${issue.id}`);
  console.log(`Text: ${issue.text}`);
  console.log(`Current: ${issue.currentType} → Suggested: ${issue.suggestedType}`);
  console.log('---');
});
