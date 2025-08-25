import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    const { id: assessmentId } = await context.params;

    // Get assessment
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        client: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    if (user.role === "CLIENT" && user.clientId !== assessment.clientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if assessment is already completed
    if (assessment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        completed: true,
        message: "Assessment already completed",
      });
    }

    // Update last active timestamp
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        lastActiveAt: new Date(),
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Assessment resumed successfully",
      assessment: {
        id: assessment.id,
        status: "IN_PROGRESS",
        currentModule: assessment.currentModule,
        questionsAsked: assessment.questionsAsked,
      },
    });
  } catch (error) {
    console.error("Error resuming assessment:", error);
    return NextResponse.json(
      { error: "Failed to resume assessment" },
      { status: 500 }
    );
  }
}
