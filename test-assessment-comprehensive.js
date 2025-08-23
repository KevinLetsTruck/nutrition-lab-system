#!/usr/bin/env node

/**
 * FNTP Assessment System - Comprehensive Test Suite
 * 
 * This script tests:
 * 1. Assessment creation and initialization
 * 2. AI-driven question selection
 * 3. Pattern detection (metabolic syndrome, gut issues, etc.)
 * 4. Module activation based on responses
 * 5. Save/resume functionality
 * 6. Seed oil metrics calculation
 * 7. Early termination conditions
 */

const API_BASE = 'http://localhost:3000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWVoaXZqdXIwMDAxdjJhMWt3NzBwNWE4IiwiZW1haWwiOiJrZXZpbkBsZXRzdHJ1Y2suY29tIiwicm9sZSI6ImFkbWluIiwiY2xpZW50SWQiOiJjbWVoaXZqdXIwMDAxdjJhMWt3NzBwNWE4IiwiaWF0IjoxNzU1OTExNDc2LCJleHAiOjE3NTY1MTYyNzZ9.VLq7NEUlToeFWmw-m7d4hnORlCc1bZko2sM9MlmAIHQ';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test profiles for different health conditions
const TEST_PROFILES = {
  healthy: {
    name: 'Healthy Individual',
    description: 'Should complete in ~200 questions with minimal issues',
    responses: {
      // Low severity responses (mostly 0-3)
      'screening_1': 2,  // overall_health
      'screening_2': 1,  // energy_level
      'screening_3': 0,  // fatigue_frequency
      'screening_4': 0,  // digestive_issues
      'screening_5': 0,  // bloating_frequency
      'screening_6': 1,  // brain_fog
      'screening_7': 2,  // stress_level
      'screening_8': 0,  // joint_pain
      'screening_9': 0,  // muscle_pain
      'screening_10': 1, // sleep_quality
    }
  },
  metabolic: {
    name: 'Metabolic Syndrome Profile',
    description: 'Should trigger ENERGY and BIOTRANSFORMATION modules',
    responses: {
      'screening_1': 7,  // overall_health (poor)
      'screening_2': 8,  // energy_level (very low)
      'screening_3': 9,  // fatigue_frequency (constant)
      'screening_4': 6,  // digestive_issues
      'screening_5': 7,  // bloating_frequency
      'screening_sugar_cravings': 9, // intense sugar cravings
      'energy_glucose_crashes': 8,   // frequent glucose crashes
      'screening_weight_gain': 8,    // unexplained weight gain
      'screening_insulin_resistance': 7, // signs of insulin resistance
      'screening_seed_oil_exposure': 8,  // high seed oil consumption
    }
  },
  gut_issues: {
    name: 'Gut Health Issues',
    description: 'Should trigger ASSIMILATION deep dive',
    responses: {
      'screening_1': 6,  // overall_health
      'screening_2': 5,  // energy_level
      'screening_3': 6,  // fatigue_frequency
      'screening_4': 9,  // digestive_issues (severe)
      'screening_5': 9,  // bloating_frequency (daily)
      'screening_6': 7,  // brain_fog (gut-brain connection)
      'screening_food_sensitivities': 8, // multiple sensitivities
      'screening_bowel_changes': 8,      // IBS symptoms
      'screening_stomach_pain': 7,       // frequent pain
      'assimilation_dysbiosis': 9,       // clear dysbiosis signs
    }
  },
  seed_oil_damage: {
    name: 'High Seed Oil Exposure',
    description: 'Should flag seed oil damage and trigger detox pathways',
    responses: {
      'screening_seed_oil_exposure': 9,   // very high exposure
      'screening_fried_food_frequency': 8, // frequent fried foods
      'screening_processed_foods': 9,      // high processed intake
      'screening_restaurant_frequency': 8, // eating out often
      'screening_inflammation': 8,         // chronic inflammation
      'screening_joint_pain': 7,          // inflammatory pain
      'energy_mitochondrial_dysfunction': 8, // energy issues
      'biotransformation_detox_symptoms': 7, // poor detox
    }
  }
};

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`${colors.red}API Error:${colors.reset}`, error.message);
    throw error;
  }
}

// Test 1: Basic Assessment Flow
async function testBasicFlow() {
  console.log(`\n${colors.bright}${colors.blue}=== Test 1: Basic Assessment Flow ===${colors.reset}`);
  
  try {
    // Start assessment
    console.log(`${colors.cyan}Starting new assessment...${colors.reset}`);
    const startResult = await apiCall('/assessment/start', 'POST');
    
    if (!startResult.success || !startResult.data) {
      throw new Error('Failed to start assessment');
    }
    
    const { assessmentId, firstQuestion, module } = startResult.data;
    console.log(`${colors.green}✓ Assessment started${colors.reset}`);
    console.log(`  Assessment ID: ${assessmentId}`);
    console.log(`  First Question: ${firstQuestion.text}`);
    console.log(`  Module: ${module}`);
    
    // Submit first response
    console.log(`\n${colors.cyan}Submitting first response...${colors.reset}`);
    const responseResult = await apiCall(`/assessment/${assessmentId}/response`, 'POST', {
      questionId: firstQuestion.id,
      value: 5,
      module: module
    });
    
    if (!responseResult.success) {
      throw new Error('Failed to submit response');
    }
    
    console.log(`${colors.green}✓ Response submitted${colors.reset}`);
    console.log(`  Next Question: ${responseResult.data.nextQuestion?.text || 'Assessment complete'}`);
    console.log(`  Questions Saved by AI: ${responseResult.data.questionsSaved || 0}`);
    console.log(`  AI Reasoning: ${responseResult.data.aiReasoning || 'None'}`);
    
    // Get progress
    console.log(`\n${colors.cyan}Checking progress...${colors.reset}`);
    const progressResult = await apiCall(`/assessment/${assessmentId}/progress`);
    
    if (!progressResult.success) {
      throw new Error('Failed to get progress');
    }
    
    console.log(`${colors.green}✓ Progress retrieved${colors.reset}`);
    console.log(`  Questions Asked: ${progressResult.data.questionsAsked}`);
    console.log(`  Questions Saved: ${progressResult.data.questionsSaved}`);
    console.log(`  Overall Progress: ${progressResult.data.overallPercentage}%`);
    console.log(`  Efficiency Rate: ${progressResult.data.efficiencyRate}%`);
    
    return assessmentId;
  } catch (error) {
    console.error(`${colors.red}✗ Test failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 2: Pattern Detection
async function testPatternDetection(profile) {
  console.log(`\n${colors.bright}${colors.blue}=== Test 2: Pattern Detection - ${profile.name} ===${colors.reset}`);
  console.log(`${colors.yellow}${profile.description}${colors.reset}`);
  
  try {
    // Start assessment
    console.log(`${colors.cyan}Starting assessment for ${profile.name}...${colors.reset}`);
    const startResult = await apiCall('/assessment/start', 'POST');
    
    if (!startResult.success) {
      throw new Error('Failed to start assessment');
    }
    
    const assessmentId = startResult.data.assessmentId;
    let currentQuestion = startResult.data.firstQuestion;
    let currentModule = startResult.data.module;
    let questionsAnswered = 0;
    let modulesSeen = new Set([currentModule]);
    let patternsDetected = [];
    
    console.log(`${colors.green}✓ Assessment started: ${assessmentId}${colors.reset}`);
    
    // Answer questions based on profile
    const maxQuestions = 50; // Limit for testing
    
    for (let i = 0; i < maxQuestions && currentQuestion; i++) {
      questionsAnswered++;
      
      // Determine response based on profile
      let responseValue = profile.responses[currentQuestion.id] || 
                         Math.floor(Math.random() * 3); // Default low severity
      
      // Submit response
      const responseResult = await apiCall(`/assessment/${assessmentId}/response`, 'POST', {
        questionId: currentQuestion.id,
        value: responseValue,
        module: currentModule
      });
      
      if (!responseResult.success) {
        console.error(`Failed to submit response for question ${currentQuestion.id}`);
        break;
      }
      
      // Track module changes
      if (responseResult.data.module !== currentModule) {
        currentModule = responseResult.data.module;
        modulesSeen.add(currentModule);
        console.log(`${colors.magenta}  → Module changed to: ${currentModule}${colors.reset}`);
      }
      
      // Check for AI insights
      if (responseResult.data.aiReasoning) {
        console.log(`${colors.cyan}  AI: ${responseResult.data.aiReasoning}${colors.reset}`);
      }
      
      // Check for seed oil flag
      if (responseResult.data.seedOilFlag) {
        console.log(`${colors.yellow}  ⚠️ Seed oil damage detected!${colors.reset}`);
        patternsDetected.push('Seed Oil Damage');
      }
      
      currentQuestion = responseResult.data.nextQuestion;
      
      // Progress update every 10 questions
      if (questionsAnswered % 10 === 0) {
        const progress = await apiCall(`/assessment/${assessmentId}/progress`);
        console.log(`${colors.blue}  Progress: ${questionsAnswered} questions, ${progress.data.overallPercentage}% complete${colors.reset}`);
      }
    }
    
    // Final analysis
    console.log(`\n${colors.green}✓ Pattern detection complete${colors.reset}`);
    console.log(`  Questions Answered: ${questionsAnswered}`);
    console.log(`  Modules Activated: ${Array.from(modulesSeen).join(', ')}`);
    console.log(`  Patterns Detected: ${patternsDetected.length > 0 ? patternsDetected.join(', ') : 'None specific'}`);
    
    // Check if expected modules were activated
    const expectedModules = {
      metabolic: ['ENERGY', 'BIOTRANSFORMATION'],
      gut_issues: ['ASSIMILATION'],
      seed_oil_damage: ['BIOTRANSFORMATION', 'ENERGY']
    };
    
    if (expectedModules[Object.keys(TEST_PROFILES).find(k => TEST_PROFILES[k] === profile)]) {
      const expected = expectedModules[Object.keys(TEST_PROFILES).find(k => TEST_PROFILES[k] === profile)];
      const activated = expected.filter(m => modulesSeen.has(m));
      console.log(`  Expected Modules: ${expected.join(', ')}`);
      console.log(`  Actually Activated: ${activated.join(', ') || 'None'}`);
      
      if (activated.length === expected.length) {
        console.log(`${colors.green}  ✓ All expected modules activated!${colors.reset}`);
      } else {
        console.log(`${colors.yellow}  ⚠️ Not all expected modules activated${colors.reset}`);
      }
    }
    
    return assessmentId;
  } catch (error) {
    console.error(`${colors.red}✗ Test failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 3: Save & Resume
async function testSaveResume() {
  console.log(`\n${colors.bright}${colors.blue}=== Test 3: Save & Resume Functionality ===${colors.reset}`);
  
  try {
    // Start assessment
    console.log(`${colors.cyan}Starting assessment...${colors.reset}`);
    const startResult = await apiCall('/assessment/start', 'POST');
    const assessmentId = startResult.data.assessmentId;
    let currentQuestion = startResult.data.firstQuestion;
    let currentModule = startResult.data.module;
    
    // Answer 5 questions
    console.log(`${colors.cyan}Answering 5 questions...${colors.reset}`);
    for (let i = 0; i < 5; i++) {
      const response = await apiCall(`/assessment/${assessmentId}/response`, 'POST', {
        questionId: currentQuestion.id,
        value: Math.floor(Math.random() * 10),
        module: currentModule
      });
      
      currentQuestion = response.data.nextQuestion;
      currentModule = response.data.module;
      
      if (!currentQuestion) break;
    }
    
    // Pause assessment
    console.log(`${colors.cyan}Pausing assessment...${colors.reset}`);
    const pauseResult = await apiCall(`/assessment/${assessmentId}/pause`, 'POST');
    
    if (!pauseResult.success) {
      throw new Error('Failed to pause assessment');
    }
    
    console.log(`${colors.green}✓ Assessment paused${colors.reset}`);
    console.log(`  Questions Answered: ${pauseResult.data.questionsAnswered}`);
    console.log(`  Current Module: ${pauseResult.data.currentModule}`);
    console.log(`  Progress: ${pauseResult.data.progressPercentage}%`);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Resume assessment
    console.log(`\n${colors.cyan}Resuming assessment...${colors.reset}`);
    const resumeResult = await apiCall(`/assessment/${assessmentId}/resume`, 'POST');
    
    if (!resumeResult.success) {
      throw new Error('Failed to resume assessment');
    }
    
    console.log(`${colors.green}✓ Assessment resumed${colors.reset}`);
    console.log(`  Current Question: ${resumeResult.data.currentQuestion.text}`);
    console.log(`  Questions Asked: ${resumeResult.data.questionsAsked}`);
    console.log(`  Previous Responses Loaded: ${resumeResult.data.responses.length}`);
    
    return assessmentId;
  } catch (error) {
    console.error(`${colors.red}✗ Test failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Test 4: AI Efficiency Metrics
async function testAIEfficiency() {
  console.log(`\n${colors.bright}${colors.blue}=== Test 4: AI Efficiency Metrics ===${colors.reset}`);
  
  try {
    // Start assessment with high severity responses to trigger AI optimization
    console.log(`${colors.cyan}Starting assessment with high severity responses...${colors.reset}`);
    const startResult = await apiCall('/assessment/start', 'POST');
    const assessmentId = startResult.data.assessmentId;
    let currentQuestion = startResult.data.firstQuestion;
    let currentModule = startResult.data.module;
    let totalQuestionsSaved = 0;
    
    // Answer 20 questions with varying severity
    for (let i = 0; i < 20; i++) {
      // Every 3rd question gets high severity (8-9) to trigger AI optimization
      const severity = (i % 3 === 0) ? Math.floor(Math.random() * 2) + 8 : Math.floor(Math.random() * 4);
      
      const response = await apiCall(`/assessment/${assessmentId}/response`, 'POST', {
        questionId: currentQuestion.id,
        value: severity,
        module: currentModule
      });
      
      if (response.data.questionsSaved) {
        totalQuestionsSaved += response.data.questionsSaved;
        console.log(`${colors.green}  AI saved ${response.data.questionsSaved} questions!${colors.reset}`);
      }
      
      currentQuestion = response.data.nextQuestion;
      currentModule = response.data.module;
      
      if (!currentQuestion) break;
    }
    
    // Get final efficiency metrics
    const progress = await apiCall(`/assessment/${assessmentId}/progress`);
    
    console.log(`\n${colors.green}✓ AI Efficiency Analysis${colors.reset}`);
    console.log(`  Total Questions Saved: ${progress.data.questionsSaved}`);
    console.log(`  Efficiency Rate: ${progress.data.efficiencyRate}%`);
    console.log(`  Efficiency Message: ${progress.data.efficiencyMessage}`);
    console.log(`  Estimated Time Saved: ~${Math.round(progress.data.questionsSaved * 0.5)} minutes`);
    
    return assessmentId;
  } catch (error) {
    console.error(`${colors.red}✗ Test failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════╗
║     FNTP Assessment System - Comprehensive Test Suite     ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`${colors.yellow}Testing API at: ${API_BASE}${colors.reset}`);
  console.log(`${colors.yellow}Auth Token: ${TOKEN.substring(0, 50)}...${colors.reset}\n`);
  
  // Check server is running
  try {
    await fetch('http://localhost:3000');
  } catch (error) {
    console.error(`${colors.red}Error: Server is not running on http://localhost:3000${colors.reset}`);
    console.error(`${colors.yellow}Please run 'npm run dev' first${colors.reset}`);
    process.exit(1);
  }
  
  const results = {
    passed: [],
    failed: []
  };
  
  // Run tests
  try {
    // Test 1: Basic Flow
    const test1 = await testBasicFlow();
    if (test1) {
      results.passed.push('Basic Assessment Flow');
    } else {
      results.failed.push('Basic Assessment Flow');
    }
    
    // Test 2: Pattern Detection for different profiles
    for (const [key, profile] of Object.entries(TEST_PROFILES)) {
      const testResult = await testPatternDetection(profile);
      const testName = `Pattern Detection - ${profile.name}`;
      if (testResult) {
        results.passed.push(testName);
      } else {
        results.failed.push(testName);
      }
      
      // Wait between tests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Test 3: Save & Resume
    const test3 = await testSaveResume();
    if (test3) {
      results.passed.push('Save & Resume');
    } else {
      results.failed.push('Save & Resume');
    }
    
    // Test 4: AI Efficiency
    const test4 = await testAIEfficiency();
    if (test4) {
      results.passed.push('AI Efficiency Metrics');
    } else {
      results.failed.push('AI Efficiency Metrics');
    }
    
  } catch (error) {
    console.error(`${colors.red}Fatal error during testing: ${error.message}${colors.reset}`);
  }
  
  // Print summary
  console.log(`\n${colors.bright}${colors.magenta}
╔══════════════════════════════════════════════════════════╗
║                      TEST SUMMARY                         ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`${colors.green}✓ Passed: ${results.passed.length}${colors.reset}`);
  results.passed.forEach(test => {
    console.log(`  • ${test}`);
  });
  
  if (results.failed.length > 0) {
    console.log(`\n${colors.red}✗ Failed: ${results.failed.length}${colors.reset}`);
    results.failed.forEach(test => {
      console.log(`  • ${test}`);
    });
  }
  
  const totalTests = results.passed.length + results.failed.length;
  const successRate = totalTests > 0 ? Math.round((results.passed.length / totalTests) * 100) : 0;
  
  console.log(`\n${colors.bright}Success Rate: ${successRate}%${colors.reset}`);
  
  if (successRate === 100) {
    console.log(`${colors.green}🎉 All tests passed! The assessment system is working correctly.${colors.reset}`);
  } else if (successRate >= 75) {
    console.log(`${colors.yellow}⚠️ Most tests passed, but some issues need attention.${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Several tests failed. Please review the errors above.${colors.reset}`);
  }
}

// Run tests if this is the main module
if (require.main === module) {
  runAllTests().catch(error => {
    console.error(`${colors.red}Unexpected error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = { runAllTests, testBasicFlow, testPatternDetection, testSaveResume, testAIEfficiency };
