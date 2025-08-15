import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";

export async function GET() {
  try {
    // Check if test user already exists
    let user = await prisma.user.findUnique({
      where: { email: "kevin@letstruck.com" },
    });

    if (!user) {
      // Create test user
      const hashedPassword = await hashPassword("1234567890");

      user = await prisma.user.create({
        data: {
          email: "kevin@letstruck.com",
          password: hashedPassword,
          name: "Kevin Test",
          role: "CLIENT",
        },
      });

      console.log("Created test user:", user.id);
    }

    // Check if client record exists
    let client = await prisma.client.findUnique({
      where: { email: user.email },
    });

    if (!client) {
      // Create client record
      client = await prisma.client.create({
        data: {
          firstName: "Kevin",
          lastName: "Test",
          email: "kevin@letstruck.com",
          status: "active", // lowercase per schema default
        },
      });

      console.log("Created client record:", client.id);
    }

    // Generate a valid JWT token
    const token = generateToken({
      userId: client.id, // Use client ID for assessment system
      email: user.email,
      role: user.role,
      clientId: client.id, // Also include clientId explicitly
    });

    return NextResponse.json({
      success: true,
      message: "Test user setup complete",
      data: {
        userId: user.id,
        clientId: client.id,
        email: user.email,
        token,
        instructions:
          "Use this token in the test page or copy it to localStorage",
      },
    });
  } catch (error) {
    console.error("Test setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup test user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
