import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// TEST ENDPOINT - No authentication required
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    console.log(`TEST: Retrieving responses for assessment ${assessmentId}`);

    // Get assessment with responses
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
      },
      include: {
        responses: {
          orderBy: { answeredAt: "asc" },
        },
        template: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          error: "Assessment not found",
        },
        { status: 404 }
      );
    }

    // Get template question bank to calculate total questions
    const questionBank = assessment.template.questionBank as any[];
    const totalQuestions = Array.isArray(questionBank)
      ? questionBank.length
      : 0;

    // Calculate progress
    const questionsAnswered = assessment.responses.length;
    const percentComplete =
      totalQuestions > 0
        ? Math.round((questionsAnswered / totalQuestions) * 100)
        : 0;

    // Group responses by module
    const responsesByModule = assessment.responses.reduce((acc, response) => {
      const module = response.questionModule;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(response);
      return acc;
    }, {} as Record<string, typeof assessment.responses>);

    console.log(
      `TEST: Found ${questionsAnswered} responses across ${
        Object.keys(responsesByModule).length
      } modules`
    );

    return NextResponse.json({
      success: true,
      data: {
        assessmentId: assessment.id,
        status: assessment.status,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
        responses: assessment.responses.map((response) => ({
          id: response.id,
          questionId: response.questionId,
          questionText: response.questionText,
          questionModule: response.questionModule,
          responseType: response.responseType,
          responseValue: response.responseValue,
          responseText: response.responseText,
          answeredAt: response.answeredAt,
        })),
        responsesByModule: Object.entries(responsesByModule).reduce(
          (acc, [module, responses]) => ({
            ...acc,
            [module]: {
              count: responses.length,
              responses: responses.map((r) => ({
                questionId: r.questionId,
                responseValue: r.responseValue,
              })),
            },
          }),
          {}
        ),
        progress: {
          questionsAnswered,
          totalQuestions,
          currentModule: assessment.currentModule,
          percentComplete,
          questionsAsked: assessment.questionsAsked,
          questionsSaved: assessment.questionsSaved,
        },
      },
    });
  } catch (error) {
    console.error("TEST: Error retrieving responses:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve responses",
        details:
          process.env.NODE_ENV === "development"
            ? {
                message: error instanceof Error ? error.message : undefined,
                stack: error instanceof Error ? error.stack : undefined,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
