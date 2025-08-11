// Medical Document Processing API Route
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
    console.log("Authenticated user triggering document processing:", user.email);

    const body = await request.json();
    documentId = body.documentId;
    const forceReprocess = body.forceReprocess || false;
    const processingOptions = body.options || {};

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Document ID is required",
        },
        { status: 400 }
      );
    }

    // Get document details
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
        processingJobs: {
          where: {
            status: { in: ["PENDING", "ACTIVE"] },
          },
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

    // Check if document is already being processed
    if (document.processingJobs.length > 0 && !forceReprocess) {
      return NextResponse.json(
        {
          success: false,
          error: "Document is already being processed",
          details: {
            activeJobs: document.processingJobs.length,
            currentStatus: document.status,
          },
        },
        { status: 409 }
      );
    }

    // Check document status
    if (document.status === "COMPLETED" && !forceReprocess) {
      return NextResponse.json(
        {
          success: false,
          error: "Document is already processed. Use forceReprocess=true to reprocess.",
          details: {
            currentStatus: document.status,
            processedAt: document.processedAt,
          },
        },
        { status: 409 }
      );
    }

    // Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "QUEUED",
        processingError: null, // Clear previous errors
      },
    });

    const jobs = [];

    // Add OCR job if needed
    if (
      !document.extractedText ||
      document.status === "FAILED" ||
      forceReprocess
    ) {
      const ocrJob = await queueManager.addOCRJob(
        documentId,
        clientId,
        document.fileUrl,
        document.fileName,
        document.fileType,
        {
          priority: processingOptions.priority || 5,
          ocrProvider: processingOptions.ocrProvider || "CLAUDE",
          language: processingOptions.language || "en",
          userId: user.id,
        }
      );
      jobs.push({
        type: "OCR_EXTRACTION",
        jobId: ocrJob.id,
        priority: processingOptions.priority || 5,
      });
    }

    // Add analysis job if we have extracted text or if forcing reprocess
    if (document.extractedText || forceReprocess) {
      // Get existing lab values for analysis
      const labValues = await prisma.labValue.findMany({
        where: { documentId },
        select: {
          testName: true,
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
          category: true,
        },
      });

      if (labValues.length > 0) {
        const analysisJob = await queueManager.addAnalysisJob(
          documentId,
          clientId,
          labValues,
          processingOptions.analysisType || "FUNCTIONAL_MEDICINE",
          {
            priority: processingOptions.priority || 5,
            includeRecommendations: processingOptions.includeRecommendations !== false,
            includeTrends: processingOptions.includeTrends !== false,
            compareWithPrevious: processingOptions.compareWithPrevious || false,
            userId: user.id,
          }
        );
        jobs.push({
          type: "FUNCTIONAL_ANALYSIS",
          jobId: analysisJob.id,
          priority: processingOptions.priority || 5,
        });
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "PROCESS",
        resource: "DOCUMENT",
        resourceId: documentId,
        clientId,
        success: true,
        details: {
          forceReprocess,
          processingOptions,
          jobsCreated: jobs.length,
          jobs,
        },
      },
    });

    console.log(`✅ Document processing initiated: ${documentId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          documentId,
          status: "Processing queued",
          jobs,
          estimatedCompletion: new Date(Date.now() + jobs.length * 60000), // Rough estimate
        },
        message: "Document processing successfully initiated",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Document processing error:", error);

    // Create error audit log
    if (user) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            action: "PROCESS",
            resource: "DOCUMENT",
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
        error: "Document processing failed",
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
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const jobType = searchParams.get("jobType");

    // Get processing queue status
    const where: any = {};

    if (clientId) {
      where.document = { clientId };
    }

    if (status) {
      where.status = status;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    const processingJobs = await prisma.processingJob.findMany({
      where,
      include: {
        document: {
          select: {
            id: true,
            fileName: true,
            originalFileName: true,
            documentType: true,
            status: true,
            clientId: true,
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
      orderBy: { scheduledAt: "desc" },
      take: 50,
    });

    // Get queue health
    const queueHealth = await queueManager.getAllQueuesHealth();

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "READ",
        resource: "PROCESSING_QUEUE",
        clientId,
        success: true,
        details: {
          query: { clientId, status, jobType },
          resultCount: processingJobs.length,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        processingJobs,
        queueHealth,
        summary: {
          total: processingJobs.length,
          pending: processingJobs.filter((job) => job.status === "PENDING").length,
          active: processingJobs.filter((job) => job.status === "ACTIVE").length,
          completed: processingJobs.filter((job) => job.status === "COMPLETED").length,
          failed: processingJobs.filter((job) => job.status === "FAILED").length,
        },
      },
      message: "Processing queue status retrieved successfully",
    });
  } catch (error) {
    console.error("Processing queue status error:", error);

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
        error: "Failed to retrieve processing queue status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
