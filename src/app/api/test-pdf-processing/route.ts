import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { medicalOCRService } from "@/lib/medical/ocr-service";

export async function POST(req: NextRequest) {
  try {
    console.log("🧪 Manual PDF processing test triggered...");

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

    console.log(`📄 Found PDF document: ${pendingDoc.originalFileName}`);
    console.log(`📍 Document ID: ${pendingDoc.id}`);
    console.log(`🔗 S3 URL: ${pendingDoc.s3Url}`);

    // Process the document directly
    console.log("🔄 Starting PDF processing...");
    const result = await medicalOCRService.processDocument(pendingDoc.id);

    console.log("✅ PDF processing completed!");
    console.log(`📝 Extracted ${result.ocrResult.text.length} characters`);
    console.log(
      `🎯 Confidence: ${(result.ocrResult.confidence * 100).toFixed(1)}%`
    );
    console.log(`⏱️ Processing time: ${result.ocrResult.processingTime}ms`);

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
