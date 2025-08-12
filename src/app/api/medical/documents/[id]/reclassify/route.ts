import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { labValueExtractor } from "@/lib/medical/lab-extractor";

interface Params {
  params: {
    id: string;
  };
}

/**
 * Reclassify document based on OCR content and re-extract values
 */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: documentId } = await params;

    // Get document with current data
    const document = await prisma.medicalDocument.findUnique({
      where: { id: documentId },
      include: {
        labValues: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    if (!document.ocrText) {
      return NextResponse.json(
        { error: "Document has no OCR text to analyze" },
        { status: 400 }
      );
    }

    const oldType = document.documentType;
    const lowerText = document.ocrText.toLowerCase();
    let newType = oldType;

    // Detect document type from content
    if (
      lowerText.includes("symptom burden report") ||
      (lowerText.includes("potential nutritional deficiencies") &&
        lowerText.includes("potential conditions"))
    ) {
      newType = "symptom_assessment";
    } else if (
      lowerText.includes("symptom burden") &&
      (lowerText.includes("bar graph") ||
        lowerText.includes("priority") ||
        (lowerText.includes("upper gi") && lowerText.includes("liver")))
    ) {
      newType = "symptom_assessment";
    } else if (
      lowerText.includes("naq questions") ||
      lowerText.includes("nutritional assessment questionnaire") ||
      lowerText.includes("nutri-q") ||
      (lowerText.includes("naq") && lowerText.includes("questions/answers"))
    ) {
      newType = "nutriq_assessment";
    } else if (
      lowerText.includes("food sensitivity") ||
      lowerText.includes("kbmo") ||
      lowerText.includes("fit 176")
    ) {
      newType = "food_sensitivity";
    } else if (
      lowerText.includes("dutch") ||
      lowerText.includes("hormone") ||
      lowerText.includes("cortisol")
    ) {
      newType = "hormone_panel";
    } else if (
      /\b(glucose|cholesterol|hemoglobin|creatinine|CBC)\b/i.test(
        document.ocrText
      )
    ) {
      newType = "lab_report";
    }

    // Update document type if changed
    if (newType !== oldType) {
      await prisma.medicalDocument.update({
        where: { id: documentId },
        data: {
          documentType: newType,
          metadata: {
            ...document.metadata,
            originalDocumentType: oldType,
            reclassifiedAt: new Date().toISOString(),
            reclassifiedFrom: oldType,
            reclassifiedTo: newType,
          },
        },
      });
    }

    // Clear and re-extract lab values
    await prisma.medicalLabValue.deleteMany({
      where: { documentId },
    });

    let extractionResult = null;

    // Only extract if it's a type that should have values
    if (
      [
        "lab_report",
        "nutriq_assessment",
        "symptom_assessment",
        "food_sensitivity",
        "hormone_panel",
      ].includes(newType)
    ) {
      extractionResult = await labValueExtractor.extractLabValues(
        documentId,
        document.ocrText
      );
    }

    return NextResponse.json({
      success: true,
      documentId,
      previousType: oldType,
      newType,
      typeChanged: oldType !== newType,
      extraction: extractionResult
        ? {
            totalExtracted: extractionResult.totalFound,
            highConfidence: extractionResult.highConfidenceCount,
          }
        : null,
    });
  } catch (error) {
    console.error("Error reclassifying document:", error);
    return NextResponse.json(
      { error: "Failed to reclassify document" },
      { status: 500 }
    );
  }
}
