import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SIMPLE_QUESTIONS } from "@/lib/simple-assessment/questions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    const assessment = await prisma.simpleAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: { orderBy: { questionId: "asc" } },
        client: { select: { firstName: true, lastName: true } },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Get next question
    const nextQuestionId = assessment.responses.length + 1;
    const nextQuestion =
      nextQuestionId <= 80
        ? SIMPLE_QUESTIONS.find((q) => q.id === nextQuestionId)
        : null;

    return NextResponse.json({
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          status: assessment.status,
          startedAt: assessment.startedAt,
          completedAt: assessment.completedAt,
        },
        client: assessment.client,
        progress: {
          completed: assessment.responses.length,
          total: 80,
          percentage: Math.round((assessment.responses.length / 80) * 100),
        },
        nextQuestion,
        responses: assessment.responses,
      },
    });
  } catch (error) {
    console.error("Get assessment status error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get assessment status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
