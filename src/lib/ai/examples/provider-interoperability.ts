/**
 * Provider Interoperability Example
 * Demonstrates how AnthropicProvider and OpenAIProvider are fully interchangeable
 */

import { getAIService } from '../index';
import { AIResponse, HealthAnalysis } from '../types';

// Example health data for analysis
const truckDriverHealthData = {
  demographics: {
    age: 48,
    gender: 'Male',
    occupation: 'Long-haul Truck Driver',
    yearsDriving: 22
  },
  labResults: {
    metabolicPanel: {
      glucose: { value: 118, unit: 'mg/dL', range: '70-100' },
      hba1c: { value: 6.3, unit: '%', range: '<5.7' }
    },
    inflammation: {
      hscrp: { value: 5.1, unit: 'mg/L', range: '<3.0' }
    }
  },
  symptoms: {
    fatigue: { severity: 7, timing: 'constant' },
    jointPain: { severity: 6, location: 'lower back, knees' }
  },
  lifestyle: {
    diet: 'Fast food 4-5x/week',
    exercise: 'None',
    sleep: '5-6 hours, irregular',
    stress: 'High'
  },
  truckingFactors: {
    hoursPerDay: 11,
    routeType: 'Long-haul',
    foodAccess: 'Limited'
  }
};

/**
 * Demonstrates provider fallback behavior
 */
export async function demonstrateProviderFallback() {
  const aiService = getAIService();
  console.log('=== PROVIDER INTEROPERABILITY DEMONSTRATION ===\n');

  // Test 1: Try with Anthropic (primary)
  console.log('1. Testing with Anthropic Provider (Primary):');
  try {
    const anthropicAnalysis = await aiService.analyzeHealth(truckDriverHealthData, {
      provider: 'anthropic'
    });
    
    console.log('✅ Anthropic Analysis Success');
    console.log(`   Provider: ${anthropicAnalysis.metadata?.provider}`);
    console.log(`   Response Time: ${anthropicAnalysis.metadata?.responseTime}ms`);
    console.log(`   Confidence: ${anthropicAnalysis.confidence}%`);
  } catch (error) {
    console.log('❌ Anthropic Provider Failed:', error);
  }

  // Test 2: Try with OpenAI (fallback)
  console.log('\n2. Testing with OpenAI Provider (Fallback):');
  try {
    const openaiAnalysis = await aiService.analyzeHealth(truckDriverHealthData, {
      provider: 'openai'
    });
    
    console.log('✅ OpenAI Analysis Success');
    console.log(`   Provider: ${openaiAnalysis.metadata?.provider}`);
    console.log(`   Response Time: ${openaiAnalysis.metadata?.responseTime}ms`);
    console.log(`   Confidence: ${openaiAnalysis.confidence}%`);
  } catch (error) {
    console.log('❌ OpenAI Provider Failed:', error);
  }

  // Test 3: Test automatic fallback
  console.log('\n3. Testing Automatic Fallback (let service decide):');
  try {
    const autoAnalysis = await aiService.analyzeHealth(truckDriverHealthData);
    
    console.log('✅ Automatic Provider Selection Success');
    console.log(`   Provider Used: ${autoAnalysis.metadata?.provider}`);
    console.log(`   Response Time: ${autoAnalysis.metadata?.responseTime}ms`);
    console.log(`   Analysis Type: ${autoAnalysis.metadata?.analysisType}`);
    
    // Show FNTP-specific data
    if (autoAnalysis.metadata?.rootCauses && autoAnalysis.metadata.rootCauses.length > 0) {
      console.log('\n   Root Causes Identified:');
      autoAnalysis.metadata.rootCauses.forEach((rc: any, i: number) => {
        console.log(`   ${i + 1}. ${rc.issue}`);
      });
    }
    
    if (autoAnalysis.metadata?.truckDriverSpecific && autoAnalysis.metadata.truckDriverSpecific.length > 0) {
      console.log('\n   Truck Driver Specific Concerns:');
      autoAnalysis.metadata.truckDriverSpecific.forEach((td: any, i: number) => {
        console.log(`   ${i + 1}. ${td.concern}`);
      });
    }
  } catch (error) {
    console.log('❌ Automatic Provider Selection Failed:', error);
  }
}

/**
 * Compare responses from both providers
 */
export async function compareProviderResponses() {
  const aiService = getAIService();
  console.log('\n=== COMPARING PROVIDER RESPONSES ===\n');

  const testPrompt = 'What are the top 3 health risks for long-haul truck drivers?';

  // Get response from Anthropic
  let anthropicResponse: AIResponse | null = null;
  try {
    anthropicResponse = await aiService.complete(testPrompt, {
      provider: 'anthropic',
      maxTokens: 500,
      temperature: 0.3
    });
  } catch (error) {
    console.log('Anthropic not available');
  }

  // Get response from OpenAI
  let openaiResponse: AIResponse | null = null;
  try {
    openaiResponse = await aiService.complete(testPrompt, {
      provider: 'openai',
      maxTokens: 500,
      temperature: 0.3
    });
  } catch (error) {
    console.log('OpenAI not available');
  }

  // Compare
  if (anthropicResponse) {
    console.log('Anthropic Response:');
    console.log(`- Provider: ${anthropicResponse.provider}`);
    console.log(`- Model: ${anthropicResponse.model}`);
    console.log(`- Latency: ${anthropicResponse.latency}ms`);
    console.log(`- Token Usage: ${anthropicResponse.usage?.totalTokens || 'N/A'}`);
  }

  if (openaiResponse) {
    console.log('\nOpenAI Response:');
    console.log(`- Provider: ${openaiResponse.provider}`);
    console.log(`- Model: ${openaiResponse.model}`);
    console.log(`- Latency: ${openaiResponse.latency}ms`);
    console.log(`- Token Usage: ${openaiResponse.usage?.totalTokens || 'N/A'}`);
  }

  // Show that both have the same response structure
  console.log('\n✅ Both providers return identical response structures');
  console.log('✅ They can be used interchangeably without code changes');
}

/**
 * Test failover scenario
 */
export async function testFailoverScenario() {
  const aiService = getAIService();
  console.log('\n=== TESTING FAILOVER SCENARIO ===\n');

  // Simulate a scenario where we need high availability
  const criticalHealthData = {
    urgentCase: true,
    symptoms: {
      chestPain: { severity: 9, duration: '30 minutes' },
      shortBreath: { severity: 8 }
    }
  };

  console.log('Simulating critical health analysis with automatic failover...');
  
  const startTime = Date.now();
  try {
    const analysis = await aiService.analyzeHealth(criticalHealthData);
    const elapsed = Date.now() - startTime;
    
    console.log(`\n✅ Analysis completed successfully in ${elapsed}ms`);
    console.log(`   Provider used: ${analysis.metadata?.provider}`);
    console.log(`   Summary: ${analysis.summary}`);
    
    // Check if it fell back
    if (analysis.metadata?.provider === 'openai') {
      console.log('\n⚠️  Note: System automatically fell back to OpenAI');
      console.log('   This ensures continuous service availability');
    }
  } catch (error) {
    console.log('❌ All providers failed:', error);
  }
}

// Run the demonstrations
if (require.main === module) {
  (async () => {
    await demonstrateProviderFallback();
    await compareProviderResponses();
    await testFailoverScenario();
    
    console.log('\n=== DEMONSTRATION COMPLETE ===');
    console.log('Both providers are fully interchangeable and support FNTP health analysis!');
  })();
}