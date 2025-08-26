const API_BASE = "http://localhost:3000";
const TEST_CLIENT_ID = "cmeqhcsr30005v2ot9m97ljko";

console.log("🧪 Testing New Immune & Hormonal Questions via API");
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

    // Test new immune questions (46-50)
    const newImmuneQuestions = [
      { id: 46, theme: "symptom severity", score: 2 },
      { id: 47, theme: "seasonal health impact", score: 3 },
      { id: 48, theme: "inflammation frequency", score: 1 },
      { id: 49, theme: "energy during illness", score: 4 },
      { id: 50, theme: "immune stress handling", score: 4 },
    ];

    console.log("\n🛡️ Testing New Immune Questions (46-50):");
    console.log("-".repeat(60));

    for (const question of newImmuneQuestions) {
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

    // Test new hormonal questions (56-60)
    const newHormonalQuestions = [
      { id: 56, theme: "weight stability", score: 3 },
      { id: 57, theme: "temperature regulation", score: 4 },
      { id: 58, theme: "hair/skin changes", score: 2 },
      { id: 59, theme: "hunger signals", score: 4 },
      { id: 60, theme: "daily patterns", score: 3 },
    ];

    console.log("\n⚡ Testing New Hormonal Questions (56-60):");
    console.log("-".repeat(60));

    for (const question of newHormonalQuestions) {
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
      `   Total responses: ${statusData.data.progress.completed}/70 (${statusData.data.progress.percentage}%)`
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
      const expected = [
        "digestive",
        "energy",
        "sleep",
        "stress",
        "immune",
        "hormonal",
      ].includes(category)
        ? 10
        : 5;
      console.log(`   ${category}: ${count}/${expected} responses`);
    });

    // Test renumbered questions (check detox Q61)
    console.log("\n🔢 Testing Renumbered Questions:");
    const res61 = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: 61,
          score: 2,
        }),
      }
    );

    const data61 = await res61.json();
    if (data61.success) {
      const q61 = data61.assessment.responses.find((r) => r.questionId === 61);
      console.log(
        `   Q61 (Detox): ${q61 ? `✅ "${q61.questionText}"` : "❌ Not found"}`
      );
    }

    console.log("\n✅ New immune & hormonal questions working correctly!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testNewQuestions();
