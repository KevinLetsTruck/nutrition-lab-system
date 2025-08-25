#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifyAssessmentCompletion() {
  console.log("\n🔍 Verifying Assessment Completion\n");
  console.log("=".repeat(50));

  try {
    // 1. Check for recent assessments
    const recentAssessments = await prisma.clientAssessment.findMany({
      where: {
        OR: [
          {
            startedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
          {
            lastActiveAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        ],
      },
      include: {
        client: true,
        template: true,
      },
      orderBy: {
        lastActiveAt: "desc",
      },
      take: 5,
    });

    console.log(`\n📊 Recent Assessments (Last 24 hours):`);
    console.log(`Found ${recentAssessments.length} assessments\n`);

    for (const assessment of recentAssessments) {
      console.log(`Assessment ID: ${assessment.id}`);
      console.log(`Client: ${assessment.client?.name || "No client linked"}`);
      console.log(`Status: ${assessment.status}`);
      console.log(`Questions Asked: ${assessment.questionsAsked || 0}`);
      console.log(
        `Started: ${assessment.startedAt?.toLocaleString() || "Not started"}`
      );
      console.log(
        `Last Active: ${assessment.lastActiveAt?.toLocaleString() || "Never"}`
      );

      // 2. Check responses for this assessment
      const responses = await prisma.clientResponse.findMany({
        where: {
          assessmentId: assessment.id,
        },
        orderBy: {
          answeredAt: "desc",
        },
      });

      console.log(`\n📝 Responses: ${responses.length} total`);

      if (responses.length > 0) {
        // Show response summary by module
        const moduleCount = {};
        responses.forEach((r) => {
          moduleCount[r.questionModule] =
            (moduleCount[r.questionModule] || 0) + 1;
        });

        console.log("\nResponses by Module:");
        Object.entries(moduleCount).forEach(([module, count]) => {
          console.log(`  - ${module}: ${count} questions`);
        });

        // Show last 3 responses
        console.log("\nLast 3 Responses:");
        responses.slice(0, 3).forEach((r) => {
          console.log(
            `  - ${r.questionId}: "${
              r.responseValue
            }" (${r.answeredAt.toLocaleString()})`
          );
        });

        // Check for essential questions completion
        const essentialQuestionIds = [
          "essential-energy-level",
          "essential-sleep-quality",
          "essential-stress-level",
          "essential-digestive-issues",
          "essential-food-sensitivities",
          "essential-chronic-conditions",
          "essential-medications",
          "essential-bloating",
          "essential-bowel-regularity",
          "essential-acid-reflux",
          "essential-appetite",
          "essential-stomach-pain",
          "essential-food-reactions",
          "essential-morning-energy",
          "essential-afternoon-crash",
          "essential-exercise-recovery",
          "essential-brain-fog",
          "essential-caffeine-need",
          "essential-sick-frequency",
          "essential-autoimmune",
          "essential-allergies",
          "essential-wound-healing",
          "essential-inflammation",
          "essential-mood-swings",
          "essential-weight-changes",
          "essential-temperature-regulation",
          "essential-libido",
          "essential-hair-skin",
          "essential-sugar-cravings",
        ];

        const answeredEssentialIds = responses.map((r) => r.questionId);
        const essentialAnswered = essentialQuestionIds.filter((id) =>
          answeredEssentialIds.includes(id)
        );

        console.log(
          `\n✅ Essential Questions Answered: ${essentialAnswered.length}/30`
        );

        // Check conditional logic - food list should only appear if food sensitivities = yes
        const foodSensitivityResponse = responses.find(
          (r) => r.questionId === "essential-food-sensitivities"
        );
        const foodListResponse = responses.find(
          (r) => r.questionId === "essential-food-list"
        );

        if (foodSensitivityResponse) {
          console.log(`\n🔄 Conditional Logic Check:`);
          console.log(
            `  Food Sensitivities Answer: ${foodSensitivityResponse.responseValue}`
          );
          if (
            foodSensitivityResponse.responseValue === "yes" ||
            foodSensitivityResponse.responseValue === "YES"
          ) {
            if (foodListResponse) {
              console.log(
                `  ✅ Food list question was shown and answered: ${foodListResponse.responseValue}`
              );
            } else {
              console.log(
                `  ⚠️  Food list question should have been shown but wasn't answered`
              );
            }
          } else {
            if (foodListResponse) {
              console.log(
                `  ❌ Food list question was answered but shouldn't have been shown`
              );
            } else {
              console.log(`  ✅ Food list question correctly skipped`);
            }
          }
        }
      }

      console.log("\n" + "-".repeat(50) + "\n");
    }

    // 3. Overall statistics
    const totalAssessments = await prisma.clientAssessment.count();
    const completedAssessments = await prisma.clientAssessment.count({
      where: { status: "COMPLETED" },
    });
    const totalResponses = await prisma.clientResponse.count();

    console.log("\n📈 Overall Statistics:");
    console.log(`Total Assessments: ${totalAssessments}`);
    console.log(`Completed Assessments: ${completedAssessments}`);
    console.log(`Total Responses: ${totalResponses}`);

    // 4. Check for orphaned responses
    const orphanedResponses = await prisma.clientResponse.findMany({
      where: {
        assessmentId: null,
      },
    });

    if (orphanedResponses.length > 0) {
      console.log(
        `\n⚠️  Found ${orphanedResponses.length} orphaned responses (not linked to any assessment)`
      );
    }

    console.log("\n✅ Verification Complete!\n");
  } catch (error) {
    console.error("❌ Error verifying assessment:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAssessmentCompletion();
