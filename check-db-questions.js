const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkQuestions() {
  try {
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: 'cmehiw7v20003v2a17ge8c3j7' }
    });
    
    if (!template || !template.questionBank) {
      console.log('No questions found');
      return;
    }
    
    const questions = template.questionBank;
    console.log(`\n📊 ASSESSMENT QUESTIONS IN DATABASE\n${'='.repeat(50)}`);
    console.log(`Total Questions: ${questions.length}\n`);
    
    // Count by module
    const moduleCounts = {};
    const seedOilQuestions = [];
    
    questions.forEach(q => {
      moduleCounts[q.module] = (moduleCounts[q.module] || 0) + 1;
      if (q.seedOilRelevant || (q.category && q.category === 'SEED_OIL')) {
        seedOilQuestions.push(q);
      }
    });
    
    console.log('Questions by Module:');
    Object.entries(moduleCounts).forEach(([module, count]) => {
      console.log(`  ${module}: ${count} questions`);
    });
    
    console.log(`\nSeed Oil Questions: ${seedOilQuestions.length}`);
    
    // Sample some questions
    console.log('\nSample Questions:');
    console.log('First 3:', questions.slice(0, 3).map(q => q.text));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestions();
