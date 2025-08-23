const fs = require('fs');
const path = require('path');

// Questions that should have genderSpecific: "female"
const femaleQuestions = [
  'COM001', // For women: How regular are your menstrual cycles?
  'COM023', // For women: Are you in perimenopause or menopause?
  'COM078', // Do you have irregular menstrual cycles? (if applicable)
];

// Function to add genderSpecific property to questions
function addGenderSpecificProperty(filePath, questionIds) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  questionIds.forEach(questionId => {
    // Check if this question exists in the file
    const questionRegex = new RegExp(`(id:\\s*["']${questionId}["'][\\s\\S]*?module:[^,\\n]*,?)`, 'g');
    
    if (content.match(questionRegex)) {
      // Check if genderSpecific already exists
      const hasGenderSpecific = new RegExp(`(id:\\s*["']${questionId}["'][\\s\\S]*?)genderSpecific:`).test(content);
      
      if (!hasGenderSpecific) {
        // Add genderSpecific after the module line
        content = content.replace(
          new RegExp(`(id:\\s*["']${questionId}["'][\\s\\S]*?module:[^,\\n]*,?)`, 'g'),
          '$1\n    genderSpecific: "female", // Only show to females'
        );
        modified = true;
        console.log(`  Added genderSpecific to ${questionId}`);
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${path.basename(filePath)}`);
  }
}

// Process the communication questions files
const questionsDir = path.join(__dirname, '../lib/assessment/questions');

console.log('Adding genderSpecific property to female-specific questions...\n');

// Process communication questions
addGenderSpecificProperty(
  path.join(questionsDir, 'communication-questions.ts'),
  ['COM001', 'COM023']
);

addGenderSpecificProperty(
  path.join(questionsDir, 'communication-questions-additional.ts'),
  ['COM078']
);

console.log('\nDone!');
