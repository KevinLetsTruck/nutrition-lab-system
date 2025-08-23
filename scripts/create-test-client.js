const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function createTestClient() {
  try {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = "testpass123";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create client record (clients authenticate directly, not through user table)
    const client = await prisma.client.create({
      data: {
        firstName: "Test",
        lastName: `User${timestamp}`,
        email,
        password: hashedPassword,
        phone: "555-0123",
        status: "active",
        emailVerified: true,
      },
    });

    console.log("✅ Created new test client:");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("🆔 Client ID:", client.id);
    console.log("👤 Name:", client.firstName, client.lastName);
    console.log("\n✨ You can now log in with these credentials!");
  } catch (error) {
    console.error("❌ Error creating test client:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestClient();
