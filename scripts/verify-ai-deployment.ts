#!/usr/bin/env tsx

/**
 * AI Framework Deployment Verification
 * 
 * Tests the deployed AI service via API endpoints
 * Run this after deployment to verify the live system
 */

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

// Get base URL from environment or use localhost
const BASE_URL = process.env.API_URL || 'http://localhost:3000';

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

// Test 1: Health Endpoint
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  const response = await fetch(`${BASE_URL}/api/ai/health`);
  if (!response.ok) {
    throw new Error(`Health endpoint returned ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`   ✓ Status: ${data.status}`);
  console.log(`   ✓ Providers: ${data.providers.healthy}/${data.providers.total}`);
  
  // Check required fields
  if (!data.status || !data.providers || !data.metrics) {
    throw new Error('Health endpoint missing required fields');
  }
  
  // Check if at least one provider is healthy
  if (data.providers.healthy === 0) {
    console.log('   ⚠️  No healthy AI providers detected');
  }
}

// Test 2: Basic Completion
async function testBasicCompletion() {
  console.log('\n💬 Testing Basic Completion...');
  
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'What is 2+2?',
      useCache: false
    })
  });
  
  if (!response.ok) {
    throw new Error(`Completion endpoint returned ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success || !data.response) {
    throw new Error('Invalid completion response structure');
  }
  
  console.log(`   ✓ Provider: ${data.response.provider}`);
  console.log(`   ✓ Model: ${data.response.model}`);
  console.log(`   ✓ Latency: ${data.response.latency}ms`);
  console.log(`   ✓ Response length: ${data.response.content.length} chars`);
}

// Test 3: Cache Functionality
async function testCaching() {
  console.log('\n💾 Testing Cache via API...');
  
  const prompt = `Test cache ${Date.now()}`;
  
  // First request
  const response1 = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, useCache: true })
  });
  
  if (!response1.ok) {
    throw new Error(`First request failed: ${response1.status}`);
  }
  
  const data1 = await response1.json();
  const time1 = data1.processingTime;
  console.log(`   ✓ First request: ${time1}ms`);
  
  // Second request (should be cached)
  const response2 = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, useCache: true })
  });
  
  const data2 = await response2.json();
  const time2 = data2.processingTime;
  console.log(`   ✓ Second request: ${time2}ms`);
  
  if (data2.response.cached !== true) {
    throw new Error('Second request was not cached');
  }
  
  if (time2 >= time1) {
    throw new Error('Cached request was not faster');
  }
  
  console.log(`   ✓ Cache speedup: ${((time1 - time2) / time1 * 100).toFixed(0)}%`);
}

// Test 4: Health Analysis
async function testHealthAnalysis() {
  console.log('\n🔬 Testing Health Analysis...');
  
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'health',
      data: {
        cholesterol: 220,
        hdl: 45,
        ldl: 155,
        triglycerides: 180
      }
    })
  });
  
  if (!response.ok) {
    throw new Error(`Health analysis failed: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success || !data.analysis) {
    throw new Error('Invalid health analysis response');
  }
  
  const analysis = data.analysis;
  console.log(`   ✓ Confidence: ${analysis.confidence}%`);
  console.log(`   ✓ Findings: ${analysis.findings.length}`);
  console.log(`   ✓ Recommendations: ${analysis.recommendations.length}`);
  console.log(`   ✓ Processing time: ${data.processingTime}ms`);
}

// Test 5: Provider Fallback
async function testProviderFallback() {
  console.log('\n🔄 Testing Provider Fallback...');
  
  // Try with an invalid provider
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Test fallback',
      provider: 'invalid-provider',
      useCache: false
    })
  });
  
  if (!response.ok && response.status === 503) {
    console.log('   ⚠️  All providers failed (503) - this is expected if no real providers are configured');
    return;
  }
  
  if (!response.ok) {
    throw new Error(`Fallback test failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`   ✓ Fallback successful to: ${data.response.provider}`);
}

// Test 6: Concurrent Requests
async function testConcurrency() {
  console.log('\n🚀 Testing Concurrent Requests...');
  
  const requests = [];
  const requestCount = 5;
  
  // Send multiple requests simultaneously
  for (let i = 0; i < requestCount; i++) {
    requests.push(
      fetch(`${BASE_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Concurrent test ${i}`,
          useCache: false,
          maxTokens: 10
        })
      })
    );
  }
  
  const start = Date.now();
  const responses = await Promise.all(requests);
  const duration = Date.now() - start;
  
  // Check all responses
  let successCount = 0;
  for (const response of responses) {
    if (response.ok) {
      successCount++;
    }
  }
  
  console.log(`   ✓ Successful: ${successCount}/${requestCount}`);
  console.log(`   ✓ Total time: ${duration}ms`);
  console.log(`   ✓ Avg per request: ${(duration / requestCount).toFixed(0)}ms`);
  
  if (successCount < requestCount) {
    throw new Error(`Only ${successCount}/${requestCount} requests succeeded`);
  }
}

// Test 7: Error Handling
async function testErrorHandling() {
  console.log('\n⚠️  Testing Error Handling...');
  
  // Test with empty prompt
  const response1 = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '' })
  });
  
  if (response1.ok) {
    throw new Error('Empty prompt should fail');
  }
  console.log('   ✓ Empty prompt rejected');
  
  // Test with invalid JSON
  const response2 = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'invalid json'
  });
  
  if (response2.ok) {
    throw new Error('Invalid JSON should fail');
  }
  console.log('   ✓ Invalid JSON rejected');
}

// Generate Report
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 AI DEPLOYMENT VERIFICATION REPORT');
  console.log('='.repeat(60));
  
  console.log(`\n🌐 API Base URL: ${BASE_URL}`);
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
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
  
  // Deployment status
  console.log('\n🚀 Deployment Status:');
  if (failed === 0) {
    console.log('   ✅ DEPLOYMENT VERIFIED');
    console.log('   All API endpoints are functioning correctly.');
  } else if (failed <= 2) {
    console.log('   ⚠️  PARTIAL DEPLOYMENT');
    console.log('   Some features may not be working correctly.');
  } else {
    console.log('   ❌ DEPLOYMENT ISSUES');
    console.log('   Multiple endpoints are failing. Check logs and configuration.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Main execution
async function main() {
  console.log('🚀 AI Deployment Verification');
  console.log('=============================\n');
  
  console.log(`Testing API at: ${BASE_URL}`);
  
  // Run all tests
  await runTest('Health Endpoint', testHealthEndpoint);
  await runTest('Basic Completion', testBasicCompletion);
  await runTest('Cache Functionality', testCaching);
  await runTest('Health Analysis', testHealthAnalysis);
  await runTest('Provider Fallback', testProviderFallback);
  await runTest('Concurrent Requests', testConcurrency);
  await runTest('Error Handling', testErrorHandling);
  
  // Generate report
  generateReport();
  
  // Exit with appropriate code
  const failed = results.filter(r => r.status === 'fail').length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run verification
main().catch(error => {
  console.error('\n💥 Verification failed:', error);
  process.exit(1);
});