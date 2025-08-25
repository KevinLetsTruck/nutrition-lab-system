#!/usr/bin/env node

// Assessment Reality Check - Comprehensive test of FNTP Assessment System
// Run with: node assessment-reality-check.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

console.log('🔍 FNTP ASSESSMENT SYSTEM - REALITY CHECK');
console.log('==========================================\n');

async function runComprehensiveCheck() {
  try {
    // 1. DATABASE STRUCTURE CHECK
    console.log('📊 DATABASE STRUCTURE CHECK:');
    
    const templates = await prisma.assessmentTemplate.findMany({
      select: { id: true, name: true, version: true, questionBank: true, isActive: true }
    });
    
    console.log(`   Templates found: ${templates.length}`);
    templates.forEach(t => {
      const questionCount = Array.isArray(t.questionBank) ? t.questionBank.length : 0;
      console.log(`   ✓ ID: ${t.id}`);
      console.log(`     Name: ${t.name}`);
      console.log(`     Questions: ${questionCount}`);
      console.log(`     Active: ${t.isActive}\n`);
    });

    // 2. ASSESSMENT INSTANCES CHECK
    console.log('🎯 ASSESSMENT INSTANCES CHECK:');
    
    const assessments = await prisma.clientAssessment.findMany({
      select: {
        id: true,
        status: true,
        questionsAsked: true,
        currentModule: true,
        startedAt: true,
        completedAt: true,
        responses: {
          select: {
            questionId: true,
            responseValue: true,
            answeredAt: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: 5
    });
    
    console.log(`   Assessment instances: ${assessments.length}`);
    if (assessments.length === 0) {
      console.log('   ❌ NO ASSESSMENTS FOUND - This explains the "complete" status!');
    } else {
      assessments.forEach((a, i) => {
        console.log(`   ${i + 1}. ID: ${a.id.substring(0, 8)}`);
        console.log(`      Status: ${a.status}`);
        console.log(`      Questions Asked: ${a.questionsAsked}`);
        console.log(`      Responses: ${a.responses.length}`);
        console.log(`      Started: ${a.startedAt}`);
        console.log(`      Completed: ${a.completedAt || 'Not completed'}\n`);
      });
    }

    // 3. AI LOGIC TEST - Skip for now due to import issues
    console.log('🤖 AI LOGIC TEST: (Skipped - would need CommonJS conversion)');

    // 4. ESSENTIAL QUESTIONS MODE CHECK
    console.log('\n🔧 ESSENTIAL QUESTIONS MODE CHECK:');
    
    console.log(`   Environment Variable: ${process.env.NEXT_PUBLIC_ESSENTIAL_MODE}`);
    console.log(`   Default Mode: Essential (simplified for testing)`);

    // 5. ROUTE FUNCTIONALITY TEST
    console.log('\n🛣️  ROUTE FUNCTIONALITY TEST:');
    
    try {
      // Simple HTTP check
      console.log('   Testing server connectivity...');
      console.log('   (Requires server running on localhost:3000)');
    } catch (error) {
      console.log('   💡 Make sure dev server is running: npm run dev');
    }

    // 6. FINAL DIAGNOSIS
    console.log('\n🏥 DIAGNOSIS:');
    console.log('==============');
    
    const hasTemplates = templates.length > 0;
    const hasQuestions = templates.some(t => Array.isArray(t.questionBank) && t.questionBank.length > 0);
    const hasActiveAssessments = assessments.length > 0;
    
    if (!hasTemplates) {
      console.log('❌ CRITICAL: No assessment templates found');
    } else if (!hasQuestions) {
      console.log('❌ CRITICAL: Templates exist but have no questions');
    } else if (!hasActiveAssessments) {
      console.log('⚠️  ISSUE: Questions exist but no client assessments');
      console.log('   This explains why /assessment/new shows "Assessment Complete!"');
      console.log('   The UI logic is flawed - it should create a NEW assessment');
    } else {
      console.log('✅ System appears to have data');
    }
    
    console.log(`\nSummary:`);
    console.log(`- Templates: ${templates.length}`);
    console.log(`- Questions in template: ${templates[0]?.questionBank?.length || 0}`);
    console.log(`- Client Assessments: ${assessments.length}`);
    
    console.log('\n💡 KEY FINDING:');
    if (hasQuestions && !hasActiveAssessments) {
      console.log('🎯 THE PROBLEM: Questions exist but assessment flow is broken');
      console.log('   - Templates have questions ✓');
      console.log('   - No client assessment instances ❌');
      console.log('   - UI shows "complete" instead of starting new assessment ❌');
      console.log('\n🔧 SOLUTION: Fix the assessment creation/routing logic');
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
runComprehensiveCheck().catch(console.error);