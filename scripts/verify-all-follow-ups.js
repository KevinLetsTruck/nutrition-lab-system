#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyAllFollowUps() {
  console.log("\n🔍 Verifying ALL Follow-up Questions in Database\n");
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

    // Define all expected follow-up questions
    const expectedFollowUps = [
      {
        id: "essential-digestive-issues-details",
        dependsOn: "essential-digestive-issues",
        showIf: "yes",
      },
      {
        id: "essential-food-list",
        dependsOn: "essential-food-sensitivities",
        showIf: "yes",
      },
      {
        id: "essential-chronic-conditions-list",
        dependsOn: "essential-chronic-conditions",
        showIf: "yes",
      },
      {
        id: "essential-medications-list",
        dependsOn: "essential-medications",
        showIf: "yes",
      },
      {
        id: "essential-bowel-issues",
        dependsOn: "essential-bowel-regularity",
        showIf: "no", // Note: triggers on NO
      },
      {
        id: "essential-stomach-pain-details",
        dependsOn: "essential-stomach-pain",
        showIf: "yes",
      },
      {
        id: "essential-food-reactions-list",
        dependsOn: "essential-food-reactions",
        showIf: "yes",
      },
      {
        id: "essential-afternoon-crash-details",
        dependsOn: "essential-afternoon-crash",
        showIf: "yes",
      },
      {
        id: "essential-caffeine-details",
        dependsOn: "essential-caffeine-need",
        showIf: "yes",
      },
      {
        id: "essential-autoimmune-list",
        dependsOn: "essential-autoimmune",
        showIf: "yes",
      },
      {
        id: "essential-allergies-list",
        dependsOn: "essential-allergies",
        showIf: "yes",
      },
      {
        id: "essential-inflammation-details",
        dependsOn: "essential-inflammation",
        showIf: "yes",
      },
      {
        id: "essential-temperature-details",
        dependsOn: "essential-temperature-regulation",
        showIf: "yes",
      },
      {
        id: "essential-hair-skin-details",
        dependsOn: "essential-hair-skin",
        showIf: "yes",
      },
      {
        id: "essential-anxiety-mood-details",
        dependsOn: "essential-anxiety-mood",
        showIf: "yes",
      },
      {
        id: "essential-breath-details",
        dependsOn: "essential-breath-issues",
        showIf: "yes",
      },
      {
        id: "essential-heart-family-details",
        dependsOn: "essential-heart-family",
        showIf: "yes",
      },
      {
        id: "essential-chemical-sensitivity-list",
        dependsOn: "essential-chemical-sensitivity",
        showIf: "yes",
      },
    ];

    console.log("📋 Checking ALL Follow-up Questions:\n");

    let foundCount = 0;
    let missingCount = 0;

    expectedFollowUps.forEach((expected) => {
      const question = questionBank.find((q) => q.id === expected.id);
      if (question) {
        console.log(`✅ Found: ${expected.id}`);
        console.log(`   Type: ${question.type}`);
        console.log(
          `   Depends on: ${
            question.conditionalLogic?.dependsOn || "ERROR: No dependency"
          }`
        );
        console.log(
          `   Shows if: ${
            question.conditionalLogic?.showIf || "ERROR: No condition"
          }`
        );

        // Verify conditional logic is correct
        if (question.conditionalLogic?.dependsOn !== expected.dependsOn) {
          console.log(
            `   ⚠️  WARNING: Expected to depend on ${expected.dependsOn}`
          );
        }
        if (question.conditionalLogic?.showIf !== expected.showIf) {
          console.log(`   ⚠️  WARNING: Expected to show if ${expected.showIf}`);
        }

        foundCount++;
        console.log("");
      } else {
        console.log(`❌ Missing: ${expected.id}`);
        console.log(`   Should depend on: ${expected.dependsOn}`);
        console.log(`   Should show if: ${expected.showIf}\n`);
        missingCount++;
      }
    });

    // Check total question count
    const essentialQuestions = questionBank.filter(
      (q) => q.id && q.id.startsWith("essential-")
    );

    const baseQuestions = essentialQuestions.filter((q) => !q.conditionalLogic);
    const conditionalQuestions = essentialQuestions.filter(
      (q) => q.conditionalLogic
    );

    console.log("\n📊 Summary:");
    console.log(`Total Questions: ${questionBank.length}`);
    console.log(`Essential Questions: ${essentialQuestions.length}`);
    console.log(`  - Base Questions: ${baseQuestions.length}`);
    console.log(`  - Follow-up Questions: ${conditionalQuestions.length}`);
    console.log(`\nFollow-up Questions Check:`);
    console.log(`  - Found: ${foundCount}/${expectedFollowUps.length}`);
    console.log(`  - Missing: ${missingCount}`);

    if (foundCount === expectedFollowUps.length) {
      console.log("\n✅ All follow-up questions properly loaded!");
    } else {
      console.log("\n⚠️  Some follow-up questions are missing!");
    }

    // List all YES/NO questions to verify they have follow-ups
    console.log("\n📋 YES/NO Questions Coverage:");
    const yesNoQuestions = essentialQuestions.filter(
      (q) => q.type === "YES_NO" && !q.conditionalLogic
    );
    yesNoQuestions.forEach((q) => {
      const hasFollowUp = conditionalQuestions.some(
        (f) => f.conditionalLogic?.dependsOn === q.id
      );
      console.log(
        `${hasFollowUp ? "✅" : "⚠️ "} ${q.id} ${
          hasFollowUp ? "has" : "MISSING"
        } follow-up`
      );
    });
  } catch (error) {
    console.error("❌ Error verifying questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllFollowUps();
