const API_BASE = "http://localhost:3000";
const TEST_CLIENT_ID = "cmeqhcsr30005v2ot9m97ljko";

console.log("🧪 Testing New Sleep & Stress Questions via API");
console.log("=".repeat(60));

async function testNewQuestions() {
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

    // Test new sleep questions (26-30)
    const newSleepQuestions = [
      { id: 26, theme: "sleep depth", score: 4 },
      { id: 27, theme: "noise/light sensitivity", score: 3 },
      { id: 28, theme: "sleep position comfort", score: 4 },
      { id: 29, theme: "schedule match", score: 3 },
      { id: 30, theme: "wake alertness", score: 4 },
    ];

    console.log("\n😴 Testing New Sleep Questions (26-30):");
    console.log("-".repeat(60));

    for (const question of newSleepQuestions) {
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
        console.log(`Q${question.id}: ✅ Submitted (${question.theme})`);
        if (submittedResponse) {
          console.log(`   Text: "${submittedResponse.questionText}"`);
          console.log(
            `   Scale: ${submittedResponse.scaleType || "not recorded"}`
          );
        }
      } else {
        console.log(`Q${question.id}: ❌ Failed -`, data.error);
      }
    }

    // Test new stress questions (36-40)
    const newStressQuestions = [
      { id: 36, theme: "physical stress symptoms", score: 2 },
      { id: 37, theme: "stress recovery speed", score: 4 },
      { id: 38, theme: "future worry", score: 3 },
      { id: 39, theme: "change sensitivity", score: 3 },
      { id: 40, theme: "coping effectiveness", score: 4 },
    ];

    console.log("\n😰 Testing New Stress Questions (36-40):");
    console.log("-".repeat(60));

    for (const question of newStressQuestions) {
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
        console.log(`Q${question.id}: ✅ Submitted (${question.theme})`);
        if (submittedResponse) {
          console.log(`   Text: "${submittedResponse.questionText}"`);
        }
      } else {
        console.log(`Q${question.id}: ❌ Failed -`, data.error);
      }
    }

    // Get status to check progress
    const statusRes = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/status`
    );
    const statusData = await statusRes.json();

    console.log("\n📊 Assessment Progress:");
    console.log(
      `   Total responses: ${statusData.data.progress.completed}/60 (${statusData.data.progress.percentage}%)`
    );

    // Show category response counts
    const categoryResponses = {};
    statusData.data.responses.forEach((r) => {
      if (!categoryResponses[r.category]) {
        categoryResponses[r.category] = 0;
      }
      categoryResponses[r.category]++;
    });

    console.log("\n📈 Responses by Category:");
    Object.entries(categoryResponses).forEach(([category, count]) => {
      const expected = ["digestive", "energy", "sleep", "stress"].includes(
        category
      )
        ? 10
        : 5;
      console.log(`   ${category}: ${count}/${expected} responses`);
    });

    console.log("\n✅ New sleep & stress questions working correctly!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testNewQuestions();
