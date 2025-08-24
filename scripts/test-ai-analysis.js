import { PrismaClient } from "@prisma/client";
import { generateAssessmentAnalysis } from "../lib/ai/assessment-analysis.js";

const prisma = new PrismaClient();

async function testAIAnalysis() {
  try {
    console.log("Testing Claude AI Analysis Integration...\n");

    // Check for API key
    if (
      !process.env.ANTHROPIC_API_KEY ||
      process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key-here"
    ) {
      console.error("❌ ANTHROPIC_API_KEY not set in .env.local");
      console.log("\nPlease add your Anthropic API key to .env.local:");
      console.log("ANTHROPIC_API_KEY=your-actual-api-key-here");
      process.exit(1);
    }

    console.log("✅ Anthropic API key found\n");

    // Get a completed assessment to test with
    const assessment = await prisma.clientAssessment.findFirst({
      where: { status: "COMPLETED" },
      include: {
        client: true,
        responses: true,
      },
    });

    if (!assessment) {
      console.log("No completed assessments found. Creating test data...");

      // Create a test assessment
      const client = await prisma.client.findFirst();
      if (!client) {
        console.error("No clients found. Please create a client first.");
        process.exit(1);
      }

      // Simulate some responses
      console.log("Using mock responses for testing...");
      const mockResponses = [
        {
          questionText: "Do you experience frequent headaches?",
          questionModule: "NEUROLOGICAL",
          responseType: "FREQUENCY",
          responseValue: "often",
        },
        {
          questionText: "Rate your energy level throughout the day",
          questionModule: "ENDOCRINE",
          responseType: "LIKERT_SCALE",
          responseValue: 3,
        },
        {
          questionText: "Do you have digestive issues after meals?",
          questionModule: "DIGESTIVE",
          responseType: "YES_NO",
          responseValue: "yes",
        },
      ];

      console.log("\nGenerating AI analysis with mock data...");
      const analysis = await generateAssessmentAnalysis({
        assessmentId: "test-assessment",
        responses: mockResponses,
        symptomProfile: {},
        aiContext: {},
      });

      console.log("\n🎉 AI Analysis Generated Successfully!");
      console.log(JSON.stringify(analysis, null, 2));
    } else {
      console.log(`Found assessment: ${assessment.id}`);
      console.log(
        `Client: ${assessment.client.firstName} ${assessment.client.lastName}`
      );
      console.log(`Responses: ${assessment.responses.length}`);

      console.log("\nGenerating AI analysis...");
      const analysis = await generateAssessmentAnalysis({
        assessmentId: assessment.id,
        responses: assessment.responses,
        symptomProfile: assessment.symptomProfile || {},
        aiContext: assessment.aiContext || {},
      });

      console.log("\n🎉 AI Analysis Generated Successfully!");
      console.log("\nOverall Score:", analysis.overallScore);
      console.log("\nBody System Scores:");
      Object.entries(analysis.nodeScores).forEach(([system, score]) => {
        console.log(`  ${system}: ${score}/100`);
      });
      console.log("\nSummary:", analysis.summary);
      console.log("\nKey Findings:", analysis.keyFindings);
      console.log("\nProtocol Priority:", analysis.protocolPriority);
    }
  } catch (error) {
    console.error("\n❌ Error testing AI analysis:", error);
    if (error.message?.includes("API key")) {
      console.log(
        "\nMake sure your Anthropic API key is valid and has sufficient credits."
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAIAnalysis();
