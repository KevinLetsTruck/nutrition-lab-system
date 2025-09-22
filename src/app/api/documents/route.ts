import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");

    const documents = await prisma.document.findMany({
      where: {
        ...(clientId && { clientId }),
        ...(status && { status }),
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
    console.error("❌ DOCUMENTS API Error:", error);
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Return detailed error for debugging
    return NextResponse.json(
      {
        error: "Failed to fetch documents",
        details: error instanceof Error ? error.message : String(error),
        stack:
          error instanceof Error
            ? error.stack?.split("\n").slice(0, 5)
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const clientId = formData.get("clientId") as string;
    const documentType = formData.get("documentType") as string;

    if (!file || !clientId) {
      return NextResponse.json(
        { error: "File and clientId are required" },
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

    // For now, create document record without actual file storage
    // You can implement S3 upload later if needed
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        documentType: documentType || "other",
        fileSize: file.size,
        fileUrl: `/uploads/${clientId}/${file.name}`, // Placeholder URL
        clientId: clientId,
        status: "uploaded",
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

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Document upload error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

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
