#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyDropdownConversions() {
  console.log("\n🔍 Verifying Follow-up Questions Converted to Dropdowns\n");
  console.log("=".repeat(60));

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

    // Get all follow-up questions (those with conditional logic)
    const followUpQuestions = questionBank.filter(
      (q) => q.conditionalLogic && q.id && q.id.startsWith("essential-")
    );

    console.log(`📊 Follow-up Questions Analysis:\n`);
    console.log(`Total Follow-up Questions: ${followUpQuestions.length}`);

    // Count by type
    const typeCount = {};
    followUpQuestions.forEach((q) => {
      typeCount[q.type] = (typeCount[q.type] || 0) + 1;
    });

    console.log("\nFollow-up Questions by Type:");
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    // Check for any remaining TEXT follow-ups
    const textFollowUps = followUpQuestions.filter((q) => q.type === "TEXT");

    if (textFollowUps.length > 0) {
      console.log("\n⚠️  Found TEXT follow-up questions:");
      textFollowUps.forEach((q) => {
        console.log(`  - ${q.id}: ${q.text}`);
      });
    } else {
      console.log(
        "\n✅ No TEXT follow-up questions found - all converted to dropdowns!"
      );
    }

    // List all MULTI_SELECT follow-ups with "Other" option
    console.log("\n📋 MULTI_SELECT Questions with 'Other' Option:");
    const multiSelectWithOther = followUpQuestions.filter(
      (q) =>
        q.type === "MULTI_SELECT" && q.options && q.options.includes("Other")
    );

    console.log(
      `Found ${multiSelectWithOther.length} questions with 'Other' option:`
    );
    multiSelectWithOther.forEach((q) => {
      console.log(`  - ${q.id} (${q.options.length} options)`);
    });

    // Check medications question (should remain TEXT)
    const medicationsQuestion = questionBank.find(
      (q) => q.id === "essential-medications-list"
    );

    if (medicationsQuestion) {
      console.log(`\n💊 Medications Question Status:`);
      console.log(`  Type: ${medicationsQuestion.type}`);
      console.log(
        `  ${
          medicationsQuestion.type === "TEXT" ? "✅" : "❌"
        } Correctly kept as TEXT (too many possibilities)`
      );
    }

    // Summary
    console.log("\n📈 Summary:");
    const multiSelectCount = followUpQuestions.filter(
      (q) => q.type === "MULTI_SELECT"
    ).length;
    const multipleChoiceCount = followUpQuestions.filter(
      (q) => q.type === "MULTIPLE_CHOICE"
    ).length;
    const remainingTextCount = textFollowUps.length;

    console.log(`  - MULTI_SELECT: ${multiSelectCount}`);
    console.log(`  - MULTIPLE_CHOICE: ${multipleChoiceCount}`);
    console.log(`  - TEXT: ${remainingTextCount} (medications only)`);
    console.log(`  - Total: ${followUpQuestions.length}`);

    if (remainingTextCount === 1 && medicationsQuestion?.type === "TEXT") {
      console.log(
        "\n✅ All follow-up questions successfully converted to dropdowns!"
      );
      console.log("   (Medications kept as TEXT for flexibility)");
    }
  } catch (error) {
    console.error("❌ Error verifying questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDropdownConversions();
