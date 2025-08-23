const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkQuestionOrder() {
  try {
    const template = await prisma.assessmentTemplate.findFirst({
      where: { id: "default" },
    });

    if (!template) {
      console.log("No default template found");
      return;
    }

    const questions = template.questionBank;

    console.log("Total questions:", questions.length);
    console.log("\nFirst 20 questions in order:");
    console.log("=====================================\n");

    for (let i = 0; i < Math.min(20, questions.length); i++) {
      const q = questions[i];
      console.log(`${i + 1}. [${q.id}] ${q.text}`);
      console.log(`   Type: ${q.type}, Module: ${q.module}`);
      console.log("");
    }

    // Find questions about primary concern
    console.log('\nQuestions mentioning "primary concern":');
    console.log("======================================\n");

    const primaryConcernQuestions = questions
      .map((q, index) => ({ ...q, position: index + 1 }))
      .filter((q) => q.text.toLowerCase().includes("primary concern"));

    primaryConcernQuestions.forEach((q) => {
      console.log(`Position ${q.position}: [${q.id}] ${q.text}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestionOrder();
