#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkEssentialQuestionsUsage() {
  console.log("\n🔍 Checking Essential Questions Usage\n");
  console.log("=".repeat(50));

  try {
    // Get the active assessment template
    const activeTemplate = await prisma.assessmentTemplate.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!activeTemplate) {
      console.log("❌ No active assessment template found!");
      return;
    }

    console.log(`📋 Active Template: ${activeTemplate.name}`);
    console.log(`Version: ${activeTemplate.version}`);
    console.log(`Updated: ${activeTemplate.updatedAt.toLocaleString()}`);

    // Check if it contains essential questions
    const questionBank = activeTemplate.questionBank;
    console.log(`\n📊 Question Bank Analysis:`);
    console.log(`Total Questions: ${questionBank.length}`);

    // Look for essential questions
    const essentialQuestionIds = [
      "essential-energy-level",
      "essential-sleep-quality",
      "essential-stress-level",
      "essential-food-sensitivities",
      "essential-food-list",
    ];

    const foundEssentialQuestions = questionBank.filter(
      (q) => q.id && q.id.startsWith("essential-")
    );

    console.log(`Essential Questions Found: ${foundEssentialQuestions.length}`);

    if (foundEssentialQuestions.length > 0) {
      console.log("\n✅ Template is using Essential Questions!");
      console.log("First 5 essential questions:");
      foundEssentialQuestions.slice(0, 5).forEach((q) => {
        console.log(`  - ${q.id}: ${q.text}`);
      });
    } else {
      console.log("\n❌ Template is NOT using Essential Questions!");
      console.log("First 5 questions in template:");
      questionBank.slice(0, 5).forEach((q) => {
        console.log(`  - ${q.id}: ${q.text}`);
      });
    }

    // Check recent responses to see what questions are being answered
    console.log("\n📝 Recent Response Analysis:");
    const recentResponses = await prisma.clientResponse.findMany({
      orderBy: {
        answeredAt: "desc",
      },
      take: 10,
    });

    const essentialResponses = recentResponses.filter((r) =>
      r.questionId.startsWith("essential-")
    );

    console.log(
      `Last 10 responses: ${essentialResponses.length} are essential questions`
    );

    if (essentialResponses.length === 0) {
      console.log("\n⚠️  No essential questions are being answered!");
      console.log("Recent questions being answered:");
      recentResponses.slice(0, 5).forEach((r) => {
        console.log(`  - ${r.questionId} (${r.questionModule})`);
      });
    } else {
      console.log("\n✅ Essential questions are being answered!");
      essentialResponses.forEach((r) => {
        console.log(`  - ${r.questionId}: ${r.responseValue}`);
      });
    }

    // Check environment variable
    console.log("\n🔧 Environment Check:");
    console.log(
      `NEXT_PUBLIC_ESSENTIAL_MODE: ${
        process.env.NEXT_PUBLIC_ESSENTIAL_MODE || "not set"
      }`
    );

    // Provide recommendations
    console.log("\n💡 Recommendations:");
    if (foundEssentialQuestions.length === 0) {
      console.log(
        "1. Run: npm run seed:assessment to update the template with essential questions"
      );
      console.log("2. Or manually update the template in the database");
    }
    if (essentialResponses.length === 0) {
      console.log("1. Make sure you're using the /test-complete-flow page");
      console.log(
        "2. Check that the assessment AI is using essential questions"
      );
      console.log('3. Verify NEXT_PUBLIC_ESSENTIAL_MODE is set to "true"');
    }
  } catch (error) {
    console.error("❌ Error checking essential questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEssentialQuestionsUsage();
