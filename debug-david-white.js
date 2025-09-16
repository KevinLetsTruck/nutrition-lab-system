const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugDavidWhite() {
  try {
    console.log("🔍 Looking for David White...");

    // Find the specific client ID from the logs
    const clientId = "cmet6tzqg0002se0f6ufvbzm4";

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        healthGoals: true,
      },
    });

    if (!client) {
      console.log("❌ Client not found with ID:", clientId);
      return;
    }

    console.log("✅ Found client:", client.firstName, client.lastName);
    console.log("📋 Client ID:", client.id);

    if (!client.healthGoals) {
      console.log("❌ No healthGoals data");
      return;
    }

    console.log("🎯 HealthGoals structure:");
    console.log(JSON.stringify(client.healthGoals, null, 2));

    const healthGoals = client.healthGoals;

    if (healthGoals.claudeAnalysis) {
      console.log("\n🤖 Claude Analysis found!");
      console.log("📊 Claude Analysis structure:");
      console.log(JSON.stringify(healthGoals.claudeAnalysis, null, 2));

      if (healthGoals.claudeAnalysis.analysisData) {
        console.log("\n📋 Analysis Data:");
        const data = healthGoals.claudeAnalysis.analysisData;
        console.log("- Keys:", Object.keys(data));

        // Check for different field variations
        console.log("\n🔍 Checking for phases:");
        console.log("- protocolPhases:", !!data.protocolPhases);
        console.log("- phases:", !!data.phases);
        console.log("- protocol:", !!data.protocol);

        console.log("\n🔍 Checking for supplements:");
        console.log("- supplements:", !!data.supplements);
        console.log(
          "- supplementRecommendations:",
          !!data.supplementRecommendations
        );
        console.log("- recommendations:", !!data.recommendations);

        // Show actual field contents
        if (data.protocol) {
          console.log("\n📄 Protocol field content:");
          console.log(JSON.stringify(data.protocol, null, 2));
        }

        if (data.supplements) {
          console.log("\n💊 Supplements field content:");
          console.log(JSON.stringify(data.supplements, null, 2));
        }
      }
    } else {
      console.log("❌ No claudeAnalysis found");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugDavidWhite();
