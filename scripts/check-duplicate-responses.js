const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDuplicateResponses() {
  try {
    // Get all assessments
    const assessments = await prisma.clientAssessment.findMany({
      include: {
        responses: {
          orderBy: { answeredAt: "asc" },
        },
        client: true,
      },
    });

    console.log(`\nChecking ${assessments.length} assessments for duplicate responses...\n`);

    for (const assessment of assessments) {
      console.log(`\nAssessment for ${assessment.client.name || assessment.client.email}:`);
      console.log(`Total responses: ${assessment.responses.length}`);

      // Group responses by questionId
      const questionCounts = {};
      assessment.responses.forEach((response) => {
        if (!questionCounts[response.questionId]) {
          questionCounts[response.questionId] = [];
        }
        questionCounts[response.questionId].push(response);
      });

      // Find duplicates
      const duplicates = Object.entries(questionCounts).filter(
        ([_, responses]) => responses.length > 1
      );

      if (duplicates.length > 0) {
        console.log(`❌ Found ${duplicates.length} duplicate questions:`);
        duplicates.forEach(([questionId, responses]) => {
          console.log(`   - Question ${questionId}: answered ${responses.length} times`);
          responses.forEach((r, index) => {
            console.log(`     ${index + 1}. ${r.questionText.substring(0, 50)}...`);
            console.log(`        Answer: ${r.responseValue} at ${r.answeredAt}`);
          });
        });
      } else {
        console.log(`✅ No duplicate responses found`);
      }

      // List all answered questions
      const answeredQuestions = assessment.responses.map((r) => r.questionId);
      console.log(`\nAnswered questions (in order): ${answeredQuestions.join(", ")}`);
    }
  } catch (error) {
    console.error("Error checking duplicates:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicateResponses();
