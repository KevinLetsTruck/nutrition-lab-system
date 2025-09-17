import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    // Simplified auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const documents = await prisma.document.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(status && { analysisStatus: status }),
      },
      include: {
        Client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simplified auth check - for now, just check if header exists
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorResponse = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    const formData = await request.formData();
    const clientId = formData.get("clientId") as string;
    let documentType = formData.get("documentType") as string;
    const labType = formData.get("labType") as string;
    const file = formData.get("file") as File;

    // Map frontend document types to valid enum values
    const documentTypeMap: Record<string, string> = {
      lab_report: "LAB_REPORT",
      imaging_report: "IMAGING_REPORT",
      clinical_notes: "CLINICAL_NOTES",
      pathology_report: "PATHOLOGY_REPORT",
      assessment_form: "ASSESSMENT_FORM",
      prescription: "PRESCRIPTION",
      insurance_card: "INSURANCE_CARD",
      intake_form: "INTAKE_FORM",
      other: "UNKNOWN",
      unknown: "UNKNOWN",
    };

    // Convert to valid enum value or default to UNKNOWN
    documentType = documentTypeMap[documentType?.toLowerCase()] || "UNKNOWN";

    if (!clientId || !documentType || !file) {
      const errorResponse = NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    // Verify client exists
    try {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        const errorResponse = NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
        errorResponse.headers.set("Access-Control-Allow-Origin", "*");
        errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
        errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        return errorResponse;
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      const errorResponse = NextResponse.json(
        {
          error: "Database connection failed",
          details:
            dbError instanceof Error
              ? dbError.message
              : "Unknown database error",
        },
        { status: 500 }
      );
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    // Convert file to buffer and upload to S3
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate secure filename to prevent conflicts
    const timestamp = Date.now();
    // More aggressive filename sanitization for production stability
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/_+/g, "_") // Replace multiple underscores with single
      .replace(/^_|_$/g, "") // Remove leading/trailing underscores
      .toLowerCase();
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    // Import and use S3 storage service
    const { medicalDocStorage } = await import("@/lib/medical/storage-service");

    // Upload to S3
    const uploadResult = await medicalDocStorage.uploadFile(
      fileBuffer,
      uniqueFileName,
      clientId,
      {
        contentType: file.type,
        documentType,
        metadata: {
          originalFileName: file.name,
          labType: labType || undefined,
        },
      }
    );

    let document;
    try {
      document = await prisma.document.create({
        data: {
          id: uuidv4(), // Generate unique ID for the document
          clientId,
          fileName: file.name,
          originalFileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: uploadResult.url, // S3 URL
          storageProvider: "S3", // Mark as S3 storage
          storageKey: uploadResult.key, // S3 key for retrieval
          documentType,
          labType: labType || null,
          analysisStatus: "PENDING", // Using the correct enum value
          status: "UPLOADED", // Processing status
          tags: [], // Empty array for now, can be populated later
          metadata: {
            originalFileName: file.name,
            uploadedAt: new Date().toISOString(),
            labType: labType || undefined,
          },
        },
        include: {
          Client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } catch (createError) {
      console.error("Document creation error:", createError);
      const errorResponse = NextResponse.json(
        {
          error: "Failed to create document record",
          details:
            createError instanceof Error
              ? createError.message
              : "Unknown creation error",
        },
        { status: 500 }
      );
      errorResponse.headers.set("Access-Control-Allow-Origin", "*");
      errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return errorResponse;
    }

    const response = NextResponse.json(document, { status: 201 });

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return response;
  } catch (error) {
    console.error("❌ Document creation error:", error);

    // Enhanced error logging for production debugging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    let errorResponse;
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      errorResponse = NextResponse.json({ error: error.message }, { status: 401 });
    } else {
      // Return more detailed error information for debugging
      errorResponse = NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to create document",
          details: error instanceof Error ? error.stack : "Unknown error",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // Add CORS headers to error responses too
    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return errorResponse;
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Simplified auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Find the document first to get file path
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the file from disk if it exists
    if (document.fileUrl) {
      const filePath = path.join(process.cwd(), "public", document.fileUrl);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete the document from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
