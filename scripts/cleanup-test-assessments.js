// Clean up test assessments to allow fresh testing

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  console.log("🧹 Cleaning up test assessments...");

  try {
    // Find test client
    const testClient = await prisma.client.findFirst({
      where: { email: "test@example.com" },
    });

    if (testClient) {
      // Delete all responses for test client's assessments
      const assessments = await prisma.clientAssessment.findMany({
        where: { clientId: testClient.id },
      });

      for (const assessment of assessments) {
        await prisma.clientResponse.deleteMany({
          where: { assessmentId: assessment.id },
        });
      }

      // Delete all assessments for test client
      const deletedAssessments = await prisma.clientAssessment.deleteMany({
        where: { clientId: testClient.id },
      });

      console.log(`✅ Deleted ${deletedAssessments.count} test assessments`);
      console.log(`✅ Test client ready for fresh assessment`);
    } else {
      console.log("ℹ️  No test client found");
    }

    // Optional: Show current status
    const activeAssessments = await prisma.clientAssessment.count({
      where: { status: "IN_PROGRESS" },
    });

    console.log(`\n📊 Current status:`);
    console.log(`   Active assessments: ${activeAssessments}`);
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
