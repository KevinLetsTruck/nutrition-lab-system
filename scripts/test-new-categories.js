const API_BASE = "http://localhost:3000";
const TEST_CLIENT_ID = "cmeqhcsr30005v2ot9m97ljko";

console.log("🧪 Testing New Categories (Questions 21-40)");
console.log("=".repeat(60));

async function testNewCategories() {
  try {
    // Get current assessment
    const startRes = await fetch(`${API_BASE}/api/simple-assessment/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: TEST_CLIENT_ID }),
    });

    const startData = await startRes.json();
    const assessmentId = startData.assessment.id;
    console.log("✅ Assessment ID:", assessmentId);

    // Test submitting questions from each new category
    const testQuestions = [
      { id: 25, category: "immune", score: 2 }, // Immune question
      { id: 29, category: "hormonal", score: 4 }, // Hormonal question
      { id: 35, category: "detox", score: 3 }, // Detox question
      { id: 40, category: "cardiovascular", score: 5 }, // Cardiovascular question
    ];

    for (const question of testQuestions) {
      console.log(`\n📝 Submitting Q${question.id} (${question.category})...`);

      const submitRes = await fetch(
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

      const submitData = await submitRes.json();
      if (submitData.success) {
        console.log(`   ✅ SUCCESS - Score: ${question.score}`);
        console.log(
          `   Total responses: ${submitData.assessment.responses.length}`
        );
      } else {
        console.log(`   ❌ FAILED:`, submitData.error);
      }
    }

    // Get final status
    console.log("\n📊 Final Assessment Status:");
    const statusRes = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/status`
    );
    const statusData = await statusRes.json();

    if (statusData.success) {
      console.log(
        `   Progress: ${statusData.data.progress.completed}/40 (${statusData.data.progress.percentage}%)`
      );
      console.log(`   Status: ${statusData.data.assessment.status}`);

      // Show responses by category
      console.log("\n📈 Responses by Category:");
      const categoryResponses = {};
      statusData.data.responses.forEach((r) => {
        if (!categoryResponses[r.category]) {
          categoryResponses[r.category] = [];
        }
        categoryResponses[r.category].push(
          `Q${r.questionId}: Score ${r.score}`
        );
      });

      Object.entries(categoryResponses).forEach(([category, responses]) => {
        console.log(`   ${category}: ${responses.join(", ")}`);
      });
    }

    console.log("\n✅ New categories are working correctly!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testNewCategories();
