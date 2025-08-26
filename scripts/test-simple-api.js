const API_BASE = "http://localhost:3000";

async function testSimpleAPI() {
  console.log("🧪 Testing Simple Assessment API Endpoints");
  console.log("=".repeat(50));

  try {
    // First, let's get a test client ID
    console.log("\n1️⃣ Finding test client...");

    // If you know a client ID, replace this with the actual ID
    const testClientId = "cmeqhcsr30005v2ot9m97ljko"; // Test client ID

    console.log("   Using test client ID:", testClientId);
    console.log("   ⚠️  Replace with an actual client ID from your database!");

    // Test 1: Start Assessment
    console.log("\n2️⃣ Testing start endpoint...");
    const startRes = await fetch(`${API_BASE}/api/simple-assessment/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: testClientId }),
    });

    const startData = await startRes.json();
    console.log("   Response:", JSON.stringify(startData, null, 2));
    console.log(
      "   HTTP Status:",
      startRes.status,
      startRes.status === 201 ? "(New)" : "(Existing)"
    );

    if (!startData.success) {
      console.log("   ❌ Failed to start assessment:", startData.error);
      console.log(
        "   💡 Make sure to use a valid client ID from your database"
      );
      return;
    }

    const assessmentId = startData.assessment.id;
    console.log("   ✅ Assessment started/resumed:", assessmentId);
    console.log("   📊 Status:", startData.assessment.status);
    console.log(
      "   📈 Existing responses:",
      startData.assessment.responses.length
    );

    // Test 2: Submit a Response
    console.log("\n3️⃣ Testing submit endpoint...");
    const submitRes = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: 1,
          score: 3,
        }),
      }
    );

    const submitData = await submitRes.json();
    console.log("   Response:", JSON.stringify(submitData, null, 2));

    if (!submitData.success) {
      console.log("   ❌ Failed to submit response:", submitData.error);
      return;
    }

    console.log("   ✅ Response submitted");
    console.log("   📊 Assessment status:", submitData.assessment.status);
    console.log(
      "   📈 Total responses:",
      submitData.assessment.responses.length
    );

    // Test 3: Get Status
    console.log("\n4️⃣ Testing status endpoint...");
    const statusRes = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/status`
    );
    const statusData = await statusRes.json();

    console.log("   Response:", JSON.stringify(statusData, null, 2));
    console.log("   ✅ Status retrieved");

    console.log("\n✅ All API endpoints are working!");
    console.log("\n📋 Next steps:");
    console.log("   1. Replace test-client-id with an actual client ID");
    console.log("   2. Build a frontend to interact with these endpoints");
    console.log("   3. Add authentication if needed");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testSimpleAPI();
