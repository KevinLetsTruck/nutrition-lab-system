import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CreateAssessmentSessionSchema } from "@/lib/assessment/types";
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
 * GET /api/assessment - Get assessment sessions for a client
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    if (!clientId) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Client ID is required",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get assessment sessions with related data
    const sessions = await prisma.assessmentSession.findMany({
      where: {
        clientId,
        ...(status && { status }),
      },
      include: {
        template: true,
        responses: true,
        scores: true,
        aiAnalysis: {
          include: {
            findings: true,
            recommendations: true,
            riskFactors: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const response: APIResponse<typeof sessions> = {
      success: true,
      data: sessions,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch assessment sessions:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assessment sessions",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/assessment - Create a new assessment session
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const body = await request.json();

    // Validate request body
    const validationResult = CreateAssessmentSessionSchema.safeParse(body);
    if (!validationResult.success) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Invalid request data",
        details: validationResult.error.errors,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { clientId, templateId } = validationResult.data;

    // Verify client exists and user has access
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Client not found",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify template exists and is active
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template || !template.active) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Assessment template not found or inactive",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Create new assessment session
    const session = await prisma.assessmentSession.create({
      data: {
        clientId,
        templateId,
        status: "draft",
        progress: 0,
        startedAt: new Date(),
        lastSavedAt: new Date(),
      },
      include: {
        template: true,
        responses: true,
        scores: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: "CREATE",
        resource: "ASSESSMENT",
        resourceId: session.id,
        clientId,
        success: true,
        details: {
          templateId,
          templateName: template.name,
        },
      },
    });

    const response: APIResponse<typeof session> = {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create assessment session:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create assessment session",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PATCH /api/assessment - Update assessment session status
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const body = await request.json();
    const { sessionId, status } = body;

    if (!sessionId || !status) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Session ID and status are required",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Verify session exists
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { client: true },
    });

    if (!session) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Assessment session not found",
        statusCode: 404,
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Update session status
    const updatedSession = await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status,
        ...(status === "completed" && { completedAt: new Date() }),
      },
      include: {
        template: true,
        responses: true,
        scores: true,
        aiAnalysis: true,
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
          previousStatus: session.status,
          newStatus: status,
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
    console.error("Failed to update assessment session:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update assessment session",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
