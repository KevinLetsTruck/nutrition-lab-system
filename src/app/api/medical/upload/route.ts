// Medical Document Upload API Route
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
  let clientId: string | null = null;
  let documentId: string | null = null;

  try {
    // Authenticate user
    user = await verifyAuthToken(request);
    console.log("Authenticated user uploading medical document:", user.email);

    // Parse form data
    const formData = await request.formData();
    clientId = formData.get("clientId") as string;
    const documentType = formData.get("documentType") as string;
    const labSource = formData.get("labSource") as string | null;
    const file = formData.get("file") as File;

    if (!clientId || !documentType || !file) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: clientId, documentType, and file are mandatory.",
        },
        { status: 400 }
      );
    }

    // Validate file
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only PDF, JPEG, PNG, and TIFF files are allowed.",
        },
        { status: 400 }
      );
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "File size too large. Maximum size is 50MB.",
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

    // For now, we'll store a placeholder URL - you can integrate with S3/Cloudinary later
    const fileName = `${Date.now()}_${file.name}`;
    const fileUrl = `/uploads/medical/${fileName}`;

    // Create medical document record
    const document = await prisma.medicalDocument.create({
      data: {
        clientId,
        documentType,
        originalFileName: file.name,
        s3Url: fileUrl,
        s3Key: fileName,
        status: "PENDING",
        metadata: {
          fileSize: file.size,
          fileType: file.type,
          uploadedBy: user.email,
          labSource: labSource || undefined,
        },
      },
    });

    documentId = document.id;

    // Add to processing queue
    await prisma.medicalProcessingQueue.create({
      data: {
        documentId: document.id,
        jobType: "ocr",
        priority: 5,
        status: "QUEUED",
      },
    });

    // Log the upload
    console.log(`Medical document uploaded by ${user.email}: ${document.id}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          document: {
            id: document.id,
            originalFileName: document.originalFileName,
            documentType: document.documentType,
            status: document.status,
            uploadDate: document.uploadDate,
            s3Url: document.s3Url,
          },
        },
        message: "Medical document uploaded and queued for processing",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Medical document upload error:", error);

    // Log error
    if (user) {
      console.error(`Medical document upload failed for user ${user.email}: ${error instanceof Error ? error.message : "Unknown error"}`);
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
        error: "Medical document upload failed",
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

    const documents = await prisma.medicalDocument.findMany({
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

    const total = await prisma.medicalDocument.count({ where });

    // Log document list access
    console.log(`User ${user.email} accessed medical document list: ${documents.length} results`);

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
      message: "Medical documents retrieved successfully",
    });
  } catch (error) {
    console.error("Medical document list error:", error);

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
        error: "Failed to retrieve medical documents",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
