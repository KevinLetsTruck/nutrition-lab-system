import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth-middleware";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Extract parameters
    const { id: assessmentId } = await context.params;
    const body = await req.json();
    const { questionId, value, questionType } = body;

    // Log incoming request
    console.log("Response save request:", {
      assessmentId,
      questionId,
      value: value,
      valueType: typeof value,
      questionType,
    });

    // Basic validation
    if (!assessmentId || !questionId || value === undefined || value === null) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["assessmentId", "questionId", "value"],
          received: { assessmentId, questionId, value },
        },
        { status: 400 }
      );
    }

    // Simple auth check - allow in dev mode for testing
    const authHeader = req.headers.get("authorization");
    if (!authHeader && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if this is a test assessment
    const isTestAssessment = assessmentId.startsWith("test-");

    // Get assessment with template
    let assessment;
    if (isTestAssessment) {
      // For test assessments, create a mock assessment object
      const template = await prisma.assessmentTemplate.findFirst({
        where: { id: "default" },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Default template not found" },
          { status: 404 }
        );
      }

      assessment = {
        id: assessmentId,
        clientId: "test-client",
        templateId: "default",
        template: template,
        status: "IN_PROGRESS",
        questionsAsked: 0,
        lastActiveAt: new Date(),
      };
    } else {
      assessment = await prisma.clientAssessment.findUnique({
        where: { id: assessmentId },
        include: {
          template: true,
        },
      });

      if (!assessment) {
        console.error("Assessment not found:", assessmentId);
        return NextResponse.json(
          { error: "Assessment not found", assessmentId },
          { status: 404 }
        );
      }
    }

    // Check if assessment is completed
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
      console.error("Question not found:", questionId);
      return NextResponse.json(
        {
          error: "Question not found",
          questionId,
          availableQuestions: questions.slice(0, 5).map((q) => q.id), // Show first 5 for debugging
        },
        { status: 404 }
      );
    }

    let savedResponse;

    if (isTestAssessment) {
      // For test assessments, just return a mock response without saving to DB
      console.log("Test assessment - simulating save without DB operation");
      savedResponse = {
        id: `test-response-${Date.now()}`,
        assessmentId,
        questionId,
        questionText: question.text || "Question text not found",
        questionModule: question.module || "UNKNOWN",
        responseType: questionType || question.type || "TEXT",
        responseValue: value,
        responseText: typeof value === "string" ? value : JSON.stringify(value),
        answeredAt: new Date(),
      };
      console.log("Mock response created:", savedResponse.id);
    } else {
      // Normal database operations for real assessments
      // Check if already answered
      const existingResponse = await prisma.clientResponse.findFirst({
        where: {
          assessmentId,
          questionId,
        },
      });

      if (existingResponse) {
        // Update existing response
        console.log("Updating existing response:", existingResponse.id);
        savedResponse = await prisma.clientResponse.update({
          where: { id: existingResponse.id },
          data: {
            responseValue: value,
            responseType: questionType || question.type || "TEXT",
            responseText:
              typeof value === "string" ? value : JSON.stringify(value),
            answeredAt: new Date(),
          },
        });
      } else {
        // Create new response
        console.log("Creating new response...");
        const responseData = {
          assessmentId,
          questionId,
          questionText: question.text || "Question text not found",
          questionModule: question.module || "UNKNOWN",
          responseType: questionType || question.type || "TEXT",
          responseValue: value,
          responseText:
            typeof value === "string" ? value : JSON.stringify(value),
        };

        console.log("Response data:", responseData);

        savedResponse = await prisma.clientResponse.create({
          data: responseData,
        });

        console.log("Response saved successfully:", savedResponse.id);

        // Update assessment progress
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
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: "Response saved successfully",
      data: {
        id: savedResponse.id,
        questionId: savedResponse.questionId,
        responseValue: savedResponse.responseValue,
      },
    });
  } catch (error: any) {
    console.error("CRITICAL ERROR in response saving:", error);
    console.error("Error stack:", error.stack);

    // Check for Prisma-specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate response detected",
          code: error.code,
        },
        { status: 409 }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found",
          code: error.code,
        },
        { status: 404 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save response",
        details: {
          message: error.message,
          code: error.code,
          meta: error.meta,
        },
      },
      { status: 500 }
    );
  }
}
