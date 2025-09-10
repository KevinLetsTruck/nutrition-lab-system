/**
 * Update Production Database with Step 2 Context Improvements
 */

const { PrismaClient } = require('@prisma/client');

const PRODUCTION_STEP2_UPDATES = [
  {
    displayOrder: 14,
    questionText: 'How does going without eating for 12+ hours affect your digestive symptoms?',
    questionContext: 'Whether intentional fasting, skipping meals, or longer gaps between eating'
  },
  {
    displayOrder: 22,
    questionContext: 'Restaurant food, fried foods, or home cooking with industrial seed oils. Rate 0 if you avoid these oils.'
  },
  {
    displayOrder: 23,
    questionText: 'How do processed or packaged foods affect your energy and inflammation levels?',
    questionContext: 'Joint pain, skin issues, or digestive inflammation after packaged/processed foods. Rate 0 if you avoid processed foods.'
  },
  {
    displayOrder: 24,
    questionContext: 'Foods with ingredients like MSG, artificial colors, BHT, sodium benzoate, etc. Rate 0 if you avoid foods with artificial additives.'
  },
  {
    displayOrder: 31,
    questionText: 'How has any antibiotic use in the past 2 years affected your digestive health?',
    questionContext: 'Any antibiotic use including oral, topical, or IV antibiotics. Rate 0 if no antibiotic use in past 2 years.'
  },
  {
    displayOrder: 34,
    questionContext: 'Aspartame, sucralose, saccharin, acesulfame K, or other artificial sweeteners. Rate 0 if you avoid artificial sweeteners.'
  }
];

async function updateProductionStep2() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚂 Updating production with Step 2 context improvements...\n');
    
    for (const update of PRODUCTION_STEP2_UPDATES) {
      const updateData = { updatedAt: new Date() };
      
      if (update.questionText) {
        updateData.questionText = update.questionText;
      }
      if (update.questionContext) {
        updateData.questionContext = update.questionContext;
      }
      
      await prisma.fmDigestiveQuestion.updateMany({
        where: { displayOrder: update.displayOrder },
        data: updateData
      });
      
      console.log(`✅ Updated Question ${update.displayOrder} in production`);
    }
    
    console.log('\n🎯 Production updated with enhanced question clarity');
    console.log('📈 Universal applicability achieved with "Rate 0 if you avoid X" guidance');
    
  } catch (error) {
    console.error('❌ Production Step 2 update failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductionStep2();
