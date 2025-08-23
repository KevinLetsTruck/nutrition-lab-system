#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupOrphanedClients() {
  console.log("🧹 Checking for orphaned client records...\n");

  try {
    // Get all clients
    const allClients = await prisma.client.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log(`📋 Found ${allClients.length} client records\n`);

    // Get all user emails
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
      },
    });

    const userEmails = allUsers.map((u) => u.email);

    // Find orphaned clients (clients without corresponding users)
    const orphanedClients = allClients.filter(
      (client) => !userEmails.includes(client.email)
    );

    if (orphanedClients.length === 0) {
      console.log("✨ No orphaned client records found! Database is clean.");
      return;
    }

    console.log(`🗑️  Found ${orphanedClients.length} orphaned client records:`);
    orphanedClients.forEach((client) => {
      console.log(
        `  - ${client.email} (${client.firstName} ${client.lastName})`
      );
    });

    console.log("\n🔄 Deleting orphaned client records...");

    for (const client of orphanedClients) {
      // Delete related data first
      const responses = await prisma.clientResponse.deleteMany({
        where: { assessment: { clientId: client.id } },
      });
      const assessments = await prisma.clientAssessment.deleteMany({
        where: { clientId: client.id },
      });
      const notes = await prisma.note.deleteMany({
        where: { clientId: client.id },
      });
      const documents = await prisma.document.deleteMany({
        where: { clientId: client.id },
      });
      const protocols = await prisma.protocol.deleteMany({
        where: { clientId: client.id },
      });

      // Delete the client record
      await prisma.client.delete({
        where: { id: client.id },
      });

      console.log(`  ✅ Deleted client: ${client.email}`);
    }

    console.log("\n✅ Cleanup complete!");
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupOrphanedClients().catch(console.error);
