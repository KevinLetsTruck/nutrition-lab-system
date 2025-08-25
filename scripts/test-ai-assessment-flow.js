// Test AI-driven assessment flow without authentication
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const API_BASE = "http://localhost:3001";

async function testAIAssessmentFlow() {
  console.log("🧪 Testing AI-Driven Assessment Logic");
  console.log("=====================================\n");

  try {
    // Start a test assessment
    console.log("1️⃣ Starting test assessment...");
    const startRes = await fetch(`${API_BASE}/api/assessment/test/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isTest: true,
        templateId: "default",
      }),
    });

    if (!startRes.ok) {
      const error = await startRes.text();
      throw new Error(`Failed to start: ${error}`);
    }

    const { assessmentId, firstQuestion } = await startRes.json();
    console.log(`✅ Assessment started: ${assessmentId}`);
    console.log(
      `📋 First question: ${firstQuestion?.text?.substring(0, 60)}...\n`
    );

    // Test Scenario: High digestive issues pattern
    const digestiveScenarioResponses = {
      "essential-energy-level": 2,
      "essential-sleep-quality": 2,
      "essential-digest-meals": "yes",
      "essential-bloating": "yes",
      "essential-gas": "yes",
      "essential-stomach-pain": "yes",
      "essential-constipation": "yes",
    };

    let questionCount = 0;
    let modulePattern = {};
    let aiReasonings = [];
    let complete = false;

    console.log("2️⃣ Answering questions with digestive issues pattern...\n");

    while (!complete && questionCount < 50) {
      // Get next question
      const nextRes = await fetch(
        `${API_BASE}/api/assessment/${assessmentId}/next-question`
      );

      if (!nextRes.ok) {
        throw new Error(`Failed to get next question: ${nextRes.status}`);
      }

      const data = await nextRes.json();

      if (data.complete) {
        complete = true;
        console.log(
          `\n✅ Assessment completed after ${questionCount} questions`
        );
        break;
      }

      const question = data.question;
      const aiReasoning = data.aiReasoning;
      const currentModule = data.currentModule;

      questionCount++;

      // Track module activation
      if (!modulePattern[currentModule]) {
        modulePattern[currentModule] = 0;
      }
      modulePattern[currentModule]++;

      // Log AI reasoning if present
      if (aiReasoning) {
        aiReasonings.push({
          questionNumber: questionCount,
          module: currentModule,
          reasoning: aiReasoning,
        });
        console.log(`🤖 AI: ${aiReasoning.substring(0, 100)}...`);
      }

      console.log(
        `Q${questionCount} [${currentModule}]: ${question.text.substring(
          0,
          50
        )}...`
      );

      // Generate response based on scenario
      let response;
      if (digestiveScenarioResponses[question.id]) {
        response = digestiveScenarioResponses[question.id];
      } else if (question.type === "YES_NO") {
        // Answer yes to digestive questions, no to others
        response = currentModule === "DIGESTIVE" ? "yes" : "no";
      } else if (question.type === "LIKERT_SCALE") {
        response = currentModule === "DIGESTIVE" ? 4 : 2;
      } else {
        response = "Test response";
      }

      // Submit response
      const saveRes = await fetch(
        `${API_BASE}/api/assessment/${assessmentId}/response`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assessmentId,
            questionId: question.id,
            value: response,
            valueType: typeof response,
            questionType: question.type,
          }),
        }
      );

      if (!saveRes.ok) {
        console.warn(`⚠️ Failed to save response: ${saveRes.status}`);
      }
    }

    // Analyze results
    console.log("\n" + "=".repeat(60));
    console.log("📊 ANALYSIS RESULTS");
    console.log("=".repeat(60) + "\n");

    // Check if AI was active
    const aiActive = aiReasonings.length > 0;
    console.log(
      aiActive
        ? "✅ AI ADAPTIVE MODE: Active"
        : "❌ SEQUENTIAL MODE: Active (No AI reasoning found)"
    );

    // Show module activation pattern
    console.log("\n📈 Module Activation Pattern:");
    const sortedModules = Object.entries(modulePattern).sort(
      ([, a], [, b]) => b - a
    );

    sortedModules.forEach(([module, count]) => {
      const bar = "█".repeat(Math.min(count, 20));
      console.log(`  ${module.padEnd(15)} ${bar} (${count} questions)`);
    });

    // Check if digestive module was prioritized
    const digestiveCount = modulePattern["DIGESTIVE"] || 0;
    const totalQuestions = Object.values(modulePattern).reduce(
      (sum, count) => sum + count,
      0
    );
    const digestivePercentage = (digestiveCount / totalQuestions) * 100;

    console.log(`\n🎯 Digestive Focus: ${digestivePercentage.toFixed(1)}%`);
    if (digestivePercentage > 30) {
      console.log("✅ AI correctly prioritized digestive questions");
    } else {
      console.log("❌ AI did not prioritize digestive questions as expected");
    }

    // Show some AI reasoning examples
    if (aiReasonings.length > 0) {
      console.log("\n🧠 AI Reasoning Examples:");
      aiReasonings.slice(0, 3).forEach((r) => {
        console.log(`  Q${r.questionNumber}: "${r.reasoning}"`);
      });
    }

    // Final verdict
    console.log("\n" + "=".repeat(60));
    console.log("🏁 FINAL VERDICT");
    console.log("=".repeat(60) + "\n");

    const isAdaptive =
      aiActive && digestivePercentage > 30 && questionCount < 150;

    if (isAdaptive) {
      console.log("✅ AI-DRIVEN ADAPTIVE ASSESSMENT CONFIRMED");
      console.log("   - AI reasoning detected");
      console.log("   - Questions adapted to responses");
      console.log("   - Efficient question count");
    } else {
      console.log("❌ ISSUES DETECTED:");
      if (!aiActive) console.log("   - No AI reasoning found");
      if (digestivePercentage <= 30)
        console.log("   - Did not adapt to digestive issues");
      if (questionCount >= 150) console.log("   - Too many questions asked");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("\nMake sure:");
    console.error("1. Server is running (npm run dev)");
    console.error("2. ANTHROPIC_API_KEY is set in .env.local");
    console.error("3. Database is running and migrated");
  }
}

// Run the test
testAIAssessmentFlow();
