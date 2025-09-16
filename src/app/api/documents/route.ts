import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

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
        ...(status && { status }),
      },
      include: {
        client: {
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
    // Simplified auth check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Convert file to buffer and upload to S3
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate secure filename to prevent conflicts
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
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

    const document = await prisma.document.create({
      data: {
        clientId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: uploadResult.url, // S3 URL
        storageProvider: "S3", // Mark as S3 storage
        documentType,
        labType: labType || null,
        analysisStatus: "PENDING", // Using the correct enum value
        tags: [], // Empty array for now, can be populated later
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("❌ Document creation error:", error);

    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create document",
      },
      { status: 500 }
    );
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
