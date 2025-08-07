/**
 * AI Service Test Suite
 * 
 * Manual test script for AI Service functionality
 * Run with: npx tsx src/lib/ai/__tests__/ai-service.test.ts
 */

import { AIService } from '../ai-service';
import { AIServiceConfig, AIProviderType, AIServiceError } from '../types';
import { AnthropicProvider } from '../providers/anthropic-provider';
import { OpenAIProvider } from '../providers/openai-provider';
import { MockProvider } from '../providers/mock-provider';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ ${message}`);
    testsFailed++;
  }
}

async function assertAsync(fn: () => Promise<boolean>, message: string): Promise<void> {
  try {
    const result = await fn();
    assert(result, message);
  } catch (error) {
    console.error(`❌ ${message} - Error: ${error}`);
    testsFailed++;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Fallback Mechanism
async function testFallbackMechanism() {
  console.log('\n🧪 Test 1: Fallback Mechanism');
  console.log('================================');
  
  // Create service with mock config
  const service = new AIService({
    providers: {
      anthropic: { apiKey: 'mock-key' },
      openai: { apiKey: 'mock-key' }
    },
    debug: false
  });

  // Monkey-patch providers to simulate failure
  const providers = (service as any).providers;
  const originalAnthropicComplete = providers.get('anthropic')?.complete;
  
  // Make Anthropic fail
  if (providers.has('anthropic')) {
    providers.get('anthropic').complete = async () => {
      throw new AIServiceError('Simulated Anthropic failure', 'PROVIDER_ERROR', 'anthropic');
    };
  }

  // Replace OpenAI with a working mock
  providers.set('openai', new MockProvider());
  
  try {
    const response = await service.complete('Test fallback');
    assert(response.provider === 'openai' || response.provider === 'mock', 
      'Should fallback to OpenAI or Mock when Anthropic fails');
    assert(response.content.length > 0, 'Should return valid content from fallback provider');
  } catch (error) {
    assert(false, `Fallback should not throw error: ${error}`);
  }

  // Restore original
  if (originalAnthropicComplete && providers.has('anthropic')) {
    providers.get('anthropic').complete = originalAnthropicComplete;
  }
}

// Test 2: Cache Functionality
async function testCacheFunctionality() {
  console.log('\n🧪 Test 2: Cache Functionality');
  console.log('================================');
  
  const service = new AIService({
    providers: {
      mock: {}
    },
    cache: {
      enabled: true,
      ttl: 60 * 1000 // 1 minute
    },
    debug: false
  });

  const prompt = 'Test cache prompt ' + Date.now();
  
  // First request
  const response1 = await service.complete(prompt, { useCache: true });
  assert(!response1.cached, 'First request should not be cached');
  
  // Second request (should be cached)
  const response2 = await service.complete(prompt, { useCache: true });
  assert(response2.cached === true, 'Second request should be cached');
  assert(response2.content === response1.content, 'Cached response should have same content');
  assert(response2.provider === response1.provider, 'Cached response should have same provider');
  
  // Request with cache disabled
  const response3 = await service.complete(prompt, { useCache: false });
  assert(!response3.cached, 'Request with useCache=false should not use cache');
}

// Test 3: Health Checks
async function testHealthChecks() {
  console.log('\n🧪 Test 3: Health Checks');
  console.log('================================');
  
  const service = new AIService({
    providers: {
      mock: {}
    },
    debug: false
  });

  // Wait a bit for initial health check
  await sleep(500);
  
  const healthStatus = await service.healthCheck();
  
  assert(typeof healthStatus === 'object', 'Health check should return an object');
  assert('mock' in healthStatus, 'Health status should include mock provider');
  
  const mockHealth = healthStatus.mock;
  assert(typeof mockHealth.healthy === 'boolean', 'Provider health should be boolean');
  assert(mockHealth.lastCheck instanceof Date, 'Last check should be a Date');
  // Note: Mock provider has random health status for testing (90% healthy)
  
  // Test provider status
  const providerStatus = service.getProviderStatus();
  assert(typeof providerStatus === 'object', 'Provider status should return an object');
  assert(providerStatus.mock?.available === true, 'Mock provider should be available');
  assert(typeof providerStatus.mock?.healthy === 'boolean', 'Provider health status should be boolean');
}

// Test 4: Mock Provider Fallback
async function testMockProviderFallback() {
  console.log('\n🧪 Test 4: Mock Provider (All Others Fail)');
  console.log('================================');
  
  // Create service with no real API keys
  const service = new AIService({
    providers: {
      anthropic: { apiKey: 'invalid-key' },
      openai: { apiKey: 'invalid-key' }
    },
    debug: false
  });

  // Make all real providers fail
  const providers = (service as any).providers;
  
  // Replace with failing versions
  class FailingProvider {
    name: AIProviderType = 'anthropic';
    async isHealthy() { return false; }
    async complete() { 
      throw new AIServiceError('Provider failed', 'PROVIDER_ERROR', this.name);
    }
    async analyzeHealth() { 
      throw new AIServiceError('Provider failed', 'PROVIDER_ERROR', this.name);
    }
  }
  
  providers.set('anthropic', new FailingProvider());
  const failingOpenAI = new FailingProvider();
  failingOpenAI.name = 'openai';
  providers.set('openai', failingOpenAI);
  
  // Ensure mock provider exists
  providers.set('mock', new MockProvider());
  
  try {
    const response = await service.complete('Test mock fallback');
    assert(response.provider === 'mock', 'Should fallback to mock provider when all others fail');
    assert(response.content.length > 0, 'Should return mock content');
    assert(response.model === 'mock-model-v1', 'Should use mock model');
  } catch (error) {
    assert(false, `Should not throw when mock provider is available: ${error}`);
  }
}

// Test 5: Metrics Tracking
async function testMetricsTracking() {
  console.log('\n🧪 Test 5: Metrics Tracking');
  console.log('================================');
  
  const service = new AIService({
    providers: {
      mock: {}
    },
    cache: {
      enabled: true
    },
    debug: false
  });

  // Clear any existing metrics
  (service as any).metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    providerUsage: {},
    averageLatency: 0,
    startTime: Date.now()
  };

  // Get initial metrics
  const metrics1 = service.getMetrics();
  assert(metrics1.totalRequests === 0, 'Initial total requests should be 0');
  assert(metrics1.successfulRequests === 0, 'Initial successful requests should be 0');
  assert(metrics1.cacheHits === 0, 'Initial cache hits should be 0');
  
  // Make a successful request
  const prompt1 = 'Test metrics ' + Date.now();
  await service.complete(prompt1, { useCache: true });
  
  const metrics2 = service.getMetrics();
  assert(metrics2.totalRequests === 1, 'Total requests should increment to 1');
  assert(metrics2.successfulRequests === 1, 'Successful requests should increment to 1');
  assert(metrics2.cacheHits === 0, 'Cache hits should still be 0');
  assert(parseFloat(metrics2.successRate) === 100, 'Success rate should be 100%');
  
  // Make same request again (cache hit)
  await service.complete(prompt1, { useCache: true });
  
  const metrics3 = service.getMetrics();
  assert(metrics3.totalRequests === 2, 'Total requests should increment to 2');
  assert(metrics3.successfulRequests === 2, 'Successful requests should increment to 2');
  assert(metrics3.cacheHits === 1, 'Cache hits should increment to 1');
  assert(parseFloat(metrics3.cacheHitRate) === 50, 'Cache hit rate should be 50%');
  
  // Check provider usage
  assert(metrics3.providerUsage.mock === 1, 'Mock provider usage should be 1 (excluding cache hit)');
  
  // Test failed request
  const providers = (service as any).providers;
  const originalMockComplete = providers.get('mock').complete;
  providers.get('mock').complete = async () => {
    throw new Error('Simulated failure');
  };
  
  try {
    await service.complete('Test failure');
  } catch (error) {
    // Expected to fail
  }
  
  const metrics4 = service.getMetrics();
  assert(metrics4.totalRequests === 3, 'Total requests should increment to 3');
  assert(metrics4.failedRequests === 1, 'Failed requests should increment to 1');
  assert(Math.round(parseFloat(metrics4.successRate)) === 67, 'Success rate should be ~67%');
  
  // Restore original
  providers.get('mock').complete = originalMockComplete;
  
  // Test average latency
  assert(typeof metrics4.averageLatency === 'number', 'Average latency should be a number');
  assert(metrics4.averageLatency > 0, 'Average latency should be greater than 0');
  assert(metrics4.averageLatencyMs > 0, 'Average latency in ms should be greater than 0');
}

// Test 6: Health Analysis
async function testHealthAnalysis() {
  console.log('\n🧪 Test 6: Health Analysis');
  console.log('================================');
  
  const service = new AIService({
    providers: {
      mock: {}
    },
    debug: false
  });

  const healthData = {
    labResults: {
      cholesterol: 200,
      hdl: 50,
      ldl: 130
    }
  };

  try {
    const analysis = await service.analyzeHealth(healthData);
    
    assert(typeof analysis.confidence === 'number', 'Analysis should have confidence score');
    assert(analysis.confidence >= 0 && analysis.confidence <= 100, 'Confidence should be between 0-100');
    assert(Array.isArray(analysis.findings), 'Analysis should have findings array');
    assert(Array.isArray(analysis.recommendations), 'Analysis should have recommendations array');
    assert(typeof analysis.summary === 'string', 'Should have summary field');
    
    // Check structure of findings
    if (analysis.findings.length > 0) {
      const finding = analysis.findings[0];
      assert(typeof finding.category === 'string', 'Finding should have category');
      assert(typeof finding.severity === 'string', 'Finding should have severity');
      assert(typeof finding.description === 'string', 'Finding should have description');
    }
    
    // Check structure of recommendations
    if (analysis.recommendations.length > 0) {
      const rec = analysis.recommendations[0];
      assert(typeof rec.category === 'string', 'Recommendation should have category');
      assert(typeof rec.priority === 'string', 'Recommendation should have priority');
      assert(typeof rec.action === 'string' || typeof rec.description === 'string', 'Recommendation should have action or description');
    }
  } catch (error) {
    assert(false, `Health analysis should not throw: ${error}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 AI Service Test Suite');
  console.log('========================\n');
  
  try {
    await testFallbackMechanism();
    await testCacheFunctionality();
    await testHealthChecks();
    await testMockProviderFallback();
    await testMetricsTracking();
    await testHealthAnalysis();
    
    console.log('\n📊 Test Results');
    console.log('================');
    console.log(`✅ Passed: ${testsPassed}`);
    console.log(`❌ Failed: ${testsFailed}`);
    console.log(`📈 Total:  ${testsPassed + testsFailed}`);
    console.log(`🎯 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(2)}%`);
    
    // Exit with appropriate code
    process.exit(testsFailed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}