const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getTestClient() {
  console.log("🔍 Finding or creating a test client...\n");

  try {
    // Try to find existing test client
    let testClient = await prisma.client.findFirst({
      where: { email: "test@example.com" },
    });

    if (!testClient) {
      console.log("Creating new test client...");
      testClient = await prisma.client.create({
        data: {
          email: "test@example.com",
          firstName: "Test",
          lastName: "User",
          isTruckDriver: true,
          gender: "male",
        },
      });
      console.log("✅ Test client created");
    } else {
      console.log("✅ Found existing test client");
    }

    console.log("\n📋 Test Client Details:");
    console.log(`   ID: ${testClient.id}`);
    console.log(`   Name: ${testClient.firstName} ${testClient.lastName}`);
    console.log(`   Email: ${testClient.email}`);

    console.log("\n💡 Use this client ID for testing:");
    console.log(`   ${testClient.id}`);

    return testClient.id;
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getTestClient();
