#!/usr/bin/env node

// Test script to verify all question types save correctly
// Run with: node scripts/test-response-saving.js

const API_BASE = "http://localhost:3000/api/assessment";

// Test data for each question type
const testResponses = {
  LIKERT_SCALE: { value: 7 },
  YES_NO: { value: true },
  MULTIPLE_CHOICE: { value: "option_a" },
  MULTI_SELECT: { value: ["option_1", "option_2", "option_3"] },
  FREQUENCY: { value: "sometimes" },
  DURATION: { value: { value: 30, unit: "minutes" } },
  TEXT: { value: "This is a test text response" },
  NUMBER: { value: 42 },
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testResponseSaving() {
  console.log("🧪 Starting Response Saving Test...\n");

  try {
    // Step 1: Start a test assessment
    console.log("1️⃣ Starting test assessment...");
    const startRes = await fetch(`${API_BASE}/test-start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includeTest: false }),
    });

    if (!startRes.ok) {
      const error = await startRes.json();
      console.error("❌ Failed to start assessment:", error);
      return;
    }

    const startData = await startRes.json();
    const assessmentId = startData.data.assessmentId;
    console.log("✅ Assessment started:", assessmentId);
    console.log("   First question:", startData.data.firstQuestion?.id);

    // Step 2: Test each question type
    const questionTypes = Object.keys(testResponses);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < questionTypes.length; i++) {
      const type = questionTypes[i];
      console.log(`\n${i + 2}️⃣ Testing ${type}...`);

      // Get current question
      const nextRes = await fetch(
        `${API_BASE}/test/${assessmentId}/next-question`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!nextRes.ok) {
        console.error(`❌ Failed to get question for ${type}`);
        failCount++;
        continue;
      }

      const nextData = await nextRes.json();

      if (nextData.data?.complete) {
        console.log("📋 Assessment complete - no more questions");
        break;
      }

      const question = nextData.data?.question;
      if (!question) {
        console.error(`❌ No question returned for ${type}`);
        failCount++;
        continue;
      }

      console.log(
        `   Question: ${question.id} - ${question.text?.substring(0, 50)}...`
      );
      console.log(`   Type: ${question.type}`);

      // Submit response
      const response = {
        type: question.type,
        value:
          testResponses[type]?.value ||
          testResponses[question.type]?.value ||
          "test_value",
      };

      console.log(`   Submitting response:`, JSON.stringify(response));

      const submitRes = await fetch(
        `${API_BASE}/test/${assessmentId}/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            response: response,
          }),
        }
      );

      if (!submitRes.ok) {
        const error = await submitRes.json();
        console.error(`❌ Failed to save ${type}:`, error.error);
        if (error.details) {
          console.error("   Details:", error.details);
        }
        failCount++;
      } else {
        const submitData = await submitRes.json();
        console.log(`✅ ${type} saved successfully!`);
        console.log(`   Response ID: ${submitData.data?.responseId}`);
        console.log(
          `   Questions answered: ${submitData.data?.questionsAnswered}`
        );
        successCount++;
      }

      // Small delay between requests
      await sleep(100);
    }

    // Step 3: Summary
    console.log("\n📊 Test Summary:");
    console.log(`   ✅ Successful saves: ${successCount}`);
    console.log(`   ❌ Failed saves: ${failCount}`);
    console.log(`   📋 Total tests: ${successCount + failCount}`);

    // Step 4: Test response retrieval
    console.log("\n🔍 Testing response retrieval...");
    const retrieveRes = await fetch(
      `${API_BASE}/test/${assessmentId}/responses`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (retrieveRes.ok) {
      const retrieveData = await retrieveRes.json();
      const responses = retrieveData.data?.responses || [];
      console.log(`✅ Retrieved ${responses.length} responses`);

      if (retrieveData.data?.responsesByModule) {
        console.log("\n📁 Responses by module:");
        Object.entries(retrieveData.data.responsesByModule).forEach(
          ([module, data]) => {
            console.log(`   ${module}: ${data.count} responses`);
          }
        );
      }

      if (retrieveData.data?.progress) {
        const progress = retrieveData.data.progress;
        console.log("\n📈 Assessment Progress:");
        console.log(
          `   Questions Answered: ${progress.questionsAnswered}/${progress.totalQuestions}`
        );
        console.log(`   Percent Complete: ${progress.percentComplete}%`);
        console.log(`   Current Module: ${progress.currentModule}`);
      }
    } else {
      const error = await retrieveRes.json();
      console.log("❌ Failed to retrieve responses:", error.error);
    }
  } catch (error) {
    console.error("\n❌ Test failed with error:", error.message);
    console.error(error.stack);
  }
}

// Run the test
console.log("🚀 Response Saving Test Script");
console.log("================================\n");
console.log(
  "⚠️  Make sure the dev server is running on http://localhost:3000\n"
);

testResponseSaving()
  .then(() => {
    console.log("\n✨ Test complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n💥 Test crashed:", err);
    process.exit(1);
  });
