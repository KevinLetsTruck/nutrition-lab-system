import { getNextQuestionWithAI } from '../lib/ai/assessment-ai';
import { ClientResponse, ModuleType } from '../lib/assessment/types';

// Test the Claude AI question selection
async function testClaudeAssessment() {
  console.log('🧪 Testing Claude AI Assessment Integration...\n');

  // Mock some responses with varying severity
  const mockResponses: ClientResponse[] = [
    {
      id: 'resp1',
      assessmentId: 'test123',
      questionId: 'screening_1',
      questionText: 'How would you rate your overall energy levels?',
      questionModule: 'SCREENING',
      responseType: 'LIKERT_SCALE',
      responseValue: 8, // High severity!
      answeredAt: new Date()
    },
    {
      id: 'resp2',
      assessmentId: 'test123',
      questionId: 'screening_2',
      questionText: 'Do you experience brain fog or mental fatigue?',
      questionModule: 'SCREENING',
      responseType: 'YES_NO',
      responseValue: 'yes',
      answeredAt: new Date()
    },
    {
      id: 'resp3',
      assessmentId: 'test123',
      questionId: 'screening_3',
      questionText: 'How often do you eat fried foods?',
      questionModule: 'SCREENING',
      responseType: 'FREQUENCY',
      responseValue: 'daily',
      answeredAt: new Date()
    }
  ];

  const mockContext = {
    currentModule: 'SCREENING' as ModuleType,
    responses: mockResponses,
    symptomProfile: {
      SCREENING: {
        energy_issues: 8,
        brain_fog: true,
        fried_food_frequency: 'daily'
      }
    },
    questionsAsked: 3,
    assessmentContext: {
      highSeveritySymptoms: [
        { questionId: 'screening_1', severity: 8, module: 'SCREENING' }
      ],
      seedOilExposure: [
        { questionId: 'screening_3', response: 'daily', timestamp: new Date() }
      ]
    }
  };

  try {
    console.log('📊 Current Context:');
    console.log(`- Module: ${mockContext.currentModule}`);
    console.log(`- Questions Asked: ${mockContext.questionsAsked}`);
    console.log(`- High Severity Symptoms: ${mockContext.assessmentContext.highSeveritySymptoms.length}`);
    console.log(`- Recent Responses:`);
    mockResponses.forEach(r => {
      console.log(`  • ${r.questionText}: ${r.responseValue}`);
    });
    console.log('\n');

    console.log('🤖 Calling Claude AI for next question selection...\n');
    
    const startTime = Date.now();
    const aiDecision = await getNextQuestionWithAI(mockContext);
    const duration = Date.now() - startTime;

    console.log('✅ Claude AI Response:');
    console.log(`- Next Question: ${aiDecision.nextQuestion?.text || 'None (assessment complete)'}`);
    console.log(`- Question ID: ${aiDecision.nextQuestion?.id || 'N/A'}`);
    console.log(`- Questions Saved: ${aiDecision.questionsSaved || 0}`);
    console.log(`- Reasoning: ${aiDecision.reasoning}`);
    console.log(`- Response Time: ${duration}ms`);
    
    if (aiDecision.nextModule) {
      console.log(`- Moving to Module: ${aiDecision.nextModule}`);
    }

    console.log('\n🎯 Expected Behavior:');
    console.log('- Should skip basic energy questions due to high severity (8/10)');
    console.log('- Should prioritize mitochondrial/metabolic questions');
    console.log('- Should consider seed oil exposure pattern');
    console.log('- Should save 2-5 questions by intelligent selection');

  } catch (error) {
    console.error('❌ Error testing Claude AI:', error);
    console.log('\n💡 Make sure ANTHROPIC_API_KEY is set in your .env.local file');
  }
}

// Run the test
testClaudeAssessment()
  .then(() => {
    console.log('\n✨ Test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
