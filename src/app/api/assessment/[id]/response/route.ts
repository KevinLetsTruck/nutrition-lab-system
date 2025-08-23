import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authResult = await auth(req);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assessmentId } = await context.params;
    const { questionId, value, questionType } = await req.json();

    // Get assessment with template
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        template: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify user has access
    if (
      authResult.user.role === "CLIENT" &&
      authResult.user.clientId !== assessment.clientId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if assessment is already completed
    if (assessment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Assessment already completed" },
        { status: 400 }
      );
    }

    // Find the question in template
    const questions = assessment.template.questionBank as any[];
    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if already answered
    const existingResponse = await prisma.clientResponse.findFirst({
      where: {
        assessmentId,
        questionId,
      },
    });

    if (existingResponse) {
      // Update existing response
      await prisma.clientResponse.update({
        where: { id: existingResponse.id },
        data: {
          responseValue: value,
          responseType: questionType,
          answeredAt: new Date(),
        },
      });
    } else {
      // Create new response
      await prisma.clientResponse.create({
        data: {
          assessmentId,
          questionId,
          questionText: question.text,
          questionModule: question.module,
          responseType: questionType,
          responseValue: value,
          responseText: typeof value === "string" ? value : null,
        },
      });

      // Update questions asked count
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          questionsAsked: {
            increment: 1,
          },
          lastActiveAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Response saved successfully",
    });
  } catch (error) {
    console.error("Error saving response:", error);
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    );
  }
}
