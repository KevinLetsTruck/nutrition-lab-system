const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkClientGender() {
  try {
    // Get all clients
    const clients = await prisma.client.findMany();

    console.log("Checking client genders and menstrual question responses:\n");

    for (const client of clients) {
      console.log(`Client: ${client.email} (${client.firstName} ${client.lastName})`);
      console.log(`Gender: ${client.gender || "NOT SET"}`);
      
      // Get assessments for this client
      const assessments = await prisma.clientAssessment.findMany({
        where: { clientId: client.id },
        include: {
          responses: {
            where: {
              questionId: "SCR049" // The menstrual question
            }
          }
        }
      });
      
      if (assessments.length > 0) {
        for (const assessment of assessments) {
          console.log(`Assessment ID: ${assessment.id}`);
          
          if (assessment.responses.length > 0 && client.gender === "male") {
            console.log(`❌ WARNING: Male client answered menstrual question!`);
            console.log(`Response: ${JSON.stringify(assessment.responses[0].responseValue)}`);
          } else if (assessment.responses.length === 0 && client.gender === "male") {
            console.log(`✅ Male client correctly skipped menstrual question`);
          } else if (assessment.responses.length > 0 && client.gender === "female") {
            console.log(`✅ Female client answered menstrual question`);
          }
        }
      } else {
        console.log("No assessments found");
      }
      console.log("---");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClientGender();
