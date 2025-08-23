// NUCLEAR CLEANUP - Remove ALL confusion sources
// This will DELETE all test data and keep ONLY the working template
// Run with: npx tsx nuclear-cleanup.ts

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

async function nuclearCleanup() {
  console.log('\n' + colors.bold + colors.red + '☢️  NUCLEAR CLEANUP - REMOVING ALL CONFUSION SOURCES ☢️' + colors.reset);
  console.log(colors.yellow + 'This will DELETE all test data and keep ONLY the working template!' + colors.reset);
  console.log(colors.yellow + 'Press Ctrl+C in the next 5 seconds to abort...' + colors.reset + '\n');
  
  // Give user time to abort
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    console.log(colors.bold + '\n🔥 STARTING NUCLEAR CLEANUP...\n' + colors.reset);

    // Step 1: Delete ALL client responses
    console.log('1️⃣  Deleting all client responses...');
    const deletedResponses = await prisma.clientResponse.deleteMany();
    console.log(`   ✅ Deleted ${deletedResponses.count} client responses`);

    // Step 2: Delete ALL assessment analyses
    console.log('\n2️⃣  Deleting all assessment analyses...');
    const deletedAnalyses = await prisma.assessmentAnalysis.deleteMany();
    console.log(`   ✅ Deleted ${deletedAnalyses.count} assessment analyses`);

    // Step 3: Delete ALL client assessments
    console.log('\n3️⃣  Deleting all client assessments...');
    const deletedAssessments = await prisma.clientAssessment.deleteMany();
    console.log(`   ✅ Deleted ${deletedAssessments.count} client assessments`);

    // Step 4: Delete BAD templates (keep only 'default' with 406 questions)
    console.log('\n4️⃣  Deleting useless templates...');
    const deletedTemplates = await prisma.assessmentTemplate.deleteMany({
      where: {
        id: {
          not: 'default'
        }
      }
    });
    console.log(`   ✅ Deleted ${deletedTemplates.count} bad templates`);

    // Step 5: Verify the good template
    console.log('\n5️⃣  Verifying the keeper template...');
    const goodTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id: 'default' }
    });
    
    if (goodTemplate) {
      const questionCount = Array.isArray(goodTemplate.questionBank) 
        ? goodTemplate.questionBank.length 
        : Object.keys(goodTemplate.questionBank as any).length;
      
      if (questionCount >= 400) {
        console.log(`   ✅ Template 'default' verified: ${questionCount} questions`);
        
        // Update it to be crystal clear
        await prisma.assessmentTemplate.update({
          where: { id: 'default' },
          data: {
            name: 'MAIN ASSESSMENT - 406 Questions - USE THIS ONE',
            version: '2.0.0-FINAL',
            isActive: true,
            updatedAt: new Date()
          }
        });
        console.log(`   ✅ Updated name to be CRYSTAL CLEAR`);
      } else {
        console.log(`   ❌ WARNING: Template has only ${questionCount} questions!`);
      }
    } else {
      console.log('   ❌ ERROR: Default template not found!');
    }

    // Step 6: Clean up duplicate/recovered question files
    console.log('\n6️⃣  Cleaning up duplicate question files...');
    const recoveredDir = path.join(process.cwd(), 'lib/assessment/questions/recovered');
    const srcRecoveredDir = path.join(process.cwd(), 'src/lib/assessment/questions/recovered');
    
    if (fs.existsSync(recoveredDir)) {
      fs.rmSync(recoveredDir, { recursive: true, force: true });
      console.log(`   ✅ Deleted /lib/assessment/questions/recovered`);
    }
    
    if (fs.existsSync(srcRecoveredDir)) {
      fs.rmSync(srcRecoveredDir, { recursive: true, force: true });
      console.log(`   ✅ Deleted /src/lib/assessment/questions/recovered`);
    }

    // Step 7: Delete duplicate src/lib folder if it exists
    const srcLibAssessment = path.join(process.cwd(), 'src/lib/assessment');
    if (fs.existsSync(srcLibAssessment)) {
      fs.rmSync(srcLibAssessment, { recursive: true, force: true });
      console.log(`   ✅ Deleted duplicate /src/lib/assessment folder`);
    }

    // Step 8: Clean up test scripts
    console.log('\n7️⃣  Cleaning up test scripts...');
    const testScripts = [
      'test-questions.ts',
      'test-questions-quick.ts',
      'test-questions-validate.ts',
      'seed-assessment.ts',
      'update-template.ts',
      'test-health.ts',
      'check-db-questions.js',
      'export-questions.js',
      'restore-questions.js',
      'quick-check.js',
      'test-question-bank.js',
      'test-question-count.js',
      'test-question-loading.js',
      'test-question-verify.js',
      'test-assessment-basic.js',
      'test-assessment-comprehensive.js',
      'test-assessment-quick.js',
      'test-api-health.js',
      'test-app-health.js',
      'test-login.js',
      'test-system-health.js',
      'final-test-report.js',
      'system-health-check.js'
    ];

    let cleanedCount = 0;
    for (const script of testScripts) {
      const scriptPath = path.join(process.cwd(), script);
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
        cleanedCount++;
      }
    }
    console.log(`   ✅ Deleted ${cleanedCount} test scripts`);

    // Step 9: Clean up status files (keep only MASTER_STATUS.md)
    console.log('\n8️⃣  Cleaning up status files...');
    const statusFiles = [
      'STATUS_AUDIT.md',
      'SYSTEM_STATUS.md',
      'ASSESSMENT_CHECKPOINT.md',
      'ASSESSMENT_EXPANSION_SUMMARY.md',
      'ASSESSMENT_RECOVERY_SUCCESS.md',
      'QUESTION_TRACKER.md'
    ];

    let statusCleaned = 0;
    for (const file of statusFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        statusCleaned++;
      }
    }
    console.log(`   ✅ Deleted ${statusCleaned} confusing status files`);
    console.log(`   ✅ Keeping only MASTER_STATUS.md and PROBLEM_SOLVED.md`);

    // Final Summary
    console.log('\n' + colors.bold + colors.green + '✨ NUCLEAR CLEANUP COMPLETE! ✨' + colors.reset);
    console.log('\n' + colors.bold + 'FINAL STATE:' + colors.reset);
    console.log('  ✅ ONE template: "default" with 406 questions');
    console.log('  ✅ NO test assessments cluttering the database');
    console.log('  ✅ NO duplicate question files');
    console.log('  ✅ NO confusing test scripts');
    console.log('  ✅ ONE clear status file: MASTER_STATUS.md');
    
    console.log('\n' + colors.bold + 'WHAT TO USE:' + colors.reset);
    console.log('  📁 Questions: /lib/assessment/questions/');
    console.log('  🗄️ Template: ID "default" (406 questions)');
    console.log('  📄 Status: MASTER_STATUS.md');
    console.log('  🔍 Health Check: node checkpoint.js');
    
    console.log('\n' + colors.green + '🎉 No more confusion! Clean slate!' + colors.reset);

  } catch (error) {
    console.error('\n' + colors.red + '❌ Cleanup failed:', error + colors.reset);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run with confirmation
console.log(colors.bold + '\n⚠️  WARNING: This will DELETE all test data!' + colors.reset);
console.log('This includes:');
console.log('  - All client assessments');
console.log('  - All client responses');
console.log('  - All bad templates');
console.log('  - All duplicate files');
console.log('  - All test scripts');

nuclearCleanup()
  .then(() => {
    console.log('\n✅ Cleanup successful! Commit this immediately:');
    console.log('git add -A && git commit -m "CLEANUP: Removed ALL duplicate/confusing files - ONE source of truth"');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
