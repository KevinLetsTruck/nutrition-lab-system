const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function verifySeverityQuestions() {
  console.log("🔍 Verifying Severity Questions in Database\n");

  try {
    // Get the active assessment template
    const activeTemplate = await prisma.assessmentTemplate.findUnique({
      where: { id: "default" },
    });

    if (!activeTemplate) {
      console.log("❌ No active assessment template found");
      return;
    }

    const questionBank = activeTemplate.questionBank;
    const totalQuestions = questionBank.length;

    console.log(`📊 Total Questions: ${totalQuestions}\n`);

    // Find severity-related questions
    const severityQuestions = questionBank.filter(
      (q) =>
        q.id.includes("severity") ||
        q.id.includes("impact") ||
        q.id.includes("frequency") ||
        q.id.includes("triggers") ||
        q.id.includes("timeline")
    );

    console.log(
      `🎯 Severity-Related Questions Found: ${severityQuestions.length}\n`
    );

    // List severity questions
    console.log("📋 Severity Questions:");
    severityQuestions.forEach((q) => {
      console.log(`\n  • ${q.id}`);
      console.log(`    Text: "${q.text}"`);
      console.log(`    Type: ${q.type}`);
      if (q.conditionalLogic) {
        console.log(`    Depends on: ${q.conditionalLogic.dependsOn}`);
        console.log(`    Shows if: ${q.conditionalLogic.showIf}`);
      }
    });

    // Check specific expected severity questions
    const expectedSeverityQuestions = [
      "essential-digest-severity",
      "essential-digest-triggers",
      "essential-chronic-impact",
      "essential-inflammation-frequency",
      "essential-inflammation-severity",
      "essential-anxiety-frequency",
      "essential-anxiety-impact",
      "essential-symptom-timeline",
    ];

    console.log("\n✅ Checking Expected Severity Questions:");
    expectedSeverityQuestions.forEach((id) => {
      const found = questionBank.find((q) => q.id === id);
      if (found) {
        console.log(`  ✓ ${id} - Found`);
      } else {
        console.log(`  ✗ ${id} - MISSING`);
      }
    });

    // Check conditional logic
    console.log("\n🔗 Conditional Logic Check:");
    const conditionalSeverityQuestions = severityQuestions.filter(
      (q) =>
        q.conditionalLogic && q.conditionalLogic.showIf === "hasAnySelection"
    );

    console.log(
      `  Questions with "hasAnySelection" logic: ${conditionalSeverityQuestions.length}`
    );
    conditionalSeverityQuestions.forEach((q) => {
      console.log(`    - ${q.id} (depends on ${q.conditionalLogic.dependsOn})`);
    });

    // Summary
    console.log("\n📈 Summary:");
    console.log(`  - Total questions: ${totalQuestions}`);
    console.log(`  - Severity questions: ${severityQuestions.length}`);
    console.log(
      `  - Questions with array-based conditions: ${conditionalSeverityQuestions.length}`
    );

    // Check Likert scales
    const likertQuestions = questionBank.filter(
      (q) => q.type === "LIKERT_SCALE"
    );
    console.log(`  - Total LIKERT_SCALE questions: ${likertQuestions.length}`);
  } catch (error) {
    console.error("❌ Error verifying questions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeverityQuestions();
