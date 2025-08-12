import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { assessmentAnalyzer } from "@/lib/medical/assessment-analyzer";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get document details
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        labValues: {
          where: {
            OR: [
              { standardName: { startsWith: "naq_" } },
              { standardName: { startsWith: "symptom_" } },
            ],
          },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if this is an assessment document
    if (
      document.documentType !== "nutriq_assessment" &&
      document.documentType !== "symptom_assessment"
    ) {
      return NextResponse.json(
        { error: "Document is not an assessment form" },
        { status: 400 }
      );
    }

    let analysis = null;

    if (document.documentType === "nutriq_assessment") {
      // Analyze NAQ responses
      analysis = await assessmentAnalyzer.analyzeNAQResponses(id);
    } else if (document.documentType === "symptom_assessment") {
      // Analyze symptom burden
      analysis = await assessmentAnalyzer.analyzeSymptomBurden(id);
    }

    return NextResponse.json({
      document: {
        id: document.id,
        fileName: document.originalFileName,
        type: document.documentType,
        uploadDate: document.uploadDate,
        client: document.client,
      },
      analysis,
      extractedValues: document.labValues.length,
      message: "Assessment analysis completed successfully",
    });
  } catch (error) {
    console.error("Assessment analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze assessment" },
      { status: 500 }
    );
  }
}
