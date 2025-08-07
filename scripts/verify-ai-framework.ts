#!/usr/bin/env tsx

/**
 * AI Framework Verification Script
 * 
 * Tests all components of the AI service framework to ensure
 * everything is working correctly after deployment.
 */

import { getAIService, resetAIService } from '../src/lib/ai';
import { CacheManager } from '../src/lib/ai/cache-manager';

// Test result tracking
interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

// Helper to run a test
async function runTest(
  name: string, 
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({
      name,
      status: 'pass',
      message: '✅ Test passed',
      duration: Date.now() - start
    });
  } catch (error) {
    results.push({
      name,
      status: 'fail',
      message: `❌ ${error instanceof Error ? error.message : 'Unknown error'}`,
      duration: Date.now() - start
    });
  }
}

// Test 1: Provider Connections
async function testProviderConnections() {
  console.log('\n🔌 Testing Provider Connections...');
  
  const aiService = getAIService();
  const healthStatus = await aiService.healthCheck();
  
  // Check each provider
  for (const [provider, status] of Object.entries(healthStatus)) {
    if (provider === 'mock') {
      // Mock should always be available
      if (!status.healthy) {
        throw new Error(`Mock provider unhealthy: ${JSON.stringify(status)}`);
      }
      console.log(`   ✅ ${provider}: Available`);
    } else {
      if (status.healthy) {
        console.log(`   ✅ ${provider}: Connected (${status.responseTime}ms)`);
      } else {
        console.log(`   ⚠️  ${provider}: Not available`);
      }
    }
  }
  
  // Ensure at least one provider is available
  const healthyProviders = Object.values(healthStatus).filter(s => s.healthy);
  if (healthyProviders.length === 0) {
    throw new Error('No healthy providers available');
  }
}

// Test 2: Cache Functionality
async function testCaching() {
  console.log('\n💾 Testing Cache Functionality...');
  
  const aiService = getAIService();
  
  // Clear cache first
  await aiService.clearCache();
  console.log('   ✓ Cache cleared');
  
  // Make a request that should be cached
  const prompt = `Test prompt ${Date.now()}`;
  const response1 = await aiService.complete(prompt, { useCache: true });
  console.log(`   ✓ First request completed (${response1.latency}ms)`);
  
  // Make the same request - should hit cache
  const response2 = await aiService.complete(prompt, { useCache: true });
  console.log(`   ✓ Second request completed (${response2.latency || 0}ms)`);
  
  if (!response2.cached) {
    throw new Error('Second request was not cached');
  }
  
  // Verify cache stats
  const cacheStats = await aiService.getCacheStats();
  console.log(`   ✓ Cache type: ${cacheStats.type}`);
  console.log(`   ✓ Cache size: ${cacheStats.size}`);
  
  // Test cache with disabled option
  const response3 = await aiService.complete(prompt, { useCache: false });
  if (response3.cached) {
    throw new Error('Request with useCache:false returned cached result');
  }
  console.log('   ✓ Cache bypass working');
}

// Test 3: Fallback Mechanism
async function testFallback() {
  console.log('\n🔄 Testing Fallback Mechanism...');
  
  const aiService = getAIService();
  
  // Try with an invalid provider
  try {
    const response = await aiService.complete('Test fallback', {
      provider: 'invalid-provider' as any
    });
    console.log(`   ✓ Fallback successful to: ${response.provider}`);
  } catch (error) {
    throw new Error('Fallback mechanism failed');
  }
  
  // If we have multiple providers, test failover
  const status = aiService.getProviderStatus();
  const availableProviders = Object.entries(status)
    .filter(([_, s]) => s.available)
    .map(([name]) => name);
  
  console.log(`   ✓ Available providers: ${availableProviders.join(', ')}`);
  
  if (availableProviders.length > 1) {
    // Force use of each provider
    for (const provider of availableProviders) {
      try {
        const response = await aiService.complete('Test provider', {
          provider: provider as any,
          useCache: false
        });
        console.log(`   ✓ ${provider} responded successfully`);
      } catch (error) {
        console.log(`   ⚠️  ${provider} failed: ${error}`);
      }
    }
  }
}

// Test 4: Response Times
async function testResponseTimes() {
  console.log('\n⏱️  Testing Response Times...');
  
  const aiService = getAIService();
  const timings: { provider: string; time: number }[] = [];
  
  // Test response time for each available provider
  const status = aiService.getProviderStatus();
  const availableProviders = Object.entries(status)
    .filter(([_, s]) => s.available && s.healthy)
    .map(([name]) => name);
  
  for (const provider of availableProviders) {
    try {
      const start = Date.now();
      await aiService.complete('What is 2+2?', {
        provider: provider as any,
        useCache: false,
        maxTokens: 10
      });
      const time = Date.now() - start;
      timings.push({ provider, time });
      console.log(`   ✓ ${provider}: ${time}ms`);
    } catch (error) {
      console.log(`   ⚠️  ${provider}: Failed`);
    }
  }
  
  // Check if any provider is too slow
  const slowProviders = timings.filter(t => t.time > 5000);
  if (slowProviders.length > 0) {
    console.log(`   ⚠️  Slow providers detected: ${slowProviders.map(s => s.provider).join(', ')}`);
  }
}

// Test 5: Health Analysis Function
async function testHealthAnalysis() {
  console.log('\n🏥 Testing Health Analysis...');
  
  const aiService = getAIService();
  
  const testData = {
    cholesterol: 220,
    hdl: 45,
    ldl: 155,
    triglycerides: 180
  };
  
  try {
    const analysis = await aiService.analyzeHealth(testData, {
      useCache: false
    });
    
    console.log(`   ✓ Analysis completed`);
    console.log(`   ✓ Confidence: ${analysis.confidence}%`);
    console.log(`   ✓ Findings: ${analysis.findings.length}`);
    console.log(`   ✓ Recommendations: ${analysis.recommendations.length}`);
    
    // Validate structure
    if (!analysis.summary || typeof analysis.summary !== 'string') {
      throw new Error('Invalid analysis structure: missing summary');
    }
    if (!Array.isArray(analysis.findings)) {
      throw new Error('Invalid analysis structure: findings not array');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('All AI providers failed')) {
      console.log('   ⚠️  No AI providers available for health analysis');
    } else {
      throw error;
    }
  }
}

// Test 6: Metrics Collection
async function testMetrics() {
  console.log('\n📊 Testing Metrics Collection...');
  
  const aiService = getAIService();
  const metrics = aiService.getMetrics();
  
  console.log(`   ✓ Total requests: ${metrics.totalRequests}`);
  console.log(`   ✓ Success rate: ${metrics.successRate}`);
  console.log(`   ✓ Cache hit rate: ${metrics.cacheHitRate}`);
  console.log(`   ✓ Average latency: ${metrics.averageLatencyMs}ms`);
  
  // Verify metrics are being tracked
  if (metrics.totalRequests === 0) {
    throw new Error('No requests tracked in metrics');
  }
  
  // Check provider usage
  const usedProviders = Object.entries(metrics.providerUsage)
    .filter(([_, count]) => count > 0);
  console.log(`   ✓ Providers used: ${usedProviders.map(([p]) => p).join(', ')}`);
}

// Test 7: Cache Backend Detection
async function testCacheBackend() {
  console.log('\n🗄️  Testing Cache Backend...');
  
  const cache = new CacheManager(60000);
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for Redis connection
  
  const stats = await cache.getStats();
  console.log(`   ✓ Cache type: ${stats.type}`);
  
  if (stats.type === 'redis') {
    console.log('   ✓ Redis connection successful');
    
    // Test Redis operations
    const testKey = `test-${Date.now()}`;
    await cache.set(testKey, { test: true });
    const retrieved = await cache.get(testKey);
    if (!retrieved || !retrieved.test) {
      throw new Error('Redis set/get failed');
    }
    await cache.delete(testKey);
    console.log('   ✓ Redis operations working');
  } else {
    console.log('   ℹ️  Using in-memory cache (Redis not configured)');
  }
  
  // Clean up
  if (cache.destroy) {
    cache.destroy();
  }
}

// Generate Health Report
function generateHealthReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 AI FRAMEWORK HEALTH REPORT');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warn').length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   ⚠️  Warnings: ${warnings}`);
  console.log(`   📈 Total: ${results.length}`);
  
  console.log(`\n📝 Test Results:`);
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : 
                 result.status === 'fail' ? '❌' : '⚠️';
    console.log(`   ${icon} ${result.name}`);
    console.log(`      ${result.message}`);
    if (result.duration) {
      console.log(`      Duration: ${result.duration}ms`);
    }
  });
  
  // Overall status
  console.log('\n🏁 Overall Status:');
  if (failed === 0) {
    console.log('   ✅ ALL SYSTEMS OPERATIONAL');
    console.log('   The AI framework is ready for production use.');
  } else if (failed <= 2) {
    console.log('   ⚠️  PARTIALLY OPERATIONAL');
    console.log('   Some features may be limited. Check failed tests above.');
  } else {
    console.log('   ❌ CRITICAL ISSUES DETECTED');
    console.log('   The AI framework has significant problems. Review failures above.');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  const hasNoAIProvider = results.some(r => 
    r.name === 'Provider Connections' && 
    r.message.includes('No healthy providers')
  );
  
  if (hasNoAIProvider) {
    console.log('   🔧 Configure at least one AI provider:');
    console.log('      - Set ANTHROPIC_API_KEY for Claude');
    console.log('      - Set OPENAI_API_KEY for GPT');
  }
  
  const noRedis = results.some(r => 
    r.name === 'Cache Backend' && 
    r.message.includes('in-memory cache')
  );
  
  if (noRedis) {
    console.log('   🔧 Consider configuring Redis for persistent caching:');
    console.log('      - Set REDIS_URL environment variable');
    console.log('      - This improves performance and reduces costs');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
  console.log('🚀 AI Framework Verification Script');
  console.log('==================================\n');
  
  console.log('🔍 Starting verification tests...');
  
  // Run all tests
  await runTest('Provider Connections', testProviderConnections);
  await runTest('Cache Functionality', testCaching);
  await runTest('Fallback Mechanism', testFallback);
  await runTest('Response Times', testResponseTimes);
  await runTest('Health Analysis', testHealthAnalysis);
  await runTest('Metrics Collection', testMetrics);
  await runTest('Cache Backend', testCacheBackend);
  
  // Clean up
  await resetAIService();
  
  // Generate report
  generateHealthReport();
  
  // Exit with appropriate code
  const failed = results.filter(r => r.status === 'fail').length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
main().catch(error => {
  console.error('\n💥 Verification script failed:', error);
  process.exit(1);
});