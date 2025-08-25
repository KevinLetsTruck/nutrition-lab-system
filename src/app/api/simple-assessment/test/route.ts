import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    const clientCount = await prisma.client.count();
    const assessmentCount = await prisma.simpleAssessment.count();
    const responseCount = await prisma.simpleResponse.count();

    return NextResponse.json({
      success: true,
      data: {
        message: "Database connection working",
        counts: {
          clients: clientCount,
          assessments: assessmentCount,
          responses: responseCount,
        },
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
