#!/usr/bin/env node

/**
 * FNTP Assessment System - Quick Test
 * Tests the assessment API with authentication
 */

const API_BASE = 'http://localhost:3000/api';

// Test credentials
const TEST_USER = {
  email: 'kevin@letstruck.com',
  password: 'Test123!' // You'll need to set this or create a test user
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    console.log(`${colors.cyan}Calling ${method} ${endpoint}...${colors.reset}`);
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      console.log(`${colors.red}Response status: ${response.status}${colors.reset}`);
      console.log(`Response data:`, data);
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`${colors.red}API Error:${colors.reset}`, error.message);
    throw error;
  }
}

async function testAssessmentSystem() {
  console.log(`${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════╗
║         FNTP Assessment System - Quick Test               ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    // Step 1: Try to login
    console.log(`\n${colors.bright}1. Testing Authentication${colors.reset}`);
    console.log(`Attempting login with ${TEST_USER.email}...`);
    
    let token;
    try {
      const loginResult = await apiCall('/auth/login', 'POST', {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      if (loginResult.token) {
        token = loginResult.token;
        console.log(`${colors.green}✓ Login successful!${colors.reset}`);
        console.log(`  Token: ${token.substring(0, 50)}...`);
      } else {
        console.log(`${colors.yellow}⚠️ Login response doesn't include token${colors.reset}`);
        console.log('Response:', loginResult);
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️ Login failed. Will try without authentication.${colors.reset}`);
    }
    
    // Step 2: Test assessment start
    console.log(`\n${colors.bright}2. Testing Assessment Start${colors.reset}`);
    
    try {
      const startResult = await apiCall('/assessment/start', 'POST', null, token);
      
      if (startResult.success && startResult.data) {
        console.log(`${colors.green}✓ Assessment started successfully!${colors.reset}`);
        console.log(`  Assessment ID: ${startResult.data.assessmentId}`);
        console.log(`  First Question: ${startResult.data.firstQuestion?.text || 'N/A'}`);
        console.log(`  Module: ${startResult.data.module}`);
        console.log(`  Questions in Module: ${startResult.data.questionsInModule}`);
        
        const assessmentId = startResult.data.assessmentId;
        const firstQuestion = startResult.data.firstQuestion;
        
        // Step 3: Submit a response
        if (assessmentId && firstQuestion) {
          console.log(`\n${colors.bright}3. Testing Response Submission${colors.reset}`);
          
          const responseResult = await apiCall(
            `/assessment/${assessmentId}/response`, 
            'POST',
            {
              questionId: firstQuestion.id,
              value: 5,
              module: startResult.data.module
            },
            token
          );
          
          if (responseResult.success) {
            console.log(`${colors.green}✓ Response submitted successfully!${colors.reset}`);
            console.log(`  Next Question: ${responseResult.data?.nextQuestion?.text || 'Assessment complete'}`);
            console.log(`  Questions Saved by AI: ${responseResult.data?.questionsSaved || 0}`);
            console.log(`  AI Reasoning: ${responseResult.data?.aiReasoning || 'None'}`);
          }
          
          // Step 4: Check progress
          console.log(`\n${colors.bright}4. Testing Progress Check${colors.reset}`);
          
          const progressResult = await apiCall(
            `/assessment/${assessmentId}/progress`,
            'GET',
            null,
            token
          );
          
          if (progressResult.success) {
            console.log(`${colors.green}✓ Progress retrieved successfully!${colors.reset}`);
            console.log(`  Questions Asked: ${progressResult.data?.questionsAsked || 0}`);
            console.log(`  Questions Saved: ${progressResult.data?.questionsSaved || 0}`);
            console.log(`  Overall Progress: ${progressResult.data?.overallPercentage || 0}%`);
          }
        }
      } else {
        console.log(`${colors.red}✗ Failed to start assessment${colors.reset}`);
        console.log('Response:', startResult);
      }
    } catch (error) {
      console.log(`${colors.red}✗ Assessment test failed: ${error.message}${colors.reset}`);
    }
    
    // Step 5: Test other endpoints
    console.log(`\n${colors.bright}5. Testing Other Endpoints${colors.reset}`);
    
    // Test seed endpoint
    try {
      const seedResult = await apiCall('/assessment/seed', 'GET');
      console.log(`${colors.green}✓ Seed endpoint accessible${colors.reset}`);
      if (seedResult.questions) {
        console.log(`  Total questions: ${seedResult.questions.length}`);
        console.log(`  Modules: ${Object.keys(seedResult.moduleBreakdown || {}).join(', ')}`);
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️ Seed endpoint error: ${error.message}${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.blue}Test Complete!${colors.reset}\n`);
}

// Run the test
testAssessmentSystem().catch(error => {
  console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
  process.exit(1);
});
