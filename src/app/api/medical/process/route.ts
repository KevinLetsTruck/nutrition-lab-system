// Medical Document Processing API Route
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

    // Check if document is already being processed
    const existingJobs = await prisma.medicalProcessingQueue.findMany({
      where: {
        documentId: document.id,
        status: { in: ["QUEUED", "PROCESSING"] },
      },
    });

    if (existingJobs.length > 0 && !forceReprocess) {
      return NextResponse.json(
        {
          success: false,
          error: "Medical document is already being processed",
          details: {
            activeJobs: existingJobs.length,
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
          error:
            "Medical document is already processed. Use forceReprocess=true to reprocess.",
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
        status: "PROCESSING",
        processingError: null, // Clear previous errors
      },
    });

    const jobs = [];

    // Add OCR job if needed
    if (!document.ocrText || document.status === "FAILED" || forceReprocess) {
      const ocrJob = await prisma.medicalProcessingQueue.create({
        data: {
          documentId,
          jobType: "ocr",
          priority: processingOptions.priority || 5,
          status: "QUEUED",
        },
      });
      jobs.push({
        type: "OCR_EXTRACTION",
        jobId: ocrJob.id,
        priority: processingOptions.priority || 5,
      });
    }

    // Add analysis job if we have extracted text
    if (document.ocrText || forceReprocess) {
      // Get existing lab values for analysis
      const labValues = await prisma.medicalLabValue.findMany({
        where: { documentId },
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
        },
      });

      if (labValues.length > 0) {
        const analysisJob = await prisma.medicalProcessingQueue.create({
          data: {
            documentId,
            jobType: "analysis",
            priority: processingOptions.priority || 5,
            status: "QUEUED",
          },
        });
        jobs.push({
          type: "FUNCTIONAL_ANALYSIS",
          jobId: analysisJob.id,
          priority: processingOptions.priority || 5,
        });
      }
    }

    // Log processing initiation

    return NextResponse.json(
      {
        success: true,
        data: {
          documentId,
          status: "Processing queued",
          jobs,
          estimatedCompletion: new Date(Date.now() + jobs.length * 60000), // Rough estimate
        },
        message: "Medical document processing successfully initiated",
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Medical document processing error:", error);

    // Log error
    if (user) {
      console.error(
        `Medical document processing failed for user ${user.email}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
        error: "Medical document processing failed",
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

    if (status) {
      where.status = status;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    // If clientId is provided, filter by documents belonging to that client
    if (clientId) {
      const clientDocuments = await prisma.document.findMany({
        where: { clientId },
        select: { id: true },
      });
      where.documentId = {
        in: clientDocuments.map((doc) => doc.id),
      };
    }

    const processingJobs = await prisma.medicalProcessingQueue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get queue summary
    const queueSummary = {
      total: processingJobs.length,
      pending: processingJobs.filter((job) => job.status === "QUEUED").length,
      active: processingJobs.filter((job) => job.status === "PROCESSING")
        .length,
      completed: processingJobs.filter((job) => job.status === "COMPLETED")
        .length,
      failed: processingJobs.filter((job) => job.status === "FAILED").length,
    };

    return NextResponse.json({
      success: true,
      data: {
        processingJobs,
        summary: queueSummary,
      },
      message: "Medical processing queue status retrieved successfully",
    });
  } catch (error) {
    console.error("Medical processing queue status error:", error);

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
        error: "Failed to retrieve medical processing queue status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
