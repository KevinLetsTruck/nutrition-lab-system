import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth-helpers";

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const session = await auth(req);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Unauthorized",
          },
        },
        { status: 401 }
      );
    }

    const { id: assessmentId } = await params;

    // Get assessment with responses
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        clientId: session.user.id,
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
          error: {
            code: "ASSESSMENT_NOT_FOUND",
            message: "Assessment not found",
          },
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

    // Prepare response data
    const responseData: APIResponse<any> = {
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
          aiReasoning: response.aiReasoning,
          confidenceScore: response.confidenceScore,
          clinicalFlags: response.clinicalFlags,
        })),
        responsesByModule,
        progress: {
          questionsAnswered,
          totalQuestions,
          currentModule: assessment.currentModule,
          percentComplete,
          questionsAsked: assessment.questionsAsked,
          questionsSaved: assessment.questionsSaved,
        },
        metadata: {
          templateId: assessment.templateId,
          templateName: assessment.template.name,
          templateVersion: assessment.template.version,
        },
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error retrieving assessment responses:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to retrieve assessment responses",
          details:
            process.env.NODE_ENV === "development"
              ? {
                  message:
                    error instanceof Error ? error.message : "Unknown error",
                  stack: error instanceof Error ? error.stack : undefined,
                }
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}
