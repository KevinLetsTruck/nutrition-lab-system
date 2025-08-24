import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAllQuestions } from "@/lib/assessment/questions";

export async function POST(
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

    const body = await req.json();
    const { questionId, response } = body;

    // Get assessment and verify ownership
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment || assessment.clientId !== clientId) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.status === "COMPLETED") {
      return NextResponse.json(
        { success: false, error: "Assessment already completed" },
        { status: 400 }
      );
    }

    // Get question details
    const question = getAllQuestions().find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, error: "Invalid question" },
        { status: 400 }
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
          responseValue: response,
          responseText: String(response),
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
          responseType: question.type,
          responseValue: response,
          responseText: String(response),
          score: calculateScore(question.type, response),
          answeredAt: new Date(),
        },
      });

      // Update assessment stats
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          questionsAsked: { increment: 1 },
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
      { success: false, error: "Failed to save response" },
      { status: 500 }
    );
  }
}

function calculateScore(type: string, response: any): number {
  switch (type) {
    case "LIKERT_SCALE":
      // 1-5 scale where 1 is worst, 5 is best
      return 5 - (Number(response) || 3);
    case "YES_NO":
    case "YES_NO_UNSURE":
      // Assume "yes" to symptom questions is negative
      return response === "yes" ? 2 : 0;
    case "FREQUENCY":
      const freqMap: Record<string, number> = {
        never: 0,
        rarely: 1,
        sometimes: 2,
        often: 3,
        always: 4,
      };
      return freqMap[response] || 0;
    default:
      return 0;
  }
}
