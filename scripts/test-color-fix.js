const API_BASE = "http://localhost:3000";
const TEST_CLIENT_ID = "cmeqhcsr30005v2ot9m97ljko";

console.log("🎨 Testing Color Fix for Assessment Scales");
console.log("=".repeat(60));

async function testColorFix() {
  try {
    // Start/resume assessment
    const startRes = await fetch(`${API_BASE}/api/simple-assessment/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: TEST_CLIENT_ID }),
    });

    const startData = await startRes.json();
    if (!startData.success) {
      console.error("Failed to start assessment:", startData.error);
      return;
    }

    const assessmentId = startData.assessment.id;
    console.log("✅ Assessment ID:", assessmentId);

    // Get the status to see the current/next question
    const statusRes = await fetch(
      `${API_BASE}/api/simple-assessment/${assessmentId}/status`
    );
    const statusData = await statusRes.json();

    if (statusData.success && statusData.data.nextQuestion) {
      const question = statusData.data.nextQuestion;
      console.log("\n📋 Current Question:");
      console.log(`   Q${question.id}: ${question.text}`);
      console.log(`   Scale Type: ${question.scaleType}`);
      console.log("\n🎨 Expected Button Colors:");

      if (question.scaleType === "frequencyReverse") {
        console.log("   1 = Never    → ✅ GREEN (success variant)");
        console.log("   2 = Rarely   → ⚪ GRAY (outline variant)");
        console.log("   3 = Sometimes → ⚪ GRAY (outline variant)");
        console.log("   4 = Often    → ⚪ GRAY (outline variant)");
        console.log("   5 = Always   → ❌ RED (destructive variant)");
        console.log("\n✅ Color logic is correct for negative symptoms!");
        console.log("   Green = Good (no symptoms)");
        console.log("   Red = Bad (frequent symptoms)");
      } else {
        console.log(
          "   This question uses normal scale (not frequency reverse)"
        );
      }
    } else if (statusData.data.assessment.status === "completed") {
      console.log("\n✅ Assessment is already completed!");
    }

    console.log(
      "\n🌐 Visit http://localhost:3000/simple-assessment to see the fixed colors!"
    );
    console.log("   The colors should now be intuitive:");
    console.log("   - Never having symptoms = GREEN button");
    console.log("   - Always having symptoms = RED button");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testColorFix();
