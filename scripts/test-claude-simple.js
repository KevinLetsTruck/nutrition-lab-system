const { Anthropic } = require('@anthropic-ai/sdk');

// Simple test of Claude AI for assessment
async function testClaude() {
  console.log('🧪 Testing Claude AI Connection...\n');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    console.log('Please add it to your .env.local file');
    return;
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Test prompt similar to what the assessment would use
  const testPrompt = `You are an expert functional medicine practitioner conducting an adaptive health assessment.

Current Assessment Context:
- Module: SCREENING
- Questions asked so far: 3
- Recent responses:
  • "How would you rate your overall energy levels?": 8 (High severity!)
  • "Do you experience brain fog or mental fatigue?": yes
  • "How often do you eat fried foods?": daily

Available questions to choose from:
1. [screening_4] Do you feel rested after sleep? (Type: YES_NO)
2. [screening_5] How many hours do you sleep per night? (Type: NUMBER_INPUT)
3. [screening_15] Have you been diagnosed with chronic fatigue? (Type: YES_NO)
4. [screening_20] Do you crash after meals? (Type: YES_NO)
5. [screening_25] What time of day is your energy lowest? (Type: MULTIPLE_CHOICE)

Based on the high severity fatigue (8/10) and daily fried food consumption, select the NEXT MOST VALUABLE question.

Respond with a JSON object:
{
  "selectedQuestionId": "the_question_id",
  "reasoning": "Brief explanation",
  "questionsToSkip": ["id1", "id2"],
  "estimatedQuestionsSaved": <number>
}`;

  try {
    console.log('🤖 Calling Claude AI...\n');
    const startTime = Date.now();
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: testPrompt
        }
      ]
    });

    const duration = Date.now() - startTime;
    const content = response.content[0].text;
    
    console.log('✅ Claude Response:');
    console.log(content);
    console.log(`\n⏱️  Response Time: ${duration}ms`);

    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('\n📊 Parsed Decision:');
      console.log(`- Selected Question: ${parsed.selectedQuestionId}`);
      console.log(`- Reasoning: ${parsed.reasoning}`);
      console.log(`- Questions to Skip: ${parsed.questionsToSkip?.join(', ') || 'None'}`);
      console.log(`- Estimated Questions Saved: ${parsed.estimatedQuestionsSaved || 0}`);
    }

    console.log('\n✨ Claude AI is working correctly!');
    
  } catch (error) {
    console.error('❌ Error calling Claude:', error.message);
    if (error.message.includes('401')) {
      console.log('\n💡 Your API key may be invalid. Please check your ANTHROPIC_API_KEY');
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testClaude();
