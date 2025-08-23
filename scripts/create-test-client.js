#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function createTestClient() {
  console.log("🔄 Creating test client account...\n");

  try {
    // Check if test client already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "testclient@example.com" },
    });

    if (existingUser) {
      console.log("⚠️  Test client already exists!");
      console.log("   Email: testclient@example.com");
      console.log("   Password: testpass123");
      return;
    }

    // Create user with CLIENT role
    const hashedPassword = await bcrypt.hash("testpass123", 10);
    const user = await prisma.user.create({
      data: {
        email: "testclient@example.com",
        password: hashedPassword,
        name: "Test Client",
        role: "CLIENT",
      },
    });

    // Create corresponding client record
    const client = await prisma.client.create({
      data: {
        email: "testclient@example.com",
        firstName: "Test",
        lastName: "Client",
        phone: "555-0123",
        status: "active",
        isTruckDriver: false,
      },
    });

    console.log("✅ Test client created successfully!");
    console.log("\n📋 Login credentials:");
    console.log("   Email: testclient@example.com");
    console.log("   Password: testpass123");
    console.log("\n🚀 You can now log in and access the assessment!");
  } catch (error) {
    console.error("❌ Error creating test client:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestClient().catch(console.error);
