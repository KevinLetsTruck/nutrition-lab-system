/**
 * AI Service Usage Examples
 * 
 * This file demonstrates how to use the AI service in your application
 */

import { getAIService, analyzeLabResults, generateHealthReport } from './index';

// Example 1: Simple text completion
async function example1_simpleCompletion() {
  try {
    const aiService = getAIService();
    const response = await aiService.complete(
      'What are the key nutritional considerations for someone with prediabetes?'
    );
    
    console.log('AI Response:', response.content);
    console.log('Provider used:', response.provider);
    console.log('Tokens used:', response.usage?.totalTokens);
  } catch (error) {
    console.error('Completion failed:', error);
  }
}

// Example 2: Completion with specific provider and options
async function example2_providerSpecificCompletion() {
  try {
    const aiService = getAIService();
    const response = await aiService.complete(
      'Explain the relationship between gut health and immune function',
      {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.3,
        maxTokens: 2000,
        systemPrompt: 'You are a functional medicine expert. Provide detailed, scientific explanations.',
      }
    );
    
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example 3: Analyze lab results
async function example3_analyzeLabResults() {
  const labResults = {
    cbc: {
      hemoglobin: { value: 12.5, unit: 'g/dL', range: '13.5-17.5' },
      hematocrit: { value: 37.2, unit: '%', range: '41-53' },
      wbc: { value: 4.2, unit: 'K/uL', range: '4.5-11.0' },
    },
    metabolic: {
      glucose: { value: 115, unit: 'mg/dL', range: '70-100' },
      hba1c: { value: 6.2, unit: '%', range: '<5.7' },
    },
    thyroid: {
      tsh: { value: 4.8, unit: 'mIU/L', range: '0.4-4.0' },
      freeT4: { value: 0.9, unit: 'ng/dL', range: '0.9-1.7' },
    },
  };

  try {
    const analysis = await analyzeLabResults(labResults);
    
    console.log('Health Analysis Summary:', analysis.summary);
    console.log('\nKey Findings:');
    analysis.findings.forEach(finding => {
      console.log(`- ${finding.description} (${finding.severity})`);
    });
    
    console.log('\nRecommendations:');
    analysis.recommendations.forEach(rec => {
      console.log(`- [${rec.priority}] ${rec.description}`);
    });
    
    console.log('\nConfidence:', analysis.confidence + '%');
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

// Example 4: Generate comprehensive health report
async function example4_comprehensiveHealthReport() {
  const healthData = {
    labResults: {
      // Lab data here
    },
    symptoms: {
      fatigue: { severity: 7, frequency: 'daily' },
      brain_fog: { severity: 5, frequency: 'often' },
      digestive_issues: { type: 'bloating', frequency: 'after meals' },
    },
    medications: [
      { name: 'Metformin', dose: '500mg', frequency: 'twice daily' },
      { name: 'Vitamin D3', dose: '2000 IU', frequency: 'daily' },
    ],
    lifestyle: {
      diet: 'Standard American Diet',
      exercise: 'Sedentary',
      sleep: '5-6 hours/night',
      stress: 'High',
    },
  };

  try {
    const report = await generateHealthReport(healthData);
    console.log('Comprehensive Health Report:', report);
  } catch (error) {
    console.error('Report generation failed:', error);
  }
}

// Example 5: Check provider status
async function example5_checkProviderStatus() {
  const aiService = getAIService();
  const status = aiService.getProviderStatus();
  
  console.log('AI Provider Status:');
  Object.entries(status).forEach(([provider, info]) => {
    console.log(`${provider}: ${info.healthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    if (info.lastCheck) {
      console.log(`  Last checked: ${info.lastCheck.toISOString()}`);
    }
  });
}

// Example 6: Use caching for repeated queries
async function example6_cachedQueries() {
  const aiService = getAIService();
  const prompt = 'What are the symptoms of vitamin B12 deficiency?';
  
  // First call - will hit the API
  console.time('First call');
  const response1 = await aiService.complete(prompt);
  console.timeEnd('First call');
  console.log('Cached:', response1.cached || false);
  
  // Second call - should be cached
  console.time('Second call');
  const response2 = await aiService.complete(prompt);
  console.timeEnd('Second call');
  console.log('Cached:', response2.cached || false);
  
  // Get cache statistics
  const cacheStats = aiService.getCacheStats();
  console.log('Cache stats:', cacheStats);
}

// Example 7: Error handling and fallback
async function example7_errorHandling() {
  try {
    // Force a specific provider that might fail
    const aiService = getAIService();
    const response = await aiService.complete(
      'Test prompt',
      {
        provider: 'openai', // This might fail if no API key
        useCache: false,
      }
    );
    
    console.log('Success with provider:', response.provider);
  } catch (error) {
    console.error('Error:', error);
    
    // The service should automatically fall back to mock provider
    // Let's try again without specifying a provider
    try {
      const fallbackResponse = await aiService.complete('Test prompt');
      console.log('Fallback success with provider:', fallbackResponse.provider);
    } catch (fallbackError) {
      console.error('Even fallback failed:', fallbackError);
    }
  }
}

// Export examples for testing
export const examples = {
  simpleCompletion: example1_simpleCompletion,
  providerSpecificCompletion: example2_providerSpecificCompletion,
  analyzeLabResults: example3_analyzeLabResults,
  comprehensiveHealthReport: example4_comprehensiveHealthReport,
  checkProviderStatus: example5_checkProviderStatus,
  cachedQueries: example6_cachedQueries,
  errorHandling: example7_errorHandling,
};