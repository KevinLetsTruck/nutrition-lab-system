import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";
import { promises as fs } from "fs";
import path from "path";

// Helper function to verify JWT token
function verifyAuthToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No valid authorization header");
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return payload;
  } catch (error) {
    console.log("Token verification failed in API route:", error);
    throw new Error("Invalid token");
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuthToken(request);
    console.log("Authenticated user fetching documents:", user.email);

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
    // Verify authentication
    const user = verifyAuthToken(request);
    console.log("Authenticated user creating document:", user.email);

    const formData = await request.formData();
    const clientId = formData.get("clientId") as string;
    const documentType = formData.get("documentType") as string;
    const labType = formData.get("labType") as string;
    const file = formData.get("file") as File;

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

    // Save file to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure upload directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Create unique filename to prevent conflicts
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Save file to disk
    const fileBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(fileBuffer));

    console.log(`✅ File saved: ${filePath}`);

    const document = await prisma.document.create({
      data: {
        clientId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: `/uploads/${uniqueFileName}`, // Actual file URL
        documentType,
        labType: labType || null,
        status: "uploaded",
        extractedText: null,
        extractedData: null,
        aiAnalysis: null,
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
    if (
      error instanceof Error &&
      (error.message.includes("authorization") ||
        error.message.includes("token"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuthToken(request);
    console.log("Authenticated user deleting document:", user.email);

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
        console.log(`✅ File deleted: ${filePath}`);
      } catch (error) {
        console.log(`⚠️ Could not delete file: ${filePath}`, error);
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
