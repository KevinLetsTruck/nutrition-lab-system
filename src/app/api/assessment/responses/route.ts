import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { UpdateAssessmentResponseSchema } from "@/lib/assessment/types";
import { APIResponse, APIErrorResponse } from "@/types/api";
import jwt from "jsonwebtoken";

/**
 * Verify authentication token
 */
function verifyAuthToken(request: NextRequest): {
  userId: string;
  email: string;
} {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return { userId: payload.id, email: payload.email };
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * POST /api/assessment/responses - Save assessment responses (auto-save)
 * Implements immutable response storage - each save creates new records
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const body = await request.json();

    // Validate request body
    const validationResult = UpdateAssessmentResponseSchema.safeParse(body);
    if (!validationResult.success) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Invalid request data",
        details: validationResult.error.errors,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { sessionId, responses } = validationResult.data;

    // Verify session exists and is not completed
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: {
        client: true,
        template: {
          include: {
            questions: true,
          },
        },
        responses: true,
      },
    });

    if (!session) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Assessment session not found",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (session.status === "completed") {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Cannot modify a completed assessment",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate that all question IDs exist in the template
    const templateQuestionIds = session.template.questions.map((q) => q.id);
    const invalidQuestions = responses.filter(
      (r) => !templateQuestionIds.includes(r.questionId)
    );

    if (invalidQuestions.length > 0) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Invalid question IDs provided",
        details: {
          invalidQuestionIds: invalidQuestions.map((r) => r.questionId),
        },
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create immutable response records
    const createdResponses = await prisma.$transaction(
      responses.map((response) =>
        prisma.assessmentResponse.create({
          data: {
            sessionId,
            questionId: response.questionId,
            value: response.value,
            confidence: response.confidence,
            source: response.source || "manual",
            metadata: response.metadata || {},
            timestamp: new Date(),
          },
        })
      )
    );

    // Calculate progress
    const answeredQuestions = new Set(
      session.responses.concat(createdResponses).map((r) => r.questionId)
    );
    const progress = Math.round(
      (answeredQuestions.size / templateQuestionIds.length) * 100
    );

    // Update session
    const updatedSession = await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: progress > 0 ? "in_progress" : "draft",
        progress,
        lastSavedAt: new Date(),
      },
      include: {
        template: true,
        responses: {
          orderBy: { timestamp: "desc" },
          distinct: ["questionId"], // Get latest response for each question
        },
        scores: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: "UPDATE",
        resource: "ASSESSMENT",
        resourceId: sessionId,
        clientId: session.clientId,
        success: true,
        details: {
          responsesUpdated: responses.length,
          progress,
          autoSave: true,
        },
      },
    });

    const response: APIResponse<typeof updatedSession> = {
      success: true,
      data: updatedSession,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to save assessment responses:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save assessment responses",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * GET /api/assessment/responses - Get responses for a session
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Session ID is required",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Assessment session not found",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Get latest response for each question
    const latestResponses = await prisma.assessmentResponse.findMany({
      where: { sessionId },
      orderBy: { timestamp: "desc" },
      distinct: ["questionId"],
    });

    const response: APIResponse<typeof latestResponses> = {
      success: true,
      data: latestResponses,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch assessment responses:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assessment responses",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
