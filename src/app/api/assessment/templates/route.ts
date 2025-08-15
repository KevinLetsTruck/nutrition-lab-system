import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import {
  APIResponse,
  APIErrorResponse,
  PaginatedAPIResponse,
} from "@/types/api";
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
 * GET /api/assessment/templates - Get available assessment templates
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get("active");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Build query conditions
    const where = {
      ...(active !== null && { active: active === "true" }),
    };

    // Get total count
    const total = await prisma.assessmentTemplate.count({ where });

    // Get templates with pagination
    const templates = await prisma.assessmentTemplate.findMany({
      where,
      include: {
        categories: {
          orderBy: { order: "asc" },
        },
        questions: {
          orderBy: { id: "asc" },
        },
        scoringRules: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
    });

    const response: PaginatedAPIResponse<(typeof templates)[0]> = {
      success: true,
      data: templates,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch assessment templates:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assessment templates",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/assessment/templates - Create a new assessment template
 * Note: This would typically be restricted to admin users
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const body = await request.json();

    const { name, description, version, categories, questions, scoringRules } =
      body;

    // Validate required fields
    if (!name || !description || !version || !categories || !questions) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Missing required fields",
        details: {
          required: [
            "name",
            "description",
            "version",
            "categories",
            "questions",
          ],
        },
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Create template with all related data in a transaction
    const template = await prisma.$transaction(async (tx) => {
      // Create the template
      const newTemplate = await tx.assessmentTemplate.create({
        data: {
          name,
          description,
          version,
          active: true,
        },
      });

      // Create categories
      if (categories && categories.length > 0) {
        await tx.assessmentCategory.createMany({
          data: categories.map((cat: any) => ({
            ...cat,
            templateId: newTemplate.id,
          })),
        });
      }

      // Create questions
      if (questions && questions.length > 0) {
        await tx.assessmentQuestion.createMany({
          data: questions.map((q: any) => ({
            ...q,
            templateId: newTemplate.id,
            validationRules: q.validationRules || {},
            conditionalDisplay: q.conditionalDisplay || {},
            options: q.options || [],
            scaleConfig: q.scaleConfig || {},
          })),
        });
      }

      // Create scoring rules
      if (scoringRules && scoringRules.length > 0) {
        await tx.scoringRule.createMany({
          data: scoringRules.map((rule: any) => ({
            ...rule,
            templateId: newTemplate.id,
            questionIds: rule.questionIds || [],
            weights: rule.weights || {},
          })),
        });
      }

      // Return the complete template
      return await tx.assessmentTemplate.findUnique({
        where: { id: newTemplate.id },
        include: {
          categories: true,
          questions: true,
          scoringRules: true,
        },
      });
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: "CREATE",
        resource: "ASSESSMENT_TEMPLATE",
        resourceId: template!.id,
        success: true,
        details: {
          templateName: name,
          version,
          categoriesCount: categories.length,
          questionsCount: questions.length,
          rulesCount: scoringRules?.length || 0,
        },
      },
    });

    const response: APIResponse<typeof template> = {
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create assessment template:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create assessment template",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PATCH /api/assessment/templates - Update template active status
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = verifyAuthToken(request);
    const body = await request.json();
    const { templateId, active } = body;

    if (!templateId || active === undefined) {
      const errorResponse: APIErrorResponse = {
        success: false,
        error: "Template ID and active status are required",
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Update template
    const template = await prisma.assessmentTemplate.update({
      where: { id: templateId },
      data: { active },
      include: {
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        userEmail: user.email,
        action: "UPDATE",
        resource: "ASSESSMENT_TEMPLATE",
        resourceId: templateId,
        success: true,
        details: {
          active,
          templateName: template.name,
        },
      },
    });

    const response: APIResponse<typeof template> = {
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to update assessment template:", error);

    const errorResponse: APIErrorResponse = {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update assessment template",
      statusCode: 500,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
