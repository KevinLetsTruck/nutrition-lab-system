import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await auth(req);
    
    if (!session?.authenticated || !session?.user?.userId || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    // Get all assessments with client info and analysis
    const assessments = await prisma.clientAssessment.findMany({
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        analysis: {
          select: {
            overallScore: true,
            aiSummary: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      assessments,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}
