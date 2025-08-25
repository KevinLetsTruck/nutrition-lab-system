#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyFollowUpQuestions() {
  console.log("\n🔍 Verifying Follow-up Questions in Database\n");
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

    const questionBank = activeTemplate.questionBank;

    // Look for the specific follow-up questions
    const followUpQuestions = [
      "essential-food-list",
      "essential-chronic-conditions-list",
      "essential-medications-list",
    ];

    console.log("📋 Checking for Follow-up Questions:\n");

    followUpQuestions.forEach((questionId) => {
      const question = questionBank.find((q) => q.id === questionId);
      if (question) {
        console.log(`✅ Found: ${questionId}`);
        console.log(`   Text: ${question.text}`);
        console.log(`   Type: ${question.type}`);
        console.log(
          `   Conditional: ${question.conditionalLogic ? "YES" : "NO"}`
        );
        if (question.conditionalLogic) {
          console.log(`   Depends on: ${question.conditionalLogic.dependsOn}`);
          console.log(`   Shows if: ${question.conditionalLogic.showIf}`);
        }
        if (question.placeholder) {
          console.log(`   Placeholder: ${question.placeholder}`);
        }
        console.log("");
      } else {
        console.log(`❌ Missing: ${questionId}\n`);
      }
    });

    // Check total question count
    const essentialQuestions = questionBank.filter(
      (q) => q.id && q.id.startsWith("essential-")
    );

    console.log("\n📊 Summary:");
    console.log(`Total Questions: ${questionBank.length}`);
    console.log(`Essential Questions: ${essentialQuestions.length}`);
    console.log(`Expected: 32 (30 original + 2 new follow-ups)`);

    if (essentialQuestions.length === 32) {
      console.log("\n✅ All questions properly loaded!");
    } else {
      console.log("\n⚠️  Question count mismatch!");
    }
  } catch (error) {
    console.error("❌ Error verifying questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFollowUpQuestions();
