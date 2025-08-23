import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// TEST ENDPOINT - No authentication required
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log("TEST: Response endpoint called");

  try {
    const { id: assessmentId } = await context.params;
    console.log("TEST: Assessment ID:", assessmentId);

    const body = await req.json();
    console.log("TEST: Request body:", JSON.stringify(body, null, 2));
    const { questionId, response } = body;

    console.log(`TEST: Submitting response for assessment ${assessmentId}`);
    console.log(`Question: ${questionId}, Response:`, response);

    // Verify assessment exists and is in progress
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        status: "IN_PROGRESS",
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found or not in progress" },
        { status: 404 }
      );
    }

    // Get the question from the template's questionBank
    console.log("TEST: Looking for question with ID:", questionId);

    // First try to get the active template
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

    // Find the specific question
    const questionData = questionBank.find((q: any) => q.id === questionId);

    if (!questionData) {
      console.error("TEST: Question not found in questionBank:", questionId);

      // Log available questions for debugging
      const sampleQuestions = questionBank.slice(0, 10).map((q: any) => q.id);
      console.log("TEST: Sample available question IDs:", sampleQuestions);
      console.log("TEST: Total questions in bank:", questionBank.length);

      return NextResponse.json(
        { success: false, error: `Question not found: ${questionId}` },
        { status: 404 }
      );
    }

    console.log("TEST: Found question:", questionData.id, questionData.text);

    // Save the response
    console.log("TEST: Attempting to save response...");
    console.log("TEST: Response data:", {
      assessmentId,
      questionId,
      questionText: questionData.text,
      questionModule: questionData.module,
      responseType: response.type || questionData.type,
      responseValue: response.value,
      responseText: response.text,
    });

    let savedResponse;
    try {
      savedResponse = await prisma.clientResponse.create({
        data: {
          assessmentId,
          questionId,
          questionText: questionData.text,
          questionModule: questionData.module,
          responseType: response.type || questionData.type,
          responseValue: response.value,
          responseText: response.text || null,
          answeredAt: new Date(),
        },
      });
      console.log("TEST: Response saved successfully:", savedResponse.id);
    } catch (dbError) {
      console.error("TEST: Database error:", dbError);
      console.error("TEST: Database error details:", {
        message: dbError instanceof Error ? dbError.message : "Unknown error",
        stack: dbError instanceof Error ? dbError.stack : undefined,
      });
      throw dbError;
    }

    // Update assessment progress
    const updatedAssessment = await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        questionsAsked: { increment: 1 },
        lastActiveAt: new Date(),
        completionRate: Math.min(
          ((assessment.questionsAsked + 1) / 200) * 100,
          100
        ), // Estimate 200 questions total
      },
    });

    console.log(
      `TEST: Response saved. Total questions answered: ${updatedAssessment.questionsAsked}`
    );

    return NextResponse.json({
      success: true,
      data: {
        responseId: savedResponse.id,
        questionsAnswered: updatedAssessment.questionsAsked,
        completionRate: updatedAssessment.completionRate,
      },
    });
  } catch (error) {
    console.error("TEST: Response submission error:", error);
    console.error("TEST: Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to submit response",
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
