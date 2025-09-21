import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { handleApiError } from "@/lib/error-handler";
import {
  createCachedResponse,
  getCached,
  setCached,
  invalidateCache,
} from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    // Create cache key
    const cacheKey = `documents:${clientId || "all"}:${status || "all"}:${
      id || "none"
    }`;

    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      return createCachedResponse(cached, {
        maxAge: 300, // 5 minutes
        tags: ["documents"],
      });
    }

    // Build where clause
    const whereClause: any = {};
    if (clientId) whereClause.clientId = clientId;
    if (status) whereClause.status = status;
    if (id) whereClause.id = id;

    const documents = await prisma.document.findMany({
      where: whereClause,
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

    // Cache the results
    setCached(cacheKey, documents, 300);

    return createCachedResponse(documents, {
      maxAge: 300,
      tags: ["documents"],
    });
  } catch (error) {
    return handleApiError(error);
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

    // For now, we'll create a simple document record
    // In a full implementation, you'd upload to S3 or file storage
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        documentType: documentType || "other",
        fileSize: file.size,
        fileUrl: `/uploads/${file.name}`, // Placeholder URL
        clientId: clientId,
        status: "uploaded",
        uploadedAt: new Date(),
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

    // Invalidate cache
    invalidateCache("documents");

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the document
    await prisma.document.delete({
      where: { id },
    });

    // Invalidate cache
    invalidateCache("documents");

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
