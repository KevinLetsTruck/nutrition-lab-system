#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupUsers() {
  console.log("🧹 Starting database cleanup...\n");

  try {
    // First, let's see what users we have
    console.log("📋 Current users in database:");
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    allUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
    });

    // Find the admin user to keep
    const adminUser = await prisma.user.findFirst({
      where: { email: "kevin@letstruck.com" },
    });

    if (!adminUser) {
      console.log("\n❌ Admin user kevin@letstruck.com not found!");
      console.log("   Please make sure this user exists before cleaning up.");
      return;
    }

    console.log(`\n✅ Found admin user: ${adminUser.email}`);

    // Get all users except the admin
    const usersToDelete = await prisma.user.findMany({
      where: {
        NOT: {
          email: "kevin@letstruck.com",
        },
      },
    });

    if (usersToDelete.length === 0) {
      console.log("\n✨ Database is already clean! Only admin user exists.");
      return;
    }

    console.log(`\n🗑️  Users to delete: ${usersToDelete.length}`);
    usersToDelete.forEach((user) => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    // Confirm deletion
    console.log(
      "\n⚠️  WARNING: This will delete all data associated with these users including:"
    );
    console.log("  - Client records");
    console.log("  - Assessments");
    console.log("  - Assessment responses");
    console.log("  - Documents");
    console.log("  - Notes");
    console.log("  - Protocols");

    // For safety, let's check if there are any assessments or important data
    const userEmails = usersToDelete.map((u) => u.email);

    const assessmentCount = await prisma.clientAssessment.count({
      where: {
        client: {
          email: {
            in: userEmails,
          },
        },
      },
    });

    const documentCount = await prisma.document.count({
      where: {
        client: {
          email: {
            in: userEmails,
          },
        },
      },
    });

    if (assessmentCount > 0 || documentCount > 0) {
      console.log(`\n📊 Data that will be deleted:`);
      console.log(`  - ${assessmentCount} assessments`);
      console.log(`  - ${documentCount} documents`);
    }

    // Proceed with deletion
    console.log("\n🔄 Starting deletion process...");

    // Delete in correct order due to foreign key constraints
    for (const user of usersToDelete) {
      console.log(`\n  Deleting user: ${user.email}`);

      // Check if there's a client record for this user
      const client = await prisma.client.findUnique({
        where: { email: user.email },
      });

      if (client) {
        // Delete related data for client users
        const clientId = client.id;

        // Delete assessment responses
        const responses = await prisma.clientResponse.deleteMany({
          where: { assessment: { clientId } },
        });
        console.log(`    - Deleted ${responses.count} assessment responses`);

        // Delete assessments
        const assessments = await prisma.clientAssessment.deleteMany({
          where: { clientId },
        });
        console.log(`    - Deleted ${assessments.count} assessments`);

        // Delete notes
        const notes = await prisma.note.deleteMany({
          where: { clientId },
        });
        console.log(`    - Deleted ${notes.count} notes`);

        // Delete documents
        const documents = await prisma.document.deleteMany({
          where: { clientId },
        });
        console.log(`    - Deleted ${documents.count} documents`);

        // Delete protocols
        const protocols = await prisma.protocol.deleteMany({
          where: { clientId },
        });
        console.log(`    - Deleted ${protocols.count} protocols`);

        // Delete the client record
        await prisma.client.delete({
          where: { id: clientId },
        });
        console.log(`    - Deleted client record`);
      }

      // Delete the user
      await prisma.user.delete({
        where: { id: user.id },
      });
      console.log(`    ✅ User deleted successfully`);
    }

    // Verify cleanup
    const remainingUsers = await prisma.user.count();
    console.log(
      `\n✅ Cleanup complete! ${remainingUsers} user(s) remaining in database.`
    );

    // Show final state
    const finalUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true,
      },
    });

    console.log("\n📋 Final users in database:");
    finalUsers.forEach((user) => {
      console.log(`  - ${user.email} (${user.role}) - ${user.name}`);
    });
  } catch (error) {
    console.error("\n❌ Error during cleanup:", error.message);
    console.error(
      "\n💡 If you see foreign key constraint errors, there may be additional related data."
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupUsers().catch(console.error);
