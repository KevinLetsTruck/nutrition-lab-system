// Test script to debug question loading
const path = require('path');

// Load question modules directly
try {
  console.log('Loading question modules...\n');
  
  const modules = [
    'screening-questions',
    'screening-questions-additional',
    'assimilation-questions',
    'defense-repair-questions',
    'energy-questions',
    'biotransformation-questions',
    'transport-questions',
    'communication-questions',
    'structural-questions'
  ];
  
  let totalQuestions = 0;
  const loadedQuestions = {};
  
  for (const moduleName of modules) {
    try {
      // Try to require the module
      const modulePath = path.join(__dirname, 'lib', 'assessment', 'questions', moduleName + '.ts');
      console.log(`Checking ${modulePath}...`);
      
      // Read the file content
      const fs = require('fs');
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, 'utf8');
        
        // Count export statements
        const exportMatches = content.match(/export const \w+Questions/g) || [];
        console.log(`  Found ${exportMatches.length} export(s)`);
        
        // Count question IDs
        const idMatches = content.match(/id:\s*["']([A-Z]{3}\d{3})["']/g) || [];
        console.log(`  Found ${idMatches.length} question(s)`);
        
        loadedQuestions[moduleName] = idMatches.length;
        totalQuestions += idMatches.length;
      } else {
        console.log(`  File not found`);
      }
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('Questions per module:');
  Object.entries(loadedQuestions).forEach(([module, count]) => {
    console.log(`  ${module}: ${count}`);
  });
  console.log(`\nTotal questions found: ${totalQuestions}`);
  
  // Now try to load the index file
  console.log('\n=== Testing index.ts ===');
  const indexPath = path.join(__dirname, 'lib', 'assessment', 'questions', 'index.ts');
  if (require('fs').existsSync(indexPath)) {
    const indexContent = require('fs').readFileSync(indexPath, 'utf8');
    const imports = indexContent.match(/import \{[^}]+\} from/g) || [];
    console.log(`Found ${imports.length} imports in index.ts`);
    
    // Check if screening-questions-additional is imported
    if (indexContent.includes('screening-questions-additional')) {
      console.log('✅ Additional screening questions ARE imported');
    } else {
      console.log('❌ Additional screening questions NOT imported');
    }
  }
  
} catch (error) {
  console.error('Error:', error);
}
