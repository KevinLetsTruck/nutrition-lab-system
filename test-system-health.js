#!/usr/bin/env node

/**
 * Quick Assessment API Test
 * Tests the actual endpoints that exist
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

console.log(`${colors.yellow}=== Assessment API Quick Test ===${colors.reset}\n`);

// First, let's just check if the server is responding
async function checkServer() {
  console.log(`${colors.blue}1. Checking if server is running...${colors.reset}`);
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log(`${colors.green}✓ Server is running${colors.reset}`);
      return true;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Server not responding${colors.reset}`);
    console.log(`  Make sure server is running: npm run dev`);
    return false;
  }
}

// Check if we can load questions
async function checkQuestions() {
  console.log(`\n${colors.blue}2. Checking question bank...${colors.reset}`);
  try {
    // Import the question modules
    const { getQuestionsByModule, getAllQuestions } = require('./lib/assessment/questions');
    const questions = getAllQuestions();
    
    console.log(`${colors.green}✓ Question bank loaded${colors.reset}`);
    console.log(`  Total questions: ${questions.length}`);
    
    // Count by module
    const modules = {};
    questions.forEach(q => {
      modules[q.module] = (modules[q.module] || 0) + 1;
    });
    
    console.log(`\n  Questions by module:`);
    Object.entries(modules).forEach(([module, count]) => {
      console.log(`    ${module}: ${count}`);
    });
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Could not load questions${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

// Check database connection
async function checkDatabase() {
  console.log(`\n${colors.blue}3. Checking database connection...${colors.reset}`);
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Try to query assessments
    const count = await prisma.clientAssessment.count();
    console.log(`${colors.green}✓ Database connected${colors.reset}`);
    console.log(`  Existing assessments: ${count}`);
    
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Database connection failed${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    console.log(`  Run: npx prisma migrate dev`);
    return false;
  }
}

// Check AI orchestrator
async function checkOrchestrator() {
  console.log(`\n${colors.blue}4. Checking AI Orchestrator...${colors.reset}`);
  try {
    const { AssessmentOrchestrator } = require('./lib/ai/assessment-orchestrator');
    
    // Create a mock instance
    const orchestrator = new AssessmentOrchestrator({
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || 'test-key'
    });
    
    console.log(`${colors.green}✓ AI Orchestrator loaded${colors.reset}`);
    console.log(`  Patterns configured: ${orchestrator.patterns.length}`);
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(`${colors.yellow}  ⚠ Warning: ANTHROPIC_API_KEY not set${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ AI Orchestrator failed to load${colors.reset}`);
    console.log(`  Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  const results = [];
  
  results.push(await checkServer());
  results.push(await checkQuestions());
  results.push(await checkDatabase());
  results.push(await checkOrchestrator());
  
  // Summary
  console.log(`\n${colors.yellow}=== Summary ===${colors.reset}`);
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  if (passed === total) {
    console.log(`${colors.green}✅ All ${total} checks passed!${colors.reset}`);
    console.log(`\nYour assessment system appears to be ready.`);
    console.log(`Next step: Try creating an assessment through the UI at http://localhost:3000`);
  } else {
    console.log(`${colors.red}❌ ${total - passed} of ${total} checks failed${colors.reset}`);
    console.log(`\nPlease fix the issues above before proceeding.`);
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
