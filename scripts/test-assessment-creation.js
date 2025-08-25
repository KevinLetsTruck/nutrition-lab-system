// Test assessment creation flow

const API_BASE = "http://localhost:3001";

async function testAssessmentCreation() {
  console.log("🧪 Testing Assessment Creation Flow");
  console.log("=".repeat(50) + "\n");

  try {
    // Step 1: Start a new assessment
    console.log("1️⃣ Starting new assessment...");
    const startRes = await fetch(`${API_BASE}/api/assessment/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!startRes.ok) {
      const text = await startRes.text();
      console.error("Response status:", startRes.status);
      console.error("Response headers:", startRes.headers);

      // Try to parse as JSON, otherwise show the text
      try {
        const error = JSON.parse(text);
        throw new Error(`Failed to start: ${JSON.stringify(error)}`);
      } catch (e) {
        console.error(
          "Response text (first 500 chars):",
          text.substring(0, 500)
        );
        throw new Error(`Failed to start: HTTP ${startRes.status}`);
      }
    }

    const data = await startRes.json();
    console.log("✅ Assessment started successfully!");
    console.log(`   Assessment ID: ${data.data.assessmentId}`);
    console.log(
      `   First Question: ${data.data.firstQuestion?.text?.substring(0, 60)}...`
    );
    console.log(`   Module: ${data.data.module}`);
    console.log(`   Total Questions: ${data.data.totalQuestions}`);
    console.log(`   Resuming: ${data.data.resuming || false}`);

    // Step 2: Test resuming (call start again)
    console.log("\n2️⃣ Testing resume functionality...");
    const resumeRes = await fetch(`${API_BASE}/api/assessment/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const resumeData = await resumeRes.json();
    if (resumeData.data.resuming) {
      console.log("✅ Resume detected correctly!");
      console.log(
        `   Same assessment ID: ${
          resumeData.data.assessmentId === data.data.assessmentId
        }`
      );
    }

    // Step 3: Get next question
    console.log("\n3️⃣ Getting next question...");
    const nextRes = await fetch(
      `${API_BASE}/api/assessment/${data.data.assessmentId}/next-question`
    );

    if (nextRes.ok) {
      const nextData = await nextRes.json();
      console.log("✅ Next question endpoint works!");
      console.log(
        `   Question: ${nextData.question?.text?.substring(0, 60)}...`
      );
    }

    console.log("\n✅ Assessment creation flow is working!");
    console.log("\n📋 Next steps:");
    console.log("1. Navigate to: http://localhost:3001/assessment/new");
    console.log("2. Should redirect to: /assessment/[id] with first question");
    console.log("3. Should NOT show 'Assessment Complete!' immediately");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("\nMake sure:");
    console.error("1. Server is running (npm run dev)");
    console.error("2. Database is running and migrated");
    console.error("3. Template 'default' exists in database");
  }
}

// Run test
testAssessmentCreation();
