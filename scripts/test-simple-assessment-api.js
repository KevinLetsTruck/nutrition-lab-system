const API_BASE = "http://localhost:3000";

// Test client ID - replace with a valid client ID from your database
const TEST_CLIENT_ID = "cmeqhcsr30005v2ot9m97ljko";

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Helper function to make fetch requests with error handling
async function makeRequest(method, url, body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    return {
      success: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message,
    };
  }
}

// Main test function
async function testSimpleAssessmentAPI() {
  console.log(
    `${colors.cyan}🧪 Simple Assessment API Test Suite${colors.reset}`
  );
  console.log("=".repeat(60));
  console.log(`Using test client ID: ${TEST_CLIENT_ID}\n`);

  let assessmentId = null;
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // Test 1: Start Assessment
  console.log(
    `${colors.blue}Test 1: POST /api/simple-assessment/start${colors.reset}`
  );
  console.log("Testing assessment creation/resumption...");

  results.total++;
  const startResult = await makeRequest(
    "POST",
    `${API_BASE}/api/simple-assessment/start`,
    { clientId: TEST_CLIENT_ID }
  );

  if (startResult.success && startResult.data.success) {
    assessmentId = startResult.data.assessment.id;
    console.log(
      `${colors.green}✅ PASSED${colors.reset} - Status: ${startResult.status}`
    );
    console.log("Assessment ID:", assessmentId);
    console.log("Response:", JSON.stringify(startResult.data, null, 2));
    results.passed++;
  } else {
    console.log(
      `${colors.red}❌ FAILED${colors.reset} - Status: ${startResult.status}`
    );
    console.log("Error:", startResult.data?.error || startResult.error);
    console.log("Response:", JSON.stringify(startResult.data, null, 2));
    results.failed++;
  }
  console.log("-".repeat(60));

  // Only continue if we have an assessment ID
  if (!assessmentId) {
    console.log(
      `${colors.red}Cannot continue tests without assessment ID${colors.reset}`
    );
    printSummary(results);
    return;
  }

  // Test 2: Submit Response
  console.log(
    `\n${colors.blue}Test 2: POST /api/simple-assessment/[id]/submit${colors.reset}`
  );
  console.log("Testing response submission...");

  results.total++;
  const submitResult = await makeRequest(
    "POST",
    `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
    { questionId: 1, score: 4 }
  );

  if (submitResult.success && submitResult.data.success) {
    console.log(
      `${colors.green}✅ PASSED${colors.reset} - Status: ${submitResult.status}`
    );
    console.log("Response saved successfully");
    console.log("Response:", JSON.stringify(submitResult.data, null, 2));
    results.passed++;
  } else {
    console.log(
      `${colors.red}❌ FAILED${colors.reset} - Status: ${submitResult.status}`
    );
    console.log("Error:", submitResult.data?.error || submitResult.error);
    console.log("Response:", JSON.stringify(submitResult.data, null, 2));
    results.failed++;
  }
  console.log("-".repeat(60));

  // Test 3: Get Status
  console.log(
    `\n${colors.blue}Test 3: GET /api/simple-assessment/[id]/status${colors.reset}`
  );
  console.log("Testing assessment status retrieval...");

  results.total++;
  const statusResult = await makeRequest(
    "GET",
    `${API_BASE}/api/simple-assessment/${assessmentId}/status`
  );

  if (statusResult.success && statusResult.data.success) {
    console.log(
      `${colors.green}✅ PASSED${colors.reset} - Status: ${statusResult.status}`
    );
    console.log("Assessment status retrieved successfully");
    console.log("Response:", JSON.stringify(statusResult.data, null, 2));
    results.passed++;
  } else {
    console.log(
      `${colors.red}❌ FAILED${colors.reset} - Status: ${statusResult.status}`
    );
    console.log("Error:", statusResult.data?.error || statusResult.error);
    console.log("Response:", JSON.stringify(statusResult.data, null, 2));
    results.failed++;
  }
  console.log("-".repeat(60));

  // Print summary
  printSummary(results);
}

// Helper function to print test summary
function printSummary(results) {
  console.log(`\n${colors.cyan}📊 Test Summary${colors.reset}`);
  console.log("=".repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);

  if (results.failed === 0) {
    console.log(`\n${colors.green}✅ All tests passed!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed!${colors.reset}`);
  }

  console.log("\n📝 Note: Make sure the server is running on port 3000");
  console.log(
    "   and replace TEST_CLIENT_ID with a valid client ID from your database."
  );
}

// Run the tests
testSimpleAssessmentAPI().catch((error) => {
  console.error(`${colors.red}Test suite failed:${colors.reset}`, error);
});
