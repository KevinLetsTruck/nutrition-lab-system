import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import jwt from "jsonwebtoken";

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

    // For now, we'll store file info without actual file upload
    // In production, you'd upload to S3 and store the URL
    const document = await prisma.document.create({
      data: {
        clientId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: `/uploads/${file.name}`, // Placeholder URL
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
