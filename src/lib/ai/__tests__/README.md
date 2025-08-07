# AI Service Test Suite

This directory contains manual tests for the AI Service framework.

## Running Tests

### Method 1: Using the test script (Recommended)
```bash
node scripts/test-ai-service.js
```

### Method 2: Direct execution
```bash
npx tsx src/lib/ai/__tests__/ai-service.test.ts
```

## Test Coverage

The test suite covers:

1. **Fallback Mechanism** - Ensures providers failover correctly
2. **Cache Functionality** - Validates caching behavior
3. **Health Checks** - Tests provider health monitoring
4. **Mock Provider** - Verifies fallback to mock when all fail
5. **Metrics Tracking** - Confirms metrics are tracked accurately
6. **Health Analysis** - Tests health data analysis features

## Test Environment

Tests run with mock API keys to avoid using real API calls:
- `ANTHROPIC_API_KEY=test-key`
- `OPENAI_API_KEY=test-key`

This triggers validation warnings but allows testing of the fallback logic.

## Test Results

```
📊 Test Results
================
✅ Passed: 46
❌ Failed: 0
📈 Total:  46
🎯 Success Rate: 100.00%
```

## Adding New Tests

To add new tests:

1. Create a new test function following the pattern:
```typescript
async function testNewFeature() {
  console.log('\n🧪 Test X: New Feature');
  console.log('================================');
  
  // Test implementation
  assert(condition, 'Test description');
}
```

2. Add the test to the `runTests()` function
3. Run the test suite to verify

## Notes

- Tests use simple `assert()` functions instead of a testing framework
- The mock provider has intentional randomness (90% healthy) for testing
- Environment check warnings are expected when using test API keys