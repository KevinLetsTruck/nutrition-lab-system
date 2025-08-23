const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function exportQuestions() {
  try {
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: 'cmehiw7v20003v2a17ge8c3j7' }
    });
    
    if (!template || !template.questionBank) {
      console.log('No questions found');
      return;
    }
    
    const questions = template.questionBank;
    
    // Group questions by module
    const questionsByModule = {};
    questions.forEach(q => {
      if (!questionsByModule[q.module]) {
        questionsByModule[q.module] = [];
      }
      questionsByModule[q.module].push(q);
    });
    
    // Create backup directory
    const backupDir = path.join(__dirname, 'lib/assessment/questions/recovered');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Save all questions to a single file
    const allQuestionsPath = path.join(backupDir, 'all-questions.json');
    fs.writeFileSync(allQuestionsPath, JSON.stringify(questions, null, 2));
    console.log(`✅ Saved all ${questions.length} questions to ${allQuestionsPath}`);
    
    // Save by module
    Object.entries(questionsByModule).forEach(([module, moduleQuestions]) => {
      const fileName = `${module.toLowerCase()}-questions.json`;
      const filePath = path.join(backupDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(moduleQuestions, null, 2));
      console.log(`✅ Saved ${moduleQuestions.length} ${module} questions to ${fileName}`);
    });
    
    // Check for seed oil questions
    const seedOilQuestions = questions.filter(q => 
      q.seedOilRelevant || (q.category && q.category === 'SEED_OIL')
    );
    
    if (seedOilQuestions.length > 0) {
      const seedOilPath = path.join(backupDir, 'seed-oil-questions.json');
      fs.writeFileSync(seedOilPath, JSON.stringify(seedOilQuestions, null, 2));
      console.log(`✅ Saved ${seedOilQuestions.length} seed oil questions`);
    }
    
    console.log('\n📋 Summary:');
    console.log(`Total Questions: ${questions.length}`);
    console.log(`Modules: ${Object.keys(questionsByModule).length}`);
    console.log(`Seed Oil Questions: ${seedOilQuestions.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportQuestions();
