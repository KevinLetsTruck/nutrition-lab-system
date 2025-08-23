const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function resetAssessment(clientEmail) {
  try {
    // Find the client
    const client = await prisma.client.findUnique({
      where: { email: clientEmail },
    });

    if (!client) {
      console.log(`❌ Client not found: ${clientEmail}`);
      return;
    }

    // Delete all assessments and responses for this client
    const deletedResponses = await prisma.clientResponse.deleteMany({
      where: {
        assessment: {
          clientId: client.id,
        },
      },
    });

    const deletedAssessments = await prisma.clientAssessment.deleteMany({
      where: {
        clientId: client.id,
      },
    });

    console.log(`✅ Reset assessment for ${clientEmail}:`);
    console.log(`   - Deleted ${deletedResponses.count} responses`);
    console.log(`   - Deleted ${deletedAssessments.count} assessments`);
    console.log(`\n✨ You can now start a fresh assessment!`);
  } catch (error) {
    console.error("❌ Error resetting assessment:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line or use default
const email = process.argv[2] || "kevin@letstruck.com";
resetAssessment(email);
