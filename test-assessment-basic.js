#!/usr/bin/env node

/**
 * Basic Assessment System Test
 * Tests core functionality step by step
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  dim: '\x1b[2m'
};

async function test(name, fn) {
  try {
    console.log(`\n${colors.blue}Testing: ${name}${colors.reset}`);
    await fn();
    console.log(`${colors.green}✓ ${name} passed${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ ${name} failed${colors.reset}`);
    console.error(`  Error: ${error.message}`);
    return false;
  }
}

async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`http://localhost:3000/api${endpoint}`, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
  }
  
  return data;
}

async function runTests() {
  console.log(`${colors.yellow}=== Basic Assessment System Test ===${colors.reset}`);
  console.log(`Testing against: http://localhost:3000`);
  
  let assessmentId = null;
  const results = [];
  
  // Test 1: Check API health
  results.push(await test('API Health Check', async () => {
    const data = await makeRequest('/health');
    if (!data.status || data.status !== 'ok') {
      throw new Error('API health check failed');
    }
  }));
  
  // Test 2: Get assessment info
  results.push(await test('Get Assessment Info', async () => {
    const data = await makeRequest('/assessment/info');
    console.log(`  Total questions: ${data.totalQuestions}`);
    console.log(`  Modules: ${data.modules.join(', ')}`);
  }));
  
  // Test 3: Create new assessment
  results.push(await test('Create New Assessment', async () => {
    const data = await makeRequest('/assessment/create', 'POST', {
      clientInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        age: 35,
        sex: 'female'
      }
    });
    
    assessmentId = data.assessmentId;
    console.log(`  Assessment ID: ${assessmentId}`);
    console.log(`  Status: ${data.status}`);
  }));
  
  // Test 4: Get first question
  if (assessmentId) {
    results.push(await test('Get First Question', async () => {
      const data = await makeRequest(`/assessment/${assessmentId}/next-question`);
      console.log(`  Module: ${data.module}`);
      console.log(`  Question: ${data.question.text.substring(0, 50)}...`);
      console.log(`  Type: ${data.question.type}`);
    }));
    
    // Test 5: Submit an answer
    results.push(await test('Submit Answer', async () => {
      const data = await makeRequest(`/assessment/${assessmentId}/submit-response`, 'POST', {
        questionId: 'SCREEN_001',
        response: {
          type: 'LIKERT_SCALE',
          value: 5
        }
      });
      console.log(`  Responses saved: ${data.totalResponses}`);
      console.log(`  Progress: ${data.progress}%`);
    }));
    
    // Test 6: Check patterns
    results.push(await test('Check Pattern Detection', async () => {
      const data = await makeRequest(`/assessment/${assessmentId}/patterns`);
      console.log(`  Active patterns: ${data.patterns.length}`);
      if (data.patterns.length > 0) {
        console.log(`  Detected: ${data.patterns.map(p => p.name).join(', ')}`);
      }
    }));
  }
  
  // Summary
  console.log(`\n${colors.yellow}=== Test Summary ===${colors.reset}`);
  const passed = results.filter(r => r).length;
  const failed = results.length - passed;
  
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  if (failed > 0) {
    console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  }
  
  console.log(`\n${passed === results.length ? colors.green + '✓ All tests passed!' : colors.red + '✗ Some tests failed'}${colors.reset}\n`);
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
