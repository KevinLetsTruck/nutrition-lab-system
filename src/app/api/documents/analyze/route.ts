// Medical Document Analysis API Route
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { queueManager } from "@/lib/queue/manager";
import jwt from "jsonwebtoken";

interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

async function verifyAuthToken(request: NextRequest): Promise<AuthPayload> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authentication Error: No valid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Authentication Error: Invalid or expired token");
  }
}

export async function POST(request: NextRequest) {
  let user: AuthPayload | null = null;
  let documentId: string | null = null;
  let clientId: string | null = null;

  try {
    user = await verifyAuthToken(request);

    const body = await request.json();
    documentId = body.documentId;
    const analysisType = body.analysisType || "FUNCTIONAL_MEDICINE";
    const analysisOptions = body.options || {};

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Document ID is required",
        },
        { status: 400 }
      );
    }

    // Validate analysis type
    const validAnalysisTypes = [
      "FUNCTIONAL_MEDICINE",
      "CONVENTIONAL_INTERPRETATION",
      "PATTERN_RECOGNITION",
      "TREND_ANALYSIS",
      "COMPARATIVE_ANALYSIS",
      "NUTRIENT_ANALYSIS",
      "TOXICITY_ANALYSIS",
      "HORMONE_ANALYSIS",
    ];

    if (!validAnalysisTypes.includes(analysisType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid analysis type",
          details: {
            provided: analysisType,
            valid: validAnalysisTypes,
          },
        },
        { status: 400 }
      );
    }

    // Get document with lab values
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        labValues: {
          select: {
            testName: true,
            testCode: true,
            category: true,
            value: true,
            numericValue: true,
            unit: true,
            conventionalLow: true,
            conventionalHigh: true,
            functionalLow: true,
            functionalHigh: true,
            flag: true,
            isOutOfRange: true,
            isCritical: true,
            severity: true,
            collectionDate: true,
            labName: true,
          },
        },
        documentAnalyses: {
          where: {
            analysisType: analysisType as any,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: "Document not found",
        },
        { status: 404 }
      );
    }

    clientId = document.clientId;

    // Check if document has been processed
    if (!document.extractedText && document.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "Document must be processed before analysis",
          details: {
            currentStatus: document.status,
            hasExtractedText: !!document.extractedText,
          },
        },
        { status: 409 }
      );
    }

    // Check if we have lab values to analyze
    if (document.labValues.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No lab values found for analysis",
          details: {
            documentStatus: document.status,
            hasExtractedText: !!document.extractedText,
          },
        },
        { status: 409 }
      );
    }

    // Check if analysis already exists and is recent
    const existingAnalysis = document.documentAnalyses[0];
    if (
      existingAnalysis &&
      existingAnalysis.status === "COMPLETED" &&
      !analysisOptions.forceReprocess
    ) {
      const hoursSinceAnalysis =
        (Date.now() - existingAnalysis.createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceAnalysis < 24) {
        // Return existing analysis if less than 24 hours old
        return NextResponse.json({
          success: true,
          data: {
            analysis: existingAnalysis,
            isExisting: true,
            createdHoursAgo: Math.round(hoursSinceAnalysis * 10) / 10,
          },
          message: "Recent analysis found. Use forceReprocess=true to create new analysis.",
        });
      }
    }

    // Create new analysis record
    const newAnalysis = await prisma.documentAnalysis.create({
      data: {
        documentId,
        clientId,
        analysisType: analysisType as any,
        status: "PENDING",
        provider: "CLAUDE",
        modelVersion: process.env.CLAUDE_MODEL_VERSION || "claude-3-sonnet",
      },
    });

    // Add analysis job to queue
    const analysisJob = await queueManager.addAnalysisJob(
      documentId,
      clientId,
      document.labValues,
      analysisType,
      {
        priority: analysisOptions.priority || 3,
        includeRecommendations: analysisOptions.includeRecommendations !== false,
        includeTrends: analysisOptions.includeTrends !== false,
        compareWithPrevious: analysisOptions.compareWithPrevious !== false,
        userId: user.id,
      }
    );

    // Get historical lab values for trend analysis if requested
    let historicalData = null;
    if (analysisOptions.compareWithPrevious || analysisType === "TREND_ANALYSIS") {
      historicalData = await prisma.labValue.findMany({
        where: {
          clientId,
          documentId: { not: documentId },
          testName: {
            in: document.labValues.map((lv) => lv.testName),
          },
        },
        orderBy: {
          collectionDate: "desc",
        },
        take: 100, // Limit to last 100 historical values
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "ANALYZE",
        resource: "DOCUMENT_ANALYSIS",
        resourceId: newAnalysis.id,
        clientId,
        success: true,
        details: {
          documentId,
          analysisType,
          analysisOptions,
          labValuesCount: document.labValues.length,
          historicalValuesCount: historicalData?.length || 0,
          jobId: analysisJob.id,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          analysisId: newAnalysis.id,
          documentId,
          analysisType,
          status: "Analysis queued",
          labValuesCount: document.labValues.length,
          historicalValuesCount: historicalData?.length || 0,
          estimatedCompletion: new Date(Date.now() + 2 * 60000), // 2 minutes estimate
          jobId: analysisJob.id,
        },
        message: "Document analysis successfully queued",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Document analysis error:", error);

    // Create error audit log
    if (user) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            action: "ANALYZE",
            resource: "DOCUMENT_ANALYSIS",
            resourceId: documentId,
            clientId,
            success: false,
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          },
        });
      } catch (auditError) {
        console.error("Failed to create audit log:", auditError);
      }
    }

    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          details: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Document analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    const clientId = searchParams.get("clientId");
    const analysisType = searchParams.get("analysisType");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (documentId) {
      where.documentId = documentId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (analysisType) {
      where.analysisType = analysisType;
    }

    if (status) {
      where.status = status;
    }

    const analyses = await prisma.documentAnalysis.findMany({
      where,
      include: {
        document: {
          select: {
            fileName: true,
            originalFileName: true,
            documentType: true,
            labType: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.documentAnalysis.count({ where });

    // Get analysis statistics
    const stats = await prisma.documentAnalysis.groupBy({
      by: ["status", "analysisType"],
      _count: true,
      where: clientId ? { clientId } : {},
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "READ",
        resource: "DOCUMENT_ANALYSIS",
        clientId,
        success: true,
        details: {
          query: { documentId, clientId, analysisType, status, limit, offset },
          resultCount: analyses.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        analyses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        statistics: {
          byStatus: stats.reduce((acc: any, stat) => {
            acc[stat.status] = (acc[stat.status] || 0) + stat._count;
            return acc;
          }, {}),
          byType: stats.reduce((acc: any, stat) => {
            acc[stat.analysisType] = (acc[stat.analysisType] || 0) + stat._count;
            return acc;
          }, {}),
        },
      },
      message: "Document analyses retrieved successfully",
    });
  } catch (error) {
    console.error("Document analyses retrieval error:", error);

    if (error instanceof Error && error.message.includes("Authentication")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed",
          details: error.message,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve document analyses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
