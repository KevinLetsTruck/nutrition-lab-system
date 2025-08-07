#!/usr/bin/env node

/**
 * AI Service Test Runner
 * 
 * Simple script to run AI Service tests
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running AI Service Tests...\n');

// Use tsx to run TypeScript files directly
const testFile = path.join(__dirname, '../src/lib/ai/__tests__/ai-service.test.ts');

// Check if tsx is available
const runner = spawn('npx', ['tsx', testFile], {
  stdio: 'inherit',
  env: {
    ...process.env,
    // Set test environment
    NODE_ENV: 'test',
    // Use mock providers for testing
    ANTHROPIC_API_KEY: 'test-key',
    OPENAI_API_KEY: 'test-key'
  }
});

runner.on('error', (error) => {
  console.error('❌ Failed to run tests:', error.message);
  console.log('\n💡 Try installing tsx: npm install -D tsx');
  process.exit(1);
});

runner.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✨ All tests completed successfully!');
  } else {
    console.log('\n❌ Tests failed with exit code:', code);
  }
  process.exit(code || 0);
});