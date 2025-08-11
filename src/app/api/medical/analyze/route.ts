// Medical Document Analysis API Route
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
    console.log("Authenticated user triggering medical document analysis:", user.email);

    const body = await request.json();
    documentId = body.documentId;
    const analysisType = body.analysisType || "functional_medicine";
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
      "functional_medicine",
      "conventional_interpretation",
      "pattern_recognition",
      "trend_analysis",
      "nutrient_analysis",
      "hormone_analysis",
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
    const document = await prisma.medicalDocument.findUnique({
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
            value: true,
            valueText: true,
            unit: true,
            referenceMin: true,
            referenceMax: true,
            functionalMin: true,
            functionalMax: true,
            flag: true,
            collectionDate: true,
            labSource: true,
            confidence: true,
          },
        },
        analysis: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: "Medical document not found",
        },
        { status: 404 }
      );
    }

    clientId = document.clientId;

    // Check if document has been processed
    if (!document.ocrText && document.status !== "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: "Medical document must be processed before analysis",
          details: {
            currentStatus: document.status,
            hasExtractedText: !!document.ocrText,
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
            hasExtractedText: !!document.ocrText,
          },
        },
        { status: 409 }
      );
    }

    // Check if analysis already exists and is recent
    if (
      document.analysis &&
      !analysisOptions.forceReprocess
    ) {
      const hoursSinceAnalysis =
        (Date.now() - document.analysis.createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceAnalysis < 24) {
        // Return existing analysis if less than 24 hours old
        return NextResponse.json({
          success: true,
          data: {
            analysis: document.analysis,
            isExisting: true,
            createdHoursAgo: Math.round(hoursSinceAnalysis * 10) / 10,
          },
          message: "Recent analysis found. Use forceReprocess=true to create new analysis.",
        });
      }
    }

    // Create or update analysis record
    const analysisData = {
      patterns: {
        type: analysisType,
        detectedPatterns: [],
        confidence: 0.85,
      },
      rootCauses: {
        identified: [],
        potential: [],
      },
      criticalValues: document.labValues.filter(lv => lv.flag === "critical" || lv.flag === "high"),
      functionalStatus: {
        assessment: "preliminary",
        systemsEvaluated: ["metabolic", "nutritional"],
      },
      recommendations: {
        immediate: [],
        longTerm: [],
        followUp: [],
      },
    };

    let analysis;
    if (document.analysis) {
      // Update existing analysis
      analysis = await prisma.medicalDocAnalysis.update({
        where: { id: document.analysis.id },
        data: {
          patterns: analysisData.patterns,
          rootCauses: analysisData.rootCauses,
          criticalValues: analysisData.criticalValues,
          functionalStatus: analysisData.functionalStatus,
          recommendations: analysisData.recommendations,
        },
      });
    } else {
      // Create new analysis
      analysis = await prisma.medicalDocAnalysis.create({
        data: {
          documentId,
          patterns: analysisData.patterns,
          rootCauses: analysisData.rootCauses,
          criticalValues: analysisData.criticalValues,
          functionalStatus: analysisData.functionalStatus,
          recommendations: analysisData.recommendations,
        },
      });
    }

    // Add analysis job to queue
    await prisma.medicalProcessingQueue.create({
      data: {
        documentId,
        jobType: "analysis",
        priority: analysisOptions.priority || 3,
        status: "QUEUED",
      },
    });

    // Get historical lab values for trend analysis if requested
    let historicalData = null;
    if (analysisOptions.compareWithPrevious || analysisType === "trend_analysis") {
      historicalData = await prisma.medicalLabValue.findMany({
        where: {
          document: {
            clientId,
            id: { not: documentId },
          },
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

    console.log(`Medical document analysis initiated: ${analysis.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          analysisId: analysis.id,
          documentId,
          analysisType,
          status: "Analysis queued",
          labValuesCount: document.labValues.length,
          historicalValuesCount: historicalData?.length || 0,
          estimatedCompletion: new Date(Date.now() + 2 * 60000), // 2 minutes estimate
        },
        message: "Medical document analysis successfully queued",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Medical document analysis error:", error);

    // Log error
    if (user) {
      console.error(`Medical document analysis failed for user ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        error: "Medical document analysis failed",
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (documentId) {
      where.documentId = documentId;
    }

    if (clientId) {
      where.document = { clientId };
    }

    const analyses = await prisma.medicalDocAnalysis.findMany({
      where,
      include: {
        document: {
          select: {
            originalFileName: true,
            documentType: true,
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

    const total = await prisma.medicalDocAnalysis.count({ where });

    console.log(`User ${user.email} accessed medical document analyses: ${analyses.length} results`);

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
      },
      message: "Medical document analyses retrieved successfully",
    });
  } catch (error) {
    console.error("Medical document analyses retrieval error:", error);

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
        error: "Failed to retrieve medical document analyses",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
