import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { labValueExtractor } from "@/lib/medical/lab-extractor";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const labValues = await prisma.medicalLabValue.findMany({
      where: { documentId: id },
      orderBy: [{ confidence: "desc" }, { testName: "asc" }],
    });

    return NextResponse.json({
      documentId: id,
      labValues,
      count: labValues.length,
    });
  } catch (error) {
    console.error("Error fetching lab values:", error);
    return NextResponse.json(
      { error: "Failed to fetch lab values" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: documentId } = await params;
    const body = await req.json();
    const { forceReExtract = false } = body;

    // Get document
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.ocrText) {
      return NextResponse.json(
        { error: "Document has no OCR text. Process the document first." },
        { status: 400 }
      );
    }

    // Check if already has lab values
    if (!forceReExtract) {
      const existingCount = await prisma.medicalLabValue.count({
        where: { documentId },
      });

      if (existingCount > 0) {
        return NextResponse.json({
          message: "Lab values already extracted",
          count: existingCount,
          extracted: false,
        });
      }
    }

    // Clear existing values if force re-extract
    if (forceReExtract) {
      await prisma.medicalLabValue.deleteMany({
        where: { documentId },
      });
    }

    // Extract lab values
    const result = await labValueExtractor.extractLabValues(
      documentId,
      document.ocrText
    );

    // Update document metadata
    await prisma.medicalDocument.update({
      where: { id: documentId },
      data: {
        metadata: {
          ...document.metadata,
          labExtractionComplete: true,
          labValuesFound: result.totalFound,
          highConfidenceLabValues: result.highConfidenceCount,
          labExtractionTime: result.processingTime,
          lastExtractedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      documentId,
      totalExtracted: result.totalFound,
      highConfidence: result.highConfidenceCount,
      processingTime: result.processingTime,
      extracted: true,
    });
  } catch (error) {
    console.error("Error extracting lab values:", error);
    return NextResponse.json(
      { error: "Failed to extract lab values" },
      { status: 500 }
    );
  }
}
