// Test script to verify AI-driven adaptive assessment logic
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const API_BASE = "http://localhost:3001";
const AUTH_TOKEN = "test-auth-token"; // You'll need to set this

// Test scenarios
const TEST_SCENARIOS = {
  DIGESTIVE_ISSUES: {
    name: "High Digestive Issues",
    responses: {
      "essential-energy-level": 2,
      "essential-sleep-quality": 3,
      "essential-digest-meals": "yes",
      "essential-bloating": "yes",
      "essential-gas": "yes",
      "essential-stomach-pain": "yes",
      "essential-bowel-frequency": "Less than daily",
      "essential-constipation": "yes",
      "essential-heartburn": "yes",
    },
    expectedModules: ["DIGESTIVE", "ASSIMILATION"],
    expectedSkips: ["CARDIOVASCULAR", "RESPIRATORY"],
  },
  LOW_ENERGY_HIGH_STRESS: {
    name: "Low Energy + High Stress",
    responses: {
      "essential-energy-level": 1,
      "essential-sleep-quality": 2,
      "essential-morning-energy": "Exhausted",
      "essential-afternoon-crash": "yes",
      "essential-brain-fog": "Always",
      "essential-mood-swings": "Always",
      "essential-anxiety-mood": "yes",
      "essential-digest-meals": "no",
    },
    expectedModules: ["ENERGY", "COMMUNICATION", "ENDOCRINE"],
    expectedSkips: ["DIGESTIVE", "IMMUNE"],
  },
  CLEAN_EATER: {
    name: "Clean Eater Profile",
    responses: {
      "essential-energy-level": 4,
      "essential-sleep-quality": 4,
      "essential-digest-meals": "no",
      "essential-processed-foods": "Never",
      "essential-cooking-oil": "Olive/Coconut only",
      "essential-restaurant-frequency": "Rarely",
    },
    expectedSkips: ["seed oil questions"],
  },
};

class AssessmentTester {
  constructor() {
    this.logs = [];
    this.questionCount = 0;
    this.moduleActivations = {};
    this.aiReasonings = [];
    this.questionIds = new Set();
  }

  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message };
    this.logs.push(logEntry);

    const prefix =
      {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️",
        ai: "🤖",
      }[type] || "•";

    console.log(`${prefix} ${message}`);
  }

  async startAssessment(scenario) {
    this.log(`\n${"=".repeat(60)}`, "info");
    this.log(`Testing Scenario: ${scenario.name}`, "info");
    this.log(`${"=".repeat(60)}\n`, "info");

    try {
      // Start new assessment
      const startRes = await fetch(`${API_BASE}/api/assessment/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify({
          clientId: "test-client-" + Date.now(),
        }),
      });

      if (!startRes.ok) {
        throw new Error(`Failed to start assessment: ${startRes.status}`);
      }

      const { data } = await startRes.json();
      const assessmentId = data.assessmentId;
      this.log(`Assessment started: ${assessmentId}`, "success");

      // Answer questions according to scenario
      await this.answerQuestionsWithScenario(assessmentId, scenario);

      // Analyze results
      this.analyzeResults(scenario);
    } catch (error) {
      this.log(`Test failed: ${error.message}`, "error");
    }
  }

  async answerQuestionsWithScenario(assessmentId, scenario) {
    let questionCount = 0;
    let complete = false;

    while (!complete && questionCount < 200) {
      // Get next question
      const questionRes = await fetch(
        `${API_BASE}/api/assessment/${assessmentId}/next-question`,
        {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        }
      );

      if (!questionRes.ok) {
        throw new Error(`Failed to get next question: ${questionRes.status}`);
      }

      const data = await questionRes.json();

      // Check if assessment is complete
      if (data.complete) {
        complete = true;
        this.log(
          `Assessment completed after ${questionCount} questions`,
          "success"
        );
        break;
      }

      const question = data.question;
      const aiReasoning = data.aiReasoning;
      const currentModule = data.currentModule;

      // Track question
      this.questionIds.add(question.id);
      questionCount++;
      this.questionCount = questionCount;

      // Track module activation
      if (!this.moduleActivations[currentModule]) {
        this.moduleActivations[currentModule] = 0;
      }
      this.moduleActivations[currentModule]++;

      // Log AI reasoning
      if (aiReasoning) {
        this.aiReasonings.push({
          questionNumber: questionCount,
          questionId: question.id,
          reasoning: aiReasoning,
          module: currentModule,
        });
        this.log(`AI Reasoning: ${aiReasoning}`, "ai");
      }

      this.log(
        `Q${questionCount} [${currentModule}]: ${question.text.substring(
          0,
          60
        )}...`,
        "info"
      );

      // Generate answer based on scenario
      const answer = this.generateAnswer(question, scenario);

      // Submit response
      const responseRes = await fetch(
        `${API_BASE}/api/assessment/${assessmentId}/response`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
          body: JSON.stringify({
            questionId: question.id,
            value: answer,
          }),
        }
      );

      if (!responseRes.ok) {
        throw new Error(`Failed to submit response: ${responseRes.status}`);
      }
    }

    if (!complete) {
      this.log(`WARNING: Assessment did not complete naturally`, "warning");
    }
  }

  generateAnswer(question, scenario) {
    // Check if we have a specific answer for this question
    if (scenario.responses[question.id]) {
      return scenario.responses[question.id];
    }

    // Generate answer based on question type and scenario pattern
    switch (question.type) {
      case "YES_NO":
        // For digestive issues scenario, answer yes to digestive questions
        if (
          scenario.name.includes("Digestive") &&
          question.module === "DIGESTIVE"
        ) {
          return "yes";
        }
        // For clean eater, answer no to processed food questions
        if (
          scenario.name.includes("Clean") &&
          question.text.toLowerCase().includes("processed")
        ) {
          return "no";
        }
        return Math.random() > 0.7 ? "yes" : "no";

      case "LIKERT_SCALE":
        // For low energy scenario, give low scores to energy questions
        if (
          scenario.name.includes("Low Energy") &&
          question.text.toLowerCase().includes("energy")
        ) {
          return 1;
        }
        return Math.floor(Math.random() * 5) + 1;

      case "MULTIPLE_CHOICE":
        // Return first option for simplicity
        return question.options[0];

      case "MULTI_SELECT":
        // Select 1-2 options
        const numOptions = Math.min(
          2,
          Math.floor(Math.random() * question.options.length) + 1
        );
        return question.options.slice(0, numOptions);

      default:
        return "Test response";
    }
  }

  analyzeResults(scenario) {
    this.log(`\n${"=".repeat(60)}`, "info");
    this.log(`ANALYSIS RESULTS`, "info");
    this.log(`${"=".repeat(60)}\n`, "info");

    // 1. Check if AI was active
    const aiActive = this.aiReasonings.length > 0;
    this.log(
      aiActive ? "AI ADAPTIVE MODE: Active ✓" : "SEQUENTIAL MODE: Active ✗",
      aiActive ? "success" : "error"
    );

    // 2. Total questions asked
    this.log(`Total Questions Asked: ${this.questionCount}`, "info");
    const efficient = this.questionCount < 150;
    this.log(
      efficient
        ? `Efficient Assessment: YES (${this.questionCount} < 150) ✓`
        : `Efficient Assessment: NO (${this.questionCount} >= 150) ✗`,
      efficient ? "success" : "error"
    );

    // 3. Module activation pattern
    this.log(`\nModule Activation Pattern:`, "info");
    Object.entries(this.moduleActivations)
      .sort(([, a], [, b]) => b - a)
      .forEach(([module, count]) => {
        const expected = scenario.expectedModules?.includes(module);
        const shouldSkip = scenario.expectedSkips?.includes(module);

        if (expected && count > 5) {
          this.log(
            `  ${module}: ${count} questions ✓ (Expected focus)`,
            "success"
          );
        } else if (shouldSkip && count < 3) {
          this.log(
            `  ${module}: ${count} questions ✓ (Expected skip)`,
            "success"
          );
        } else if (shouldSkip && count >= 3) {
          this.log(
            `  ${module}: ${count} questions ✗ (Should have been skipped)`,
            "error"
          );
        } else {
          this.log(`  ${module}: ${count} questions`, "info");
        }
      });

    // 4. AI reasoning samples
    if (this.aiReasonings.length > 0) {
      this.log(`\nAI Reasoning Samples:`, "info");
      this.aiReasonings.slice(0, 5).forEach((reasoning) => {
        this.log(
          `  Q${reasoning.questionNumber}: ${reasoning.reasoning.substring(
            0,
            100
          )}...`,
          "ai"
        );
      });
    }

    // 5. Question uniqueness
    const uniqueQuestions = this.questionIds.size;
    const duplicates = this.questionCount - uniqueQuestions;
    this.log(
      `\nQuestion Uniqueness: ${uniqueQuestions} unique questions (${duplicates} duplicates)`,
      duplicates === 0 ? "success" : "warning"
    );

    // 6. Personalization evidence
    const personalizedPath = this.aiReasonings.some((r) =>
      r.reasoning.toLowerCase().includes("based on")
    );
    this.log(
      `\nPersonalized Question Path: ${personalizedPath ? "YES ✓" : "NO ✗"}`,
      personalizedPath ? "success" : "error"
    );

    // Generate final verdict
    this.log(`\n${"=".repeat(60)}`, "info");
    this.log(`FINAL VERDICT`, "info");
    this.log(`${"=".repeat(60)}\n`, "info");

    const isAdaptive = aiActive && efficient && personalizedPath;
    this.log(
      isAdaptive
        ? "✅ AI-DRIVEN ADAPTIVE ASSESSMENT CONFIRMED"
        : "❌ SEQUENTIAL QUESTIONNAIRE DETECTED",
      isAdaptive ? "success" : "error"
    );

    // Save detailed report
    this.saveReport();
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalQuestions: this.questionCount,
        uniqueQuestions: this.questionIds.size,
        aiReasonings: this.aiReasonings.length,
        modulePattern: this.moduleActivations,
      },
      aiReasonings: this.aiReasonings,
      logs: this.logs,
    };

    const fs = require("fs");
    const filename = `assessment-test-report-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    this.log(`\nDetailed report saved to: ${filename}`, "info");
  }

  async runAllTests() {
    // Test 1: High Digestive Issues
    const tester1 = new AssessmentTester();
    await tester1.startAssessment(TEST_SCENARIOS.DIGESTIVE_ISSUES);

    // Wait between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 2: Low Energy + High Stress
    const tester2 = new AssessmentTester();
    await tester2.startAssessment(TEST_SCENARIOS.LOW_ENERGY_HIGH_STRESS);

    // Wait between tests
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Test 3: Clean Eater
    const tester3 = new AssessmentTester();
    await tester3.startAssessment(TEST_SCENARIOS.CLEAN_EATER);
  }
}

// Run tests
async function main() {
  console.log("🧪 AI Adaptive Assessment Logic Test");
  console.log("====================================\n");

  // Check environment
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ERROR: ANTHROPIC_API_KEY not found in environment");
    console.error("Please ensure .env.local contains your API key");
    return;
  }

  const tester = new AssessmentTester();
  await tester.runAllTests();
}

main().catch(console.error);
