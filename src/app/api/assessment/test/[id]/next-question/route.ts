import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// TEST ENDPOINT - No authentication required
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await context.params;

    console.log(`TEST: Getting next question for assessment ${assessmentId}`);

    // Get assessment with responses
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        status: "IN_PROGRESS",
      },
      include: {
        responses: {
          select: { questionId: true },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found or not in progress" },
        { status: 404 }
      );
    }

    // Get answered question IDs
    const answeredIds = new Set(assessment.responses.map((r) => r.questionId));
    console.log(`TEST: ${answeredIds.size} questions already answered`);

    // Get the template
    const template = await prisma.assessmentTemplate.findFirst({
      where: { id: "default" },
    });

    if (!template) {
      console.error("TEST: Default template not found");
      return NextResponse.json(
        { success: false, error: "Default template not found" },
        { status: 404 }
      );
    }

    // Get questions from template's questionBank
    const questionBank = template.questionBank as any[];
    if (!questionBank || !Array.isArray(questionBank)) {
      console.error("TEST: Template questionBank is not an array");
      return NextResponse.json(
        {
          success: false,
          error: "Template questionBank is not properly formatted",
        },
        { status: 500 }
      );
    }

    // Get questions for current module that haven't been answered
    const moduleQuestions = questionBank.filter(
      (q: any) =>
        q.module === assessment.currentModule && !answeredIds.has(q.id)
    );

    console.log(
      `TEST: ${moduleQuestions.length} unanswered questions in module ${assessment.currentModule}`
    );

    // Get the first unanswered question
    let nextQuestion = moduleQuestions[0] || null;

    // If no more questions in current module, move to next module
    if (!nextQuestion) {
      console.log(
        `TEST: No more questions in ${assessment.currentModule}, checking next module`
      );

      const modules = [
        "SCREENING",
        "ASSIMILATION",
        "DEFENSE_REPAIR",
        "ENERGY",
        "BIOTRANSFORMATION",
        "TRANSPORT",
        "COMMUNICATION",
        "STRUCTURAL",
      ];
      const currentIndex = modules.indexOf(assessment.currentModule);

      if (currentIndex < modules.length - 1) {
        const nextModule = modules[currentIndex + 1];
        console.log(`TEST: Moving to module ${nextModule}`);

        // Update assessment module
        await prisma.clientAssessment.update({
          where: { id: assessmentId },
          data: { currentModule: nextModule },
        });

        // Get first question from new module
        const nextModuleQuestions = questionBank.filter(
          (q: any) => q.module === nextModule && !answeredIds.has(q.id)
        );
        nextQuestion = nextModuleQuestions[0] || null;
      }
    }

    // Check if assessment is complete
    if (!nextQuestion) {
      console.log(
        `TEST: Assessment complete! Total questions answered: ${answeredIds.size}`
      );

      // Mark assessment as complete
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
        data: {
          complete: true,
          totalQuestionsAnswered: answeredIds.size,
          message: "Assessment completed successfully!",
        },
      });
    }

    console.log(
      `TEST: Next question: ${nextQuestion.id} - ${nextQuestion.text.substring(
        0,
        50
      )}...`
    );

    return NextResponse.json({
      success: true,
      data: {
        question: nextQuestion,
        module: assessment.currentModule,
        questionsAnswered: answeredIds.size,
        estimatedProgress: Math.round((answeredIds.size / 200) * 100), // Estimate 200 questions total
      },
    });
  } catch (error) {
    console.error("TEST: Next question error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to get next question",
      },
      { status: 500 }
    );
  }
}
