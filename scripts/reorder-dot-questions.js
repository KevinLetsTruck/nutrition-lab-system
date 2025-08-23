const fs = require('fs');
const path = require('path');

// Function to reorder DOT questions
function reorderDOTQuestions() {
  const filePath = path.join(__dirname, '../lib/assessment/questions/screening-questions-additional.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the questions we need to reorder
  const scr067Match = content.match(/(\s*{\s*id:\s*"SCR067"[\s\S]*?}\s*,)/);
  const scr068Match = content.match(/(\s*{\s*id:\s*"SCR068"[\s\S]*?}\s*,)/);
  const scr069Match = content.match(/(\s*{\s*id:\s*"SCR069"[\s\S]*?}\s*,)/);
  const scr070Match = content.match(/(\s*{\s*id:\s*"SCR070"[\s\S]*?}\s*,)/);
  
  if (!scr067Match || !scr068Match || !scr069Match || !scr070Match) {
    console.error('Could not find all DOT questions');
    return;
  }
  
  // Remove all DOT questions from their current positions
  content = content.replace(scr067Match[0], '');
  content = content.replace(scr068Match[0], '');
  content = content.replace(scr069Match[0], '');
  content = content.replace(scr070Match[0], '');
  
  // Find where to insert them (after SCR066)
  const insertPoint = content.indexOf('// Truck Driver Specific');
  if (insertPoint === -1) {
    console.error('Could not find insertion point');
    return;
  }
  
  // Find the next line after the comment
  const afterComment = content.indexOf('\n', insertPoint) + 1;
  
  // Insert the questions in the correct order
  const orderedQuestions = 
    scr067Match[0] + '\n' + 
    scr068Match[0] + '\n' + 
    scr069Match[0] + '\n' + 
    scr070Match[0];
  
  content = content.slice(0, afterComment) + orderedQuestions + content.slice(afterComment);
  
  // Write the updated content
  fs.writeFileSync(filePath, content);
  console.log('✅ Reordered DOT questions: SCR067 now comes before SCR068, SCR069, and SCR070');
}

reorderDOTQuestions();
