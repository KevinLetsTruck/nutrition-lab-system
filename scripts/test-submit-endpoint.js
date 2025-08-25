const API_BASE = "http://localhost:3000";

async function testSubmitEndpoint() {
  console.log("🧪 Testing Submit Endpoint Edge Cases");
  console.log("=".repeat(50));

  try {
    // First, create a new assessment
    console.log("\n1️⃣ Creating new assessment...");
    const startRes = await fetch(`${API_BASE}/api/simple-assessment/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: "cmeqhcsr30005v2ot9m97ljko" }),
    });

    const startData = await startRes.json();
    if (!startData.success) {
      console.log("❌ Failed to start assessment");
      return;
    }

    const assessmentId = startData.assessment.id;
    console.log("✅ Assessment created:", assessmentId);

    // Test 1: Valid submission
    console.log("\n2️⃣ Testing valid submission...");
    let res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 1, score: 3 }),
      }
    );
    let data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    if (data.success) {
      console.log("   Responses:", data.assessment.responses.length);
    }

    // Test 2: Duplicate submission (should update)
    console.log("\n3️⃣ Testing duplicate submission...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 1, score: 5 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    if (data.success) {
      const q1Response = data.assessment.responses.find(
        (r) => r.questionId === 1
      );
      console.log("   Updated score:", q1Response?.score);
    }

    // Test 3: Invalid questionId (0)
    console.log("\n4️⃣ Testing invalid questionId (0)...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 0, score: 3 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 4: Invalid questionId (21)
    console.log("\n5️⃣ Testing invalid questionId (21)...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 21, score: 3 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 5: Invalid score (0)
    console.log("\n6️⃣ Testing invalid score (0)...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 2, score: 0 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 6: Invalid score (6)
    console.log("\n7️⃣ Testing invalid score (6)...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 2, score: 6 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 7: Missing questionId
    console.log("\n8️⃣ Testing missing questionId...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: 3 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 8: Missing score
    console.log("\n9️⃣ Testing missing score...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 2 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 9: Non-numeric values
    console.log("\n🔟 Testing non-numeric values...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: "two", score: "three" }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 10: Submit all 20 questions to test completion
    console.log("\n1️⃣1️⃣ Testing assessment completion...");
    for (let i = 2; i <= 20; i++) {
      await fetch(`${API_BASE}/api/simple-assessment/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: i,
          score: Math.floor(Math.random() * 5) + 1,
        }),
      });
    }

    // Check final status
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 20, score: 4 }),
      }
    );
    data = await res.json();
    console.log("   Final status:", data.assessment?.status);
    console.log("   Total responses:", data.assessment?.responses.length);

    // Test 11: Try to submit to completed assessment
    console.log("\n1️⃣2️⃣ Testing submission to completed assessment...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 1, score: 2 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    // Test 12: Invalid assessment ID
    console.log("\n1️⃣3️⃣ Testing invalid assessment ID...");
    res = await fetch(
      `${API_BASE}/api/simple-assessment/invalid-id-123/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: 1, score: 3 }),
      }
    );
    data = await res.json();
    console.log("   Status:", res.status, data.success ? "✅" : "❌");
    console.log("   Error:", data.error);

    console.log("\n✅ All edge case tests completed!");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testSubmitEndpoint();
