// Simple Document Upload API Route
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { medicalDocStorage } from "@/lib/medical/storage-service";

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
  let clientId: string | null = null;
  let documentId: string | null = null;

  try {
    // Authenticate user
    user = await verifyAuthToken(request);

    // Parse form data
    const formData = await request.formData();
    clientId = formData.get("clientId") as string;
    const documentType = formData.get("documentType") as string;
    const labType = formData.get("labType") as string | null;
    const file = formData.get("file") as File;

    if (!clientId || !documentType || !file) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: clientId, documentType, and file are mandatory.",
        },
        { status: 400 }
      );
    }

    // Basic file validation
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/tiff",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          details: "File size must be under 50MB",
        },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
          details: `Allowed types: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: "Client not found",
        },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate secure filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const secureFileName = `${timestamp}_${sanitizedFileName}`;

    // Upload to storage
    const uploadResult = await medicalDocStorage.uploadFile(
      fileBuffer,
      secureFileName,
      clientId,
      {
        contentType: file.type,
        documentType,
        metadata: {
          originalFileName: file.name,
          uploadedBy: user.email,
          labType: labType || undefined,
        },
      }
    );

    // Create document record
    const document = await prisma.document.create({
      data: {
        clientId,
        fileName: file.name,
        originalFileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: uploadResult.url,
        storageKey: uploadResult.key,
        storageProvider: "S3",
        documentType,
        labType: labType || null,
        analysisStatus: "PENDING",
        status: "UPLOADED",
        tags: [],
        metadata: {
          fileName: secureFileName,
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: user.email,
          labType: labType || undefined,
        },
      },
    });

    documentId = document.id;

    // Add OCR job to queue
    await prisma.processingJob.create({
      data: {
        documentId: document.id,
        jobType: "OCR_EXTRACTION",
        priority: 5,
        status: "PENDING",
      },
    });

    // Log the upload (simplified audit log can be added later if needed)

    return NextResponse.json(
      {
        success: true,
        data: {
          document: {
            id: document.id,
            originalFileName: document.originalFileName,
            fileName: document.fileName,
            documentType: document.documentType,
            status: document.status,
            analysisStatus: document.analysisStatus,
            uploadedAt: document.uploadedAt,
            fileUrl: document.fileUrl,
            storageKey: document.storageKey,
          },
          uploadResult,
        },
        message: "Document uploaded and queued for processing",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Document upload error:", error);

    // Log error (simplified error logging)
    if (user) {
      console.error(
        `Document upload failed for user ${user.email}: ${
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
        error: "Document upload failed",
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
    const documentType = searchParams.get("documentType");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (clientId) {
      where.clientId = clientId;
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (status) {
      where.status = status;
    }

    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        originalFileName: true,
        documentType: true,
        status: true,
        uploadDate: true,
        processedAt: true,
        clientId: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { uploadDate: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.document.count({ where });

    // Log document list access (simplified)

    return NextResponse.json({
      success: true,
      data: {
        documents,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      message: "Documents retrieved successfully",
    });
  } catch (error) {
    console.error("Document list error:", error);

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
        error: "Failed to retrieve documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
