import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { medicalOCRService } from "@/lib/medical/ocr-service";

export async function POST(req: NextRequest) {
  try {

    // Find a PDF document that needs processing
    const pendingDoc = await prisma.medicalDocument.findFirst({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
        metadata: {
          path: ["mimeType"],
          equals: "application/pdf",
        },
      },
      orderBy: { uploadDate: "desc" },
    });

    if (!pendingDoc) {
      return NextResponse.json(
        {
          success: false,
          error: "No PDF documents found for testing",
        },
        { status: 404 }
      );
    }

    // Process the document directly

    const result = await medicalOCRService.processDocument(pendingDoc.id);

    .toFixed(1)}%`
    );

    return NextResponse.json({
      success: true,
      documentId: pendingDoc.id,
      originalFileName: pendingDoc.originalFileName,
      ocrTextLength: result.ocrResult.text.length,
      ocrConfidence: (result.ocrResult.confidence * 100).toFixed(1),
      processingTime: result.ocrResult.processingTime,
      pageCount: result.ocrResult.pageCount || "N/A",
      textPreview: result.ocrResult.text.substring(0, 300),
      message: "PDF processing test successful",
    });
  } catch (error: any) {
    console.error("❌ PDF processing test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.stack,
      },
      { status: 500 }
    );
  }
}
