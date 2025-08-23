// Test the question bank after our fixes
const path = require('path');

// Since we can't run TypeScript directly, let's test by counting the actual exports
const testQuestionBank = async () => {
  console.log('Testing question bank after fixes...\n');
  
  // Use the seed endpoint to check the loaded questions
  try {
    const response = await fetch('http://localhost:3000/api/assessment/seed', {
      method: 'POST'
    });
    
    const data = await response.json();
    
    console.log('Seed endpoint response:');
    console.log('  Success:', data.success);
    console.log('  Message:', data.message);
    console.log('  Total Questions:', data.stats?.totalQuestions);
    console.log('  Modules:', data.stats?.modules);
    console.log('  Seed Oil Questions:', data.stats?.seedOilQuestions);
    console.log('  Template ID:', data.stats?.templateId);
    
    // Also check GET to see current template
    console.log('\nCurrent template status:');
    const getResponse = await fetch('http://localhost:3000/api/assessment/seed');
    const currentTemplate = await getResponse.json();
    
    console.log('  Template Name:', currentTemplate.name);
    console.log('  Version:', currentTemplate.version);
    console.log('  Total Questions:', currentTemplate.totalQuestions);
    console.log('  Created:', currentTemplate.createdAt);
    console.log('  Updated:', currentTemplate.updatedAt);
    
    if (currentTemplate.totalQuestions < 300) {
      console.log('\n⚠️ WARNING: Only', currentTemplate.totalQuestions, 'questions loaded!');
      console.log('Expected: 309 questions');
      console.log('\nThe server may need to be restarted to pick up the changes.');
      console.log('Please run: npm run dev');
    } else {
      console.log('\n✅ All questions loaded successfully!');
    }
    
  } catch (error) {
    console.error('Error testing question bank:', error.message);
    console.log('\nMake sure the development server is running.');
  }
};

testQuestionBank();
