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

    // Get assessment with template
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        template: true,
        responses: {
          select: { questionId: true },
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

    // Check if assessment is already completed
    if (assessment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        completed: true,
        message: "Assessment already completed",
      });
    }

    // Get all questions from template
    const allQuestions = assessment.template.questionBank as any[];

    // Get answered question IDs
    const answeredIds = new Set(assessment.responses.map((r) => r.questionId));

    // Find questions for current module
    const moduleQuestions = allQuestions.filter(
      (q) => q.module === assessment.currentModule
    );

    // Find unanswered questions in current module
    const unansweredInModule = moduleQuestions.filter(
      (q) => !answeredIds.has(q.id)
    );

    let nextQuestion = null;
    let nextModule = assessment.currentModule;

    if (unansweredInModule.length > 0) {
      // Still have questions in current module
      nextQuestion = unansweredInModule[0];
    } else {
      // Current module complete, find next module
      const modules = [
        "SCREENING",
        "ASSIMILATION",
        "TRANSPORT",
        "COMMUNICATION",
        "STRUCTURAL",
      ];
      const currentIndex = modules.indexOf(assessment.currentModule);

      // Find next module with unanswered questions
      for (let i = currentIndex + 1; i < modules.length; i++) {
        const moduleQuestions = allQuestions.filter(
          (q) => q.module === modules[i] && !answeredIds.has(q.id)
        );

        if (moduleQuestions.length > 0) {
          nextQuestion = moduleQuestions[0];
          nextModule = modules[i];
          break;
        }
      }
    }

    if (!nextQuestion) {
      // All questions answered, mark as complete
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          completionRate: 100,
        },
      });

      return NextResponse.json({
        success: true,
        completed: true,
        message: "Assessment completed successfully!",
      });
    }

    // Update current module if changed
    if (nextModule !== assessment.currentModule) {
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          currentModule: nextModule,
          lastActiveAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      question: nextQuestion,
      questionsAsked: answeredIds.size,
      totalQuestions: allQuestions.length,
      currentModule: nextModule,
    });
  } catch (error) {
    console.error("Error getting next question:", error);
    return NextResponse.json(
      { error: "Failed to get next question" },
      { status: 500 }
    );
  }
}
