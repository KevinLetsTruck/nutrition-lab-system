// Seed script to load all 406 questions into database
// Run with: npx tsx seed-assessment.ts

import { PrismaClient } from '@prisma/client';
import { allQuestions, questionCounts, getQuestionStats } from './lib/assessment/questions/index';
import { modules } from './lib/assessment/modules';

const prisma = new PrismaClient();

async function seedAssessment() {
  console.log('\n🌱 Starting Assessment Seed Process...\n');

  try {
    // Step 1: Check for existing assessments
    console.log('🔍 Checking for existing client assessments...');
    const clientAssessments = await prisma.clientAssessment.count();
    
    if (clientAssessments > 0) {
      console.log(`   Found ${clientAssessments} client assessments`);
      console.log('   Skipping deletion of templates to preserve client data');
      console.log('   Will create new template instead');
    } else {
      console.log('   No client assessments found');
      console.log('🗑️  Cleaning up old templates...');
      const deleted = await prisma.assessmentTemplate.deleteMany();
      console.log(`   Deleted ${deleted.count} old templates`);
    }

    // Step 2: Get question statistics
    const stats = getQuestionStats();
    console.log('\n📊 Question Statistics:');
    console.log(`   Total Questions: ${stats.total}`);
    console.log(`   Seed Oil Questions: ${stats.seedOilCount}`);
    console.log(`   Unique Question Types: ${Object.keys(stats.byType).length}`);

    // Step 3: Prepare question bank data
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

    // Step 4: Check if main template already exists
    const existingTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id: 'main-v1' }
    });

    if (existingTemplate) {
      console.log('\n🔄 Updating existing template...');
      const template = await prisma.assessmentTemplate.update({
        where: { id: 'main-v1' },
        data: {
          name: 'Comprehensive Functional Medicine Assessment',
          version: '1.0.0',
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
      console.log(`   ✅ Template updated: ${template.id}`);
    } else {
      console.log('\n🔨 Creating new assessment template...');
      const template = await prisma.assessmentTemplate.create({
        data: {
          id: 'main-v1',
          name: 'Comprehensive Functional Medicine Assessment',
          version: '1.0.0',
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
          isActive: true
        }
      });
      console.log(`   ✅ Template created: ${template.id}`);
    }

    // Step 5: Verify the data was saved correctly
    console.log('\n🔍 Verifying database...');
    const verification = await prisma.assessmentTemplate.findUnique({
      where: { id: 'main-v1' }
    });

    if (verification) {
      const savedQuestions = Array.isArray(verification.questionBank) 
        ? verification.questionBank.length 
        : Object.keys(verification.questionBank as any).length;
      
      console.log(`   ✅ Verification successful!`);
      console.log(`   Questions in database: ${savedQuestions}`);
      console.log(`   Template is active: ${verification.isActive}`);
    } else {
      console.error('   ❌ Verification failed - template not found');
    }

    // Step 6: Display module breakdown
    console.log('\n📋 Module Breakdown:');
    Object.entries(stats.byModule).forEach(([module, count]) => {
      const expectedCount = questionCounts[module as keyof typeof questionCounts];
      const status = count >= (expectedCount || 0) ? '✅' : '⚠️';
      console.log(`   ${status} ${module}: ${count} questions`);
    });

    // Step 7: Deactivate old templates if they exist
    if (clientAssessments === 0) {
      console.log('\n🔄 No cleanup needed - fresh database');
    } else {
      console.log('\n🔄 Deactivating old templates...');
      const deactivated = await prisma.assessmentTemplate.updateMany({
        where: { 
          id: { not: 'main-v1' }
        },
        data: {
          isActive: false
        }
      });
      console.log(`   Deactivated ${deactivated.count} old templates`);
    }

    console.log('\n🎉 Assessment seeding complete!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test at: http://localhost:3000/test-simple');
    console.log('   2. View in Prisma Studio: npx prisma studio');
    console.log('   3. Start assessment flow testing');
    console.log('   4. Commit this milestone: git commit -m "feat: loaded 406 questions into database"');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedAssessment()
  .then(() => {
    console.log('\n✨ Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
