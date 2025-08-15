/**
 * Test script for Assessment API endpoints
 * Run with: npx tsx scripts/test-assessment-api.ts
 */

import { assessmentAPI } from '@/lib/api/assessment-client';

// Test client ID - replace with a real one from your database
const TEST_CLIENT_ID = 'test-client-123';

async function testAssessmentAPI() {
  console.log('🧪 Testing Assessment API Endpoints...\n');

  let assessmentId: string | null = null;

  try {
    // Test 1: Start Assessment
    console.log('Test 1: Starting Assessment');
    console.log('============================');
    const startResult = await assessmentAPI.startAssessment(TEST_CLIENT_ID);
    
    if (startResult.success && startResult.data) {
      assessmentId = startResult.data.assessmentId;
      console.log('✅ Assessment started successfully');
      console.log('   Assessment ID:', assessmentId);
      console.log('   Status:', startResult.data.status);
      console.log('   Resuming:', startResult.data.resuming);
    } else {
      console.error('❌ Failed to start assessment:', startResult.error);
      return;
    }

    console.log('\n');

    // Test 2: Get Next Question
    console.log('Test 2: Get Next Question');
    console.log('========================');
    const questionResult = await assessmentAPI.getNextQuestion(assessmentId);
    
    if (questionResult.success && questionResult.data) {
      console.log('✅ Got next question');
      console.log('   Question ID:', questionResult.data.question?.id);
      console.log('   Question Text:', questionResult.data.question?.text);
      console.log('   Module:', questionResult.data.question?.module);
      console.log('   Progress:', questionResult.data.progress?.overallProgress + '%');
    } else {
      console.error('❌ Failed to get question:', questionResult.error);
    }

    console.log('\n');

    // Test 3: Submit Response
    if (questionResult.success && questionResult.data?.question) {
      console.log('Test 3: Submit Response');
      console.log('======================');
      
      const responseResult = await assessmentAPI.submitResponse(
        assessmentId,
        questionResult.data.question.id,
        3, // Example value
        'Test response text',
        0.8 // Confidence
      );

      if (responseResult.success) {
        console.log('✅ Response saved successfully');
        console.log('   Progress:', responseResult.data?.progress);
      } else {
        console.error('❌ Failed to save response:', responseResult.error);
      }
    }

    console.log('\n');

    // Test 4: Get Progress
    console.log('Test 4: Get Progress');
    console.log('===================');
    const progressResult = await assessmentAPI.getProgress(assessmentId);
    
    if (progressResult.success && progressResult.data) {
      console.log('✅ Got progress data');
      console.log('   Questions Asked:', progressResult.data.questionsAsked);
      console.log('   Completion Rate:', progressResult.data.completionRate + '%');
      console.log('   Current Module:', progressResult.data.currentModule);
      console.log('   Est. Minutes Remaining:', progressResult.data.estimatedMinutesRemaining);
    } else {
      console.error('❌ Failed to get progress:', progressResult.error);
    }

    console.log('\n');

    // Test 5: Pause Assessment
    console.log('Test 5: Pause Assessment');
    console.log('=======================');
    const pauseResult = await assessmentAPI.pauseAssessment(assessmentId);
    
    if (pauseResult.success) {
      console.log('✅ Assessment paused');
      console.log('   Status:', pauseResult.data?.status);
    } else {
      console.error('❌ Failed to pause:', pauseResult.error);
    }

    console.log('\n');

    // Test 6: Resume Assessment
    console.log('Test 6: Resume Assessment');
    console.log('========================');
    const resumeResult = await assessmentAPI.resumeAssessment(assessmentId);
    
    if (resumeResult.success) {
      console.log('✅ Assessment resumed');
      console.log('   Status:', resumeResult.data?.status);
      console.log('   Questions Answered:', resumeResult.data?.questionsAnswered);
    } else {
      console.error('❌ Failed to resume:', resumeResult.error);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }

  console.log('\n🎉 API endpoint tests complete!');
  console.log('\nNote: These tests require:');
  console.log('1. A valid client ID in the database');
  console.log('2. An active assessment template');
  console.log('3. Database connection configured');
  console.log('4. Next.js server running (npm run dev)');
}

// Alternative: Test with curl commands
console.log('\n📝 Alternative: Test with curl commands\n');
console.log('Start assessment:');
console.log(`curl -X POST http://localhost:3000/api/assessment/start -H "Content-Type: application/json" -d '{"clientId":"${TEST_CLIENT_ID}"}'`);
console.log('\nGet next question:');
console.log('curl http://localhost:3000/api/assessment/[assessment-id]/next-question');
console.log('\nSubmit response:');
console.log('curl -X POST http://localhost:3000/api/assessment/[assessment-id]/response -H "Content-Type: application/json" -d \'{"questionId":"SCR001","value":3}\'');

// Run tests if this file is executed directly
if (require.main === module) {
  testAssessmentAPI().catch(console.error);
}
