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
    const document = await prisma.document.findUnique({
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
            testCode: true,
            category: true,
            value: true,
            numericValue: true,
            unit: true,
            flag: true,
            isOutOfRange: true,
            isCritical: true,
            severity: true,
            collectionDate: true,
            verified: true,
            verifiedAt: true,
            verifiedBy: true,
          },
          orderBy: {
            testName: "asc",
          },
        },
        documentAnalyses: {
          select: {
            id: true,
            analysisType: true,
            status: true,
            confidence: true,
            provider: true,
            modelVersion: true,
            patterns: true,
            findings: true,
            criticalValues: true,
            recommendations: true,
            insights: true,
            reviewRequired: true,
            reviewedAt: true,
            reviewedBy: true,
            approvedAt: true,
            approvedBy: true,
            createdAt: true,
            completedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        processingJobs: {
          select: {
            id: true,
            jobType: true,
            status: true,
            priority: true,
            progress: true,
            currentStep: true,
            attempts: true,
            maxAttempts: true,
            error: true,
            scheduledAt: true,
            startedAt: true,
            completedAt: true,
            failedAt: true,
            estimatedTime: true,
            actualTime: true,
          },
          orderBy: {
            scheduledAt: "desc",
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

    // Calculate overall progress
    const calculateProgress = () => {
      const statusProgress: Record<string, number> = {
        UPLOADED: 10,
        QUEUED: 20,
        PROCESSING: 30,
        OCR_COMPLETE: 50,
        EXTRACTION_COMPLETE: 70,
        ANALYSIS_COMPLETE: 90,
        COMPLETED: 100,
        FAILED: 0,
        ARCHIVED: 100,
      };

      let progress = statusProgress[document.status] || 0;

      // Adjust based on active jobs
      const activeJobs = document.processingJobs.filter(
        (job) => job.status === "ACTIVE"
      );
      const completedJobs = document.processingJobs.filter(
        (job) => job.status === "COMPLETED"
      );

      if (activeJobs.length > 0) {
        const avgJobProgress = activeJobs.reduce(
          (sum, job) => sum + (job.progress || 0),
          0
        ) / activeJobs.length;
        progress = Math.max(progress, avgJobProgress);
      }

      return Math.min(100, Math.max(0, progress));
    };

    // Get current processing step
    const getCurrentStep = () => {
      const activeJobs = document.processingJobs.filter(
        (job) => job.status === "ACTIVE"
      );

      if (activeJobs.length > 0) {
        return activeJobs[0].currentStep || activeJobs[0].jobType;
      }

      const pendingJobs = document.processingJobs.filter(
        (job) => job.status === "PENDING"
      );

      if (pendingJobs.length > 0) {
        return `Queued: ${pendingJobs[0].jobType}`;
      }

      return document.status;
    };

    // Calculate estimated completion
    const getEstimatedCompletion = () => {
      const pendingJobs = document.processingJobs.filter(
        (job) => job.status === "PENDING" || job.status === "ACTIVE"
      );

      if (pendingJobs.length === 0) {
        return null;
      }

      const totalEstimatedTime = pendingJobs.reduce(
        (sum, job) => sum + (job.estimatedTime || 60),
        0
      );

      return new Date(Date.now() + totalEstimatedTime * 1000);
    };

    // Get processing summary
    const getProcessingSummary = () => {
      const jobs = document.processingJobs;
      return {
        total: jobs.length,
        pending: jobs.filter((job) => job.status === "PENDING").length,
        active: jobs.filter((job) => job.status === "ACTIVE").length,
        completed: jobs.filter((job) => job.status === "COMPLETED").length,
        failed: jobs.filter((job) => job.status === "FAILED").length,
      };
    };

    // Get lab values summary
    const getLabValuesSummary = () => {
      const labValues = document.labValues;
      return {
        total: labValues.length,
        critical: labValues.filter((lv) => lv.isCritical).length,
        outOfRange: labValues.filter((lv) => lv.isOutOfRange).length,
        verified: labValues.filter((lv) => lv.verified).length,
        byCategory: labValues.reduce((acc: any, lv) => {
          acc[lv.category] = (acc[lv.category] || 0) + 1;
          return acc;
        }, {}),
        bySeverity: labValues.reduce((acc: any, lv) => {
          acc[lv.severity] = (acc[lv.severity] || 0) + 1;
          return acc;
        }, {}),
      };
    };

    // Get analysis summary
    const getAnalysisSummary = () => {
      const analyses = document.documentAnalyses;
      return {
        total: analyses.length,
        completed: analyses.filter((a) => a.status === "COMPLETED").length,
        pending: analyses.filter((a) => a.status === "PENDING").length,
        failed: analyses.filter((a) => a.status === "FAILED").length,
        requiresReview: analyses.filter((a) => a.reviewRequired).length,
        types: analyses.map((a) => a.analysisType),
        latestCompletion: analyses.find((a) => a.status === "COMPLETED")?.completedAt,
      };
    };

    const statusData = {
      document: {
        id: document.id,
        fileName: document.fileName,
        originalFileName: document.originalFileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        documentType: document.documentType,
        labType: document.labType,
        status: document.status,
        uploadedAt: document.uploadedAt,
        processedAt: document.processedAt,
        isEncrypted: document.isEncrypted,
        containsPHI: document.containsPHI,
      },
      client: document.client,
      progress: {
        percentage: calculateProgress(),
        currentStep: getCurrentStep(),
        estimatedCompletion: getEstimatedCompletion(),
      },
      processing: {
        summary: getProcessingSummary(),
        jobs: document.processingJobs,
      },
      labValues: {
        summary: getLabValuesSummary(),
        values: document.labValues,
      },
      analyses: {
        summary: getAnalysisSummary(),
        results: document.documentAnalyses,
      },
      timestamps: {
        uploadedAt: document.uploadedAt,
        processedAt: document.processedAt,
        lastUpdated: new Date(),
      },
    };

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "READ",
        resource: "DOCUMENT",
        resourceId: documentId,
        clientId,
        success: true,
        details: {
          statusRequested: true,
          currentStatus: document.status,
          progressPercentage: statusData.progress.percentage,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: statusData,
      message: "Document status retrieved successfully",
    });
  } catch (error) {
    console.error("Document status error:", error);

    // Create error audit log
    if (user) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            action: "READ",
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
        error: "Failed to retrieve document status",
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
      "labType",
      "containsPHI",
      "tags",
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
    const currentDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: { clientId: true },
    });

    if (!currentDocument) {
      return NextResponse.json(
        {
          success: false,
          error: "Document not found",
        },
        { status: 404 }
      );
    }

    clientId = currentDocument.clientId;

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: updates,
      select: {
        id: true,
        fileName: true,
        originalFileName: true,
        documentType: true,
        labType: true,
        containsPHI: true,
        tags: true,
        metadata: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        action: "UPDATE",
        resource: "DOCUMENT",
        resourceId: documentId,
        clientId,
        success: true,
        details: {
          updates,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("Document update error:", error);

    // Create error audit log
    if (user) {
      try {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            userEmail: user.email,
            action: "UPDATE",
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
        error: "Failed to update document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
