import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get document with processing status
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get processing queue status
    const queueEntry = await prisma.medicalProcessingQueue.findFirst({
      where: {
        documentId: id,
      },
      orderBy: { createdAt: "desc" },
    });

    const response = {
      id: document.id,
      status: document.status,
      documentType: document.documentType,
      originalFileName: document.originalFileName,
      uploadDate: document.uploadDate,
      processedAt: document.processedAt,
      ocrConfidence: document.ocrConfidence,
      errorMessage: document.errorMessage,
      client: document.client,
      metadata: document.metadata,
      processing: queueEntry
        ? {
            status: queueEntry.status,
            startedAt: queueEntry.startedAt,
            completedAt: queueEntry.completedAt,
            attempts: queueEntry.attempts,
            errorMessage: queueEntry.errorMessage,
          }
        : null,
      textPreview: document.ocrText
        ? document.ocrText.substring(0, 200) +
          (document.ocrText.length > 200 ? "..." : "")
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Status API error:", error);
    return NextResponse.json(
      { error: "Failed to get document status" },
      { status: 500 }
    );
  }
}
