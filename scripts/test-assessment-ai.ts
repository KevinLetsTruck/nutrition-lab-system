/**
 * Test script for the AI Assessment Engine
 * Run with: npx tsx scripts/test-assessment-ai.ts
 */

import { assessmentAI } from "@/lib/ai/assessment-ai";
import { AssessmentQuestion } from "@/lib/assessment/types";

// Mock data for testing
const mockAssessmentId = "test-assessment-123";

const mockQuestions: AssessmentQuestion[] = [
  {
    id: "SCR001",
    text: "How often do you experience fatigue or low energy?",
    module: "SCREENING",
    category: "Energy",
    type: "scale",
    scale: {
      min: 0,
      max: 4,
      labels: {
        0: "Never",
        1: "Rarely",
        2: "Sometimes",
        3: "Often",
        4: "Always",
      },
    },
    required: true,
    weight: 2,
    seedOilRelevant: false,
  },
  {
    id: "SCR_SO01",
    text: "How often do you eat fried foods?",
    module: "SCREENING",
    category: "Diet",
    type: "scale",
    scale: {
      min: 0,
      max: 4,
      labels: {
        0: "Never",
        1: "1-2 times/month",
        2: "1-2 times/week",
        3: "3-4 times/week",
        4: "Daily or more",
      },
    },
    required: true,
    weight: 3,
    seedOilRelevant: true,
  },
  {
    id: "SCR003",
    text: "Do you experience digestive issues after meals?",
    module: "SCREENING",
    category: "Digestive",
    type: "scale",
    scale: {
      min: 0,
      max: 4,
      labels: {
        0: "Never",
        1: "Rarely",
        2: "Sometimes",
        3: "Often",
        4: "Always",
      },
    },
    required: true,
    weight: 2,
    seedOilRelevant: false,
  },
];

const mockResponses = [
  {
    questionId: "SCR001",
    value: 3,
    text: "Often experience fatigue",
  },
  {
    questionId: "SCR_SO01",
    value: 4,
    text: "Daily fried food consumption",
  },
];

async function testAIEngine() {
  console.log("🧪 Testing AI Assessment Engine...\n");

  // Test 1: Question Selection
  console.log("Test 1: AI Question Selection");
  console.log("============================");
  try {
    const selection = await assessmentAI.selectNextQuestion(
      mockAssessmentId,
      mockQuestions,
      mockResponses
    );

    console.log("✅ AI Selected Question:", selection.questionId);
    console.log("   Reasoning:", selection.reasoning);
    console.log("   Priority:", selection.priority);
    console.log("   Expected Value:", selection.expectedValue);
  } catch (error) {
    console.error("❌ Question selection failed:", error);
  }

  console.log("\n");

  // Test 2: Module Activation Analysis
  console.log("Test 2: Module Activation Analysis");
  console.log("=================================");
  console.log("⚠️  Note: This test will fail without database connection");
  console.log("    It's included to show the API structure\n");

  // Test 3: Prompt Template Usage
  console.log("Test 3: Prompt Templates");
  console.log("=======================");
  try {
    const { ASSESSMENT_PROMPTS, SEED_OIL_ANALYSIS_PROMPT } = await import(
      "@/lib/ai/prompts"
    );

    console.log("✅ Available prompt configurations:");
    Object.entries(ASSESSMENT_PROMPTS).forEach(([key, config]) => {
      console.log(
        `   - ${key}: Temperature ${config.temperature}, Max Tokens: ${config.maxTokens}`
      );
    });

    console.log("\n✅ Seed oil analysis prompt loaded");
    console.log("   Length:", SEED_OIL_ANALYSIS_PROMPT.length, "characters");
  } catch (error) {
    console.error("❌ Prompt loading failed:", error);
  }

  console.log("\n🎉 AI Assessment Engine test complete!");
  console.log("\nTo fully test the engine:");
  console.log("1. Set ANTHROPIC_API_KEY in your .env.local file");
  console.log("2. Ensure database is connected");
  console.log("3. Run: npx tsx scripts/test-assessment-ai.ts");
}

// Run the test
testAIEngine().catch(console.error);
