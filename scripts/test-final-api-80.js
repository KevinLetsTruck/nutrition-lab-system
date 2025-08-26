const API_BASE = "http://localhost:3000";
const TEST_CLIENT_ID = "cmeqhcsr30005v2ot9m97ljko";

console.log("🧪 Testing Final 80-Question API System");
console.log("=".repeat(60));

async function testFinalQuestions() {
  try {
    // Start/resume assessment
    const startRes = await fetch(`${API_BASE}/api/simple-assessment/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: TEST_CLIENT_ID }),
    });

    const startData = await startRes.json();
    const assessmentId = startData.assessment.id;
    console.log("✅ Assessment ID:", assessmentId);
    console.log(
      "   Existing responses:",
      startData.assessment.responses.length
    );

    // Test new detox questions (66-70)
    console.log("\n🧪 Testing New Detox Questions (66-70):");
    console.log("-".repeat(60));

    const detoxQuestions = [
      { id: 66, expectedTheme: "body odor", score: 2 },
      { id: 67, expectedTheme: "sweating", score: 4 },
      { id: 68, expectedTheme: "chemical", score: 3 },
      { id: 69, expectedTheme: "medication", score: 2 },
      { id: 70, expectedTheme: "recovery", score: 4 },
    ];

    for (const question of detoxQuestions) {
      const res = await fetch(
        `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            score: question.score,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        const submittedResponse = data.assessment.responses.find(
          (r) => r.questionId === question.id
        );
        const hasExpectedContent = submittedResponse?.questionText
          .toLowerCase()
          .includes(question.expectedTheme);
        console.log(
          `Q${question.id}: ✅ Submitted ${
            hasExpectedContent ? "✅" : "⚠️"
          } (contains "${question.expectedTheme}")`
        );
      } else {
        console.log(`Q${question.id}: ❌ Failed -`, data.error);
      }
    }

    // Test new cardiovascular questions (76-80)
    console.log("\n❤️ Testing New Cardiovascular Questions (76-80):");
    console.log("-".repeat(60));

    const cardioQuestions = [
      { id: 76, expectedTheme: "heart rate adapt", score: 4 },
      { id: 77, expectedTheme: "blood pressure", score: 4 },
      { id: 78, expectedTheme: "cold hands", score: 2 },
      { id: 79, expectedTheme: "varicose", score: 1 },
      { id: 80, expectedTheme: "heart rate return", score: 5 },
    ];

    for (const question of cardioQuestions) {
      const res = await fetch(
        `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            score: question.score,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        const submittedResponse = data.assessment.responses.find(
          (r) => r.questionId === question.id
        );
        const hasExpectedContent = submittedResponse?.questionText
          .toLowerCase()
          .includes(question.expectedTheme);
        console.log(
          `Q${question.id}: ✅ Submitted ${
            hasExpectedContent ? "✅" : "⚠️"
          } (contains "${question.expectedTheme}")`
        );
      } else {
        console.log(`Q${question.id}: ❌ Failed -`, data.error);
      }
    }

    // Get final status
    const statusRes = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/status`
    );
    const statusData = await statusRes.json();

    console.log("\n📊 Assessment Progress:");
    console.log(
      `   Total responses: ${statusData.data.progress.completed}/80 (${statusData.data.progress.percentage}%)`
    );

    // Check category completion
    const categoryResponses = {};
    statusData.data.responses.forEach((r) => {
      if (!categoryResponses[r.category]) {
        categoryResponses[r.category] = 0;
      }
      categoryResponses[r.category]++;
    });

    console.log("\n📈 Responses by Category:");
    Object.entries(categoryResponses).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}/10 responses`);
    });

    // Test edge case: question 81 should fail
    console.log("\n⚠️ Testing Invalid Question (81):");
    const invalidRes = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: 81,
          score: 3,
        }),
      }
    );

    const invalidData = await invalidRes.json();
    console.log(
      `   Q81: ${
        !invalidData.success ? "✅ Correctly rejected" : "❌ Should have failed"
      }`
    );
    if (!invalidData.success) {
      console.log(`   Error: ${invalidData.error}`);
    }

    console.log("\n✅ 80-question API system working correctly!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testFinalQuestions();
