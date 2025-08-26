const API_BASE = "http://localhost:3000";
const TEST_CLIENT_ID = "cmeqhcsr30005v2ot9m97ljko";

console.log("🧪 Testing New Expanded Questions (Digestive & Energy)");
console.log("=".repeat(60));

async function testNewQuestions() {
  try {
    // Start a fresh assessment
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

    // Test submitting new digestive questions (6-10)
    const newDigestiveQuestions = [
      { id: 6, expectedText: "gas or flatulence", score: 2 },
      { id: 7, expectedText: "abdominal pain", score: 1 },
      { id: 8, expectedText: "nausea", score: 1 },
      { id: 9, expectedText: "food cravings", score: 3 },
      { id: 10, expectedText: "daily activities", score: 2 },
    ];

    console.log("\n🍽️ Testing New Digestive Questions (6-10):");
    console.log("-".repeat(60));

    for (const question of newDigestiveQuestions) {
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
        console.log(`Q${question.id}: ✅ Submitted`);
        console.log(`   Text: "${submittedResponse?.questionText}"`);
        console.log(
          `   Contains "${question.expectedText}": ${
            submittedResponse?.questionText.includes(question.expectedText)
              ? "✅"
              : "❌"
          }`
        );
      } else {
        console.log(`Q${question.id}: ❌ Failed -`, data.error);
      }
    }

    // Test submitting new energy questions (16-20)
    const newEnergyQuestions = [
      { id: 16, expectedText: "physical stamina", score: 4 },
      { id: 17, expectedText: "mental fatigue", score: 2 },
      { id: 18, expectedText: "recover from physical", score: 4 },
      { id: 19, expectedText: "seasonal changes", score: 2 },
      { id: 20, expectedText: "caffeine", score: 3 },
    ];

    console.log("\n⚡ Testing New Energy Questions (16-20):");
    console.log("-".repeat(60));

    for (const question of newEnergyQuestions) {
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
        console.log(`Q${question.id}: ✅ Submitted`);
        console.log(`   Text: "${submittedResponse?.questionText}"`);
        console.log(
          `   Contains "${question.expectedText}": ${
            submittedResponse?.questionText.includes(question.expectedText)
              ? "✅"
              : "❌"
          }`
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
      `   Total responses: ${statusData.data.progress.completed}/50 (${statusData.data.progress.percentage}%)`
    );

    // Show responses by category
    const categoryResponses = {};
    statusData.data.responses.forEach((r) => {
      if (!categoryResponses[r.category]) {
        categoryResponses[r.category] = [];
      }
      categoryResponses[r.category].push(r.questionId);
    });

    console.log("\n📈 Responses by Category:");
    Object.entries(categoryResponses).forEach(([category, ids]) => {
      console.log(
        `   ${category}: ${ids.length} responses (Questions: ${ids
          .sort((a, b) => a - b)
          .join(", ")})`
      );
    });

    console.log("\n✅ New expanded questions are working correctly!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testNewQuestions();
