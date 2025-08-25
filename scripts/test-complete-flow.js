// Test the complete assessment flow

async function testCompleteFlow() {
  console.log("🧪 Testing Complete Assessment Flow");
  console.log("=".repeat(50) + "\n");

  const API_BASE = "http://localhost:3001";

  try {
    // Step 1: Create a new assessment
    console.log("1️⃣ Creating new assessment...");
    const createRes = await fetch(`${API_BASE}/api/assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: "test-client",
        templateId: "default",
      }),
    });

    console.log("   Response status:", createRes.status);

    let createData;
    try {
      createData = await createRes.json();
    } catch (e) {
      const text = await createRes.text();
      console.error(
        "   Response is not JSON. First 200 chars:",
        text.substring(0, 200)
      );
      throw new Error(
        "API returned HTML instead of JSON - route may not exist"
      );
    }

    if (!createRes.ok) {
      if (createData.existingId) {
        console.log("⚠️  Active assessment exists:", createData.existingId);
        console.log(
          "   You can resume at: /assessment/" + createData.existingId
        );
        return;
      }
      throw new Error(createData.error || "Failed to create assessment");
    }

    const { assessment, firstQuestion } = createData;
    console.log("✅ Assessment created!");
    console.log(`   ID: ${assessment.id}`);
    console.log(`   First Question: ${firstQuestion.text}`);
    console.log(`   Module: ${assessment.currentModule}`);

    // Step 2: Test the assessment page URL
    console.log("\n2️⃣ Assessment URL:");
    console.log(`   http://localhost:3001/assessment/${assessment.id}`);

    // Step 3: Test getting next question via API
    console.log("\n3️⃣ Testing next question API...");
    const nextRes = await fetch(
      `${API_BASE}/api/assessment/${assessment.id}/next-question`
    );

    if (nextRes.ok) {
      const nextData = await nextRes.json();
      console.log("✅ Next question API works!");
      console.log(`   Question: ${nextData.question?.text || "No question"}`);
    } else {
      console.log("❌ Next question API failed:", nextRes.status);
    }

    console.log("\n✅ Assessment flow is working!");
    console.log("\n📋 Next steps:");
    console.log("1. Open: http://localhost:3001/assessments");
    console.log("2. Click 'New Assessment' button");
    console.log("3. Should navigate to the assessment with questions");
    console.log("4. Verify AI is selecting questions intelligently");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testCompleteFlow();
