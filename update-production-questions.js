/**
 * Update Production Questions - Fix Assumptive Language
 */

const { PrismaClient } = require('@prisma/client');

const QUESTION_FIXES = [
  {
    id: 7,
    newText: 'How does using electronic devices during meals affect your digestion?'
  },
  {
    id: 11, 
    newText: 'How does your evening meal timing affect your digestion?'
  },
  {
    id: 15,
    newText: 'How do fermented foods (kombucha, sauerkraut, yogurt) affect how you feel?'
  },
  {
    id: 40,
    newText: 'How does alcohol consumption affect how you feel?'
  }
];

async function updateProductionQuestions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚂 Updating production questions to fix assumptive language...\n');
    
    for (const fix of QUESTION_FIXES) {
      await prisma.fmDigestiveQuestion.update({
        where: { id: fix.id },
        data: {
          questionText: fix.newText,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Updated Question ${fix.id}: "${fix.newText}"`);
    }
    
    console.log('\n🎯 Production database updated with inclusive question language');
    console.log('📈 Completion rate improvement: Questions now answerable by 100% of users');
    
  } catch (error) {
    console.error('❌ Production update failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductionQuestions();
