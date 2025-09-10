/**
 * Update Production with Medium-Priority Question Fixes
 */

const { PrismaClient } = require('@prisma/client');

const PRODUCTION_FIXES = [
  { id: 13, newText: 'How do carbohydrate-rich foods affect your digestive comfort?' },
  { id: 22, newText: 'How do foods cooked in vegetable oils (canola, soybean, corn oil) affect how you feel?' },
  { id: 23, newText: 'How do processed foods affect your energy and inflammation levels?' },
  { id: 24, newText: 'How do foods with artificial preservatives, colors, or flavors affect how you feel?' },
  { id: 31, newText: 'How has antibiotic use in the past 2 years affected your digestive health?' },
  { id: 34, newText: 'How do artificial sweeteners or sugar substitutes affect your digestive health?' }
];

async function updateProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚂 Updating production database with medium-priority fixes...\n');
    
    for (const fix of PRODUCTION_FIXES) {
      await prisma.fmDigestiveQuestion.update({
        where: { id: fix.id },
        data: {
          questionText: fix.newText,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Updated Question ${fix.id} in production`);
    }
    
    console.log('\n🎯 Production database updated with all medium-priority UX fixes');
    console.log('📈 Completion rate barriers eliminated for dietary diversity');
    
  } catch (error) {
    console.error('❌ Production update failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateProduction();
