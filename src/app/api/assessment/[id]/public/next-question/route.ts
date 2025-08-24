import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getNextQuestionWithAI } from "../../../../../../../lib/ai/assessment-ai";
import {
  allQuestions as getAllQuestions,
  getQuestionsByBodySystem,
} from "../../../../../../../lib/assessment/questions";
import { bodySystemOrder } from "../../../../../../../lib/assessment/body-systems";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await context.params;
    const clientId = req.headers.get("X-Client-ID");

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Client ID required" },
        { status: 400 }
      );
    }

    // Get assessment and verify it belongs to the client
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        client: true,
      },
    });

    if (!assessment || assessment.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        completed: true,
        message: "Assessment already completed",
      });
    }

    // Get all responses
    const allResponses = await prisma.clientResponse.findMany({
      where: { assessmentId },
      orderBy: { answeredAt: "desc" },
    });

    const answeredQuestionIds = new Set(allResponses.map((r) => r.questionId));

    // Try AI-powered question selection (if sufficient questions answered)
    if (allResponses.length >= 5) {
      try {
        const clientInfo = {
          age: assessment.client.dateOfBirth
            ? new Date().getFullYear() -
              new Date(assessment.client.dateOfBirth).getFullYear()
            : undefined,
          gender: assessment.client.gender,
        };

        const nextQuestion = await getNextQuestionWithAI({
          assessmentId,
          currentModule: assessment.currentModule,
          responses: allResponses,
          clientInfo,
          answeredQuestionIds: Array.from(answeredQuestionIds),
        });

        if (nextQuestion) {
          return NextResponse.json({
            success: true,
            question: nextQuestion,
            currentModule: assessment.currentModule,
            questionsAnswered: assessment.questionsAsked,
            progress: Math.round((assessment.questionsAsked / 50) * 100), // Estimate 50 questions total
          });
        }
      } catch (error) {
        console.error("AI selection failed, falling back:", error);
      }
    }

    // Fallback: Sequential selection
    const currentModuleIndex = bodySystemOrder.indexOf(
      assessment.currentModule
    );
    const moduleQuestions = getQuestionsByBodySystem(assessment.currentModule);

    // Filter questions
    const availableQuestions = moduleQuestions.filter((q) => {
      if (answeredQuestionIds.has(q.id)) return false;

      // Gender filtering
      if (q.genderSpecific && q.genderSpecific !== assessment.client.gender)
        return false;

      // Conditional logic
      for (const response of allResponses) {
        const answeredQuestion = getAllQuestions.find(
          (aq) => aq.id === response.questionId
        );
        if (answeredQuestion?.conditionalLogic) {
          const { condition, skipQuestions } =
            answeredQuestion.conditionalLogic;
          if (
            response.responseValue === condition &&
            skipQuestions.includes(q.id)
          ) {
            return false;
          }
        }
      }

      return true;
    });

    let nextQuestion = availableQuestions[0];

    // If no questions in current module, move to next
    if (!nextQuestion && currentModuleIndex < bodySystemOrder.length - 1) {
      const nextModule = bodySystemOrder[currentModuleIndex + 1];
      const nextModuleQuestions = getQuestionsByBodySystem(nextModule);

      nextQuestion = nextModuleQuestions.filter((q) => {
        if (answeredQuestionIds.has(q.id)) return false;
        if (q.genderSpecific && q.genderSpecific !== assessment.client.gender)
          return false;
        return true;
      })[0];

      if (nextQuestion) {
        // Update module
        await prisma.clientAssessment.update({
          where: { id: assessmentId },
          data: {
            currentModule: nextModule,
            lastActiveAt: new Date(),
          },
        });
      }
    }

    // If no more questions, complete assessment
    if (!nextQuestion) {
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
        message: "Assessment completed successfully",
      });
    }

    return NextResponse.json({
      success: true,
      question: nextQuestion,
      currentModule: assessment.currentModule,
      questionsAnswered: assessment.questionsAsked,
      progress: Math.round((assessment.questionsAsked / 50) * 100),
    });
  } catch (error) {
    console.error("Error fetching next question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch next question" },
      { status: 500 }
    );
  }
}
