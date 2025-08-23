const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const template = await prisma.assessmentTemplate.findFirst({
    where: { id: "default" },
  });

  const likertQuestions = template.questionBank
    .filter((q) => q.type === "LIKERT_SCALE")
    .slice(0, 5);

  console.log("Sample LIKERT_SCALE questions:");
  likertQuestions.forEach((q) => {
    console.log(`\nID: ${q.id}`);
    console.log(`Text: ${q.text}`);
    console.log("Options:", JSON.stringify(q.options, null, 2));
    console.log(`Scale Min: ${q.scaleMin}, Scale Max: ${q.scaleMax}`);
  });

  // Also check what actual responses look like
  const responses = await prisma.clientResponse.findMany({
    where: {
      questionId: "SCR017",
      responseType: "LIKERT_SCALE",
    },
    take: 3,
  });

  console.log("\n\nSample LIKERT_SCALE responses for SCR017:");
  responses.forEach((r) => {
    console.log(`Response Value:`, r.responseValue);
  });

  await prisma.$disconnect();
}

check().catch(console.error);
