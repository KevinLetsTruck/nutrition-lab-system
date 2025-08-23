// Update existing template with all 406 questions
// Run with: npx tsx update-template.ts

import { PrismaClient } from '@prisma/client';
import { allQuestions, getQuestionStats } from './lib/assessment/questions/index';
import { modules } from './lib/assessment/modules';

const prisma = new PrismaClient();

async function updateTemplate() {
  console.log('\n📝 Updating Assessment Template...\n');

  try {
    // Get question statistics
    const stats = getQuestionStats();
    console.log('📊 Question Statistics:');
    console.log(`   Total Questions: ${stats.total}`);
    console.log(`   Seed Oil Questions: ${stats.seedOilCount}`);

    // Prepare question bank data
    const questionBank = allQuestions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      module: q.module,
      options: q.options || [],
      category: q.category,
      scoringWeight: q.scoringWeight || 1,
      labCorrelations: q.labCorrelations || [],
      clinicalRelevance: q.clinicalRelevance || [],
      triggerConditions: q.triggerConditions || [],
      seedOilRelevant: q.seedOilRelevant || q.category === 'SEED_OIL' || q.id?.includes('_SO')
    }));

    // Update the default template with all questions
    console.log('\n🔄 Updating default template...');
    const updated = await prisma.assessmentTemplate.update({
      where: { id: 'default' },
      data: {
        name: 'Comprehensive Functional Medicine Assessment - Complete',
        version: '2.0.0',
        questionBank: questionBank,
        modules: modules,
        scoringRules: {
          nodeWeights: {
            SCREENING: 0.15,
            ASSIMILATION: 0.15,
            DEFENSE_REPAIR: 0.15,
            ENERGY: 0.20,
            BIOTRANSFORMATION: 0.10,
            TRANSPORT: 0.10,
            COMMUNICATION: 0.10,
            STRUCTURAL: 0.05
          },
          seedOilDamageThresholds: {
            low: 10,
            moderate: 25,
            high: 40,
            critical: 55
          },
          overallHealthThresholds: {
            optimal: 80,
            good: 60,
            fair: 40,
            poor: 20
          }
        },
        isActive: true,
        updatedAt: new Date()
      }
    });

    console.log(`   ✅ Template updated: ${updated.id}`);
    console.log(`   Version: ${updated.version}`);
    console.log(`   Questions loaded: ${questionBank.length}`);

    // Verify the update
    console.log('\n🔍 Verifying update...');
    const verification = await prisma.assessmentTemplate.findUnique({
      where: { id: 'default' }
    });

    if (verification) {
      const savedQuestions = Array.isArray(verification.questionBank) 
        ? verification.questionBank.length 
        : Object.keys(verification.questionBank as any).length;
      
      console.log(`   ✅ Verification successful!`);
      console.log(`   Questions in database: ${savedQuestions}`);
    }

    console.log('\n🎉 Template update complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test at: http://localhost:3000/test-simple');
    console.log('   2. View in Prisma Studio: npx prisma studio');
    console.log('   3. Commit: git add . && git commit -m "feat: loaded 406 questions into database"');

  } catch (error) {
    console.error('\n❌ Update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateTemplate()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
