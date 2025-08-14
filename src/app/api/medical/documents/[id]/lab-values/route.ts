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

    const [labValues, document] = await Promise.all([
      prisma.labValue.findMany({
        where: { documentId: id },
        orderBy: [{ confidence: "desc" }, { testName: "asc" }],
      }),
      prisma.document.findUnique({
        where: { id },
        select: { originalFileName: true, fileName: true },
      }),
    ]);

    // Categorize lab values by category
    const categorized = labValues.reduce((acc, value) => {
      const category = value.category || "OTHER";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(value);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate stats
    const highConfidenceCount = labValues.filter(
      (v) => (v.confidence || 0) >= 0.8
    ).length;

    return NextResponse.json({
      documentId: id,
      labValues,
      count: labValues.length,
      categorized,
      stats: {
        totalValues: labValues.length,
        highConfidence: highConfidenceCount,
        categories: Object.keys(categorized).length,
      },
      document: {
        id,
        originalFileName:
          document?.originalFileName ||
          document?.fileName ||
          "Unknown Document",
      },
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
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.extractedText) {
      return NextResponse.json(
        { error: "Document has no OCR text. Process the document first." },
        { status: 400 }
      );
    }

    // Check if already has lab values
    if (!forceReExtract) {
      const existingCount = await prisma.labValue.count({
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
      await prisma.labValue.deleteMany({
        where: { documentId },
      });
    }

    // Extract lab values
    const result = await labValueExtractor.extractLabValues(
      documentId,
      document.extractedText
    );

    // Update document metadata
    await prisma.document.update({
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
