// Medical Document Status API Route
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let user: AuthPayload | null = null;
  const documentId = params.id;
  let clientId: string | null = null;

  try {
    user = await verifyAuthToken(request);

    if (!documentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Document ID is required",
        },
        { status: 400 }
      );
    }

    // Get comprehensive document status
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        labValues: {
          select: {
            id: true,
            testName: true,
            value: true,
            valueText: true,
            unit: true,
            flag: true,
            collectionDate: true,
            labSource: true,
            confidence: true,
            referenceMin: true,
            referenceMax: true,
            functionalMin: true,
            functionalMax: true,
          },
          orderBy: {
            testName: "asc",
          },
        },
        analysis: {
          select: {
            id: true,
            patterns: true,
            rootCauses: true,
            criticalValues: true,
            functionalStatus: true,
            recommendations: true,
            createdAt: true,
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

    // Get processing jobs for this document
    const processingJobs = await prisma.medicalProcessingQueue.findMany({
      where: { documentId },
      select: {
        id: true,
        jobType: true,
        status: true,
        priority: true,
        attempts: true,
        maxAttempts: true,
        errorMessage: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate overall progress
    const calculateProgress = () => {
      const statusProgress: Record<string, number> = {
        PENDING: 10,
        PROCESSING: 50,
        COMPLETED: 100,
        FAILED: 0,
        REQUIRES_REVIEW: 90,
      };

      let progress = statusProgress[document.status] || 0;

      // Adjust based on active jobs
      const activeJobs = processingJobs.filter(
        (job) => job.status === "PROCESSING"
      );

      if (activeJobs.length > 0) {
        progress = Math.max(progress, 60); // If actively processing
      }

      return Math.min(100, Math.max(0, progress));
    };

    // Get current processing step
    const getCurrentStep = () => {
      const activeJobs = processingJobs.filter(
        (job) => job.status === "PROCESSING"
      );

      if (activeJobs.length > 0) {
        return activeJobs[0].jobType;
      }

      const pendingJobs = processingJobs.filter(
        (job) => job.status === "QUEUED"
      );

      if (pendingJobs.length > 0) {
        return `Queued: ${pendingJobs[0].jobType}`;
      }

      return document.status;
    };

    // Get processing summary
    const getProcessingSummary = () => {
      const jobs = processingJobs;
      return {
        total: jobs.length,
        pending: jobs.filter((job) => job.status === "QUEUED").length,
        active: jobs.filter((job) => job.status === "PROCESSING").length,
        completed: jobs.filter((job) => job.status === "COMPLETED").length,
        failed: jobs.filter((job) => job.status === "FAILED").length,
      };
    };

    // Get lab values summary
    const getLabValuesSummary = () => {
      const labValues = document.labValues;
      return {
        total: labValues.length,
        critical: labValues.filter((lv) => lv.flag === "critical").length,
        high: labValues.filter((lv) => lv.flag === "high").length,
        low: labValues.filter((lv) => lv.flag === "low").length,
        normal: labValues.filter((lv) => lv.flag === "normal" || !lv.flag).length,
        withFunctionalRanges: labValues.filter((lv) => lv.functionalMin && lv.functionalMax).length,
      };
    };

    const statusData = {
      document: {
        id: document.id,
        originalFileName: document.originalFileName,
        documentType: document.documentType,
        status: document.status,
        uploadDate: document.uploadDate,
        processedAt: document.processedAt,
        s3Url: document.s3Url,
        ocrConfidence: document.ocrConfidence,
        hasOcrText: !!document.ocrText,
      },
      client: document.client,
      progress: {
        percentage: calculateProgress(),
        currentStep: getCurrentStep(),
        estimatedCompletion: processingJobs.some(job => job.status === "QUEUED" || job.status === "PROCESSING") 
          ? new Date(Date.now() + 2 * 60000) // 2 minutes estimate
          : null,
      },
      processing: {
        summary: getProcessingSummary(),
        jobs: processingJobs,
      },
      labValues: {
        summary: getLabValuesSummary(),
        values: document.labValues,
      },
      analysis: document.analysis,
      timestamps: {
        uploadDate: document.uploadDate,
        processedAt: document.processedAt,
        lastUpdated: new Date(),
      },
    };

    return NextResponse.json({
      success: true,
      data: statusData,
      message: "Medical document status retrieved successfully",
    });
  } catch (error) {
    console.error("Medical document status error:", error);

    // Log error
    if (user) {
      console.error(`Medical document status failed for user ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        error: "Failed to retrieve medical document status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let user: AuthPayload | null = null;
  const documentId = params.id;
  let clientId: string | null = null;

  try {
    user = await verifyAuthToken(request);
    const body = await request.json();

    // Allow updating certain document properties
    const allowedUpdates = [
      "documentType",
      "status",
      "metadata",
    ];

    const updates: any = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedUpdates.includes(key)) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid updates provided",
          details: {
            allowedFields: allowedUpdates,
            provided: Object.keys(body),
          },
        },
        { status: 400 }
      );
    }

    // Get current document
    const currentDocument = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
      select: { clientId: true },
    });

    if (!currentDocument) {
      return NextResponse.json(
        {
          success: false,
          error: "Medical document not found",
        },
        { status: 404 }
      );
    }

    clientId = currentDocument.clientId;

    // Update document
    const updatedDocument = await prisma.medicalDocument.update({
      where: { id: documentId },
      data: updates,
      select: {
        id: true,
        originalFileName: true,
        documentType: true,
        status: true,
        metadata: true,
        uploadDate: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: "Medical document updated successfully",
    });
  } catch (error) {
    console.error("Medical document update error:", error);

    // Log error
    if (user) {
      console.error(`Medical document update failed for user ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        error: "Failed to update medical document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
