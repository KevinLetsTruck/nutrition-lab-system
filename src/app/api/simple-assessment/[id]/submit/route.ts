import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { SIMPLE_QUESTIONS } from "@/lib/simple-assessment/questions";

interface SubmitRequestBody {
  questionId: number;
  score: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get assessmentId from URL params
    const { id: assessmentId } = await params;

    // Parse and validate request body
    const body = (await req.json()) as SubmitRequestBody;
    const { questionId, score } = body;

    // Validate required fields
    if (questionId === undefined || score === undefined) {
      return NextResponse.json(
        { success: false, error: "Question ID and score are required" },
        { status: 400 }
      );
    }

    // Ensure numeric types
    const numQuestionId = Number(questionId);
    const numScore = Number(score);

    // Validate questionId range (1-80)
    if (
      !Number.isInteger(numQuestionId) ||
      numQuestionId < 1 ||
      numQuestionId > 80
    ) {
      return NextResponse.json(
        { success: false, error: "Question ID must be between 1 and 80" },
        { status: 400 }
      );
    }

    // Validate score range (1-5)
    if (!Number.isInteger(numScore) || numScore < 1 || numScore > 5) {
      return NextResponse.json(
        { success: false, error: "Score must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get assessment with client info
    const assessment = await prisma.simpleAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: {
          orderBy: { questionId: "asc" },
        },
        client: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify assessment is not already completed
    if (assessment.status === "completed") {
      return NextResponse.json(
        { success: false, error: "Assessment is already completed" },
        { status: 400 }
      );
    }

    // Find the question from our question bank
    const question = SIMPLE_QUESTIONS.find((q) => q.id === numQuestionId);
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Invalid question ID" },
        { status: 400 }
      );
    }

    // Save/update response (upsert for handling duplicate submissions)
    await prisma.simpleResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId: numQuestionId,
        },
      },
      update: {
        score: numScore,
        answeredAt: new Date(),
      },
      create: {
        assessmentId,
        questionId: numQuestionId,
        questionText: question.text,
        category: question.category,
        score: numScore,
      },
    });

    // Get all responses to check if assessment is complete
    const allResponses = await prisma.simpleResponse.findMany({
      where: { assessmentId },
      orderBy: { questionId: "asc" },
    });

    const isComplete = allResponses.length >= 80;

    // Update assessment status if complete
    let updatedAssessment = assessment;
    if (isComplete && assessment.status !== "completed") {
      updatedAssessment = await prisma.simpleAssessment.update({
        where: { id: assessmentId },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
        include: {
          responses: {
            orderBy: { questionId: "asc" },
          },
        },
      });
    }

    // Return updated assessment with all responses
    return NextResponse.json({
      success: true,
      assessment: {
        id: updatedAssessment.id,
        status: isComplete ? "completed" : updatedAssessment.status,
        responses: allResponses,
      },
    });
  } catch (error) {
    console.error("Submit response error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to save response",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
