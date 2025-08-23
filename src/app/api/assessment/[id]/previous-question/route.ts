import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";

export async function GET(
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

    // Get assessment with template and responses
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        template: true,
        responses: {
          orderBy: { answeredAt: "desc" },
          take: 2, // Get last 2 responses to find previous
        },
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

    // Get all questions from template
    const allQuestions = assessment.template.questionBank as any[];

    // Get all responses to count answered questions
    const allResponses = await prisma.clientResponse.findMany({
      where: { assessmentId },
      select: { questionId: true },
    });
    const answeredIds = new Set(allResponses.map((r) => r.questionId));

    // If no responses or only one response, can't go back
    if (assessment.responses.length < 2) {
      return NextResponse.json({
        success: false,
        message: "No previous question available",
        atStart: true,
      });
    }

    // Get the previous question ID (second to last response)
    const previousResponse = assessment.responses[1];
    const previousQuestion = allQuestions.find(
      (q) => q.id === previousResponse.questionId
    );

    if (!previousQuestion) {
      return NextResponse.json(
        { error: "Previous question not found in template" },
        { status: 404 }
      );
    }

    // Delete the last response to "undo" it
    await prisma.clientResponse.delete({
      where: { id: assessment.responses[0].id },
    });

    // Update the module if needed
    if (previousQuestion.module !== assessment.currentModule) {
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          currentModule: previousQuestion.module,
          lastActiveAt: new Date(),
        },
      });
    }

    // Return previous question with its saved answer
    return NextResponse.json({
      success: true,
      question: previousQuestion,
      previousAnswer: previousResponse.responseValue,
      questionsAsked: answeredIds.size - 1, // Subtract 1 since we deleted the last response
      totalQuestions: allQuestions.length,
      currentModule: previousQuestion.module,
    });
  } catch (error) {
    console.error("Error getting previous question:", error);
    return NextResponse.json(
      { error: "Failed to get previous question" },
      { status: 500 }
    );
  }
}
