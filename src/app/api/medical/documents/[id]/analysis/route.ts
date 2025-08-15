import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { functionalAnalyzer } from "@/lib/medical/functional-analysis";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get document with metadata
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      select: {
        id: true,
        originalFileName: true,
        documentType: true,
        metadata: true,
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

    // Check if functional analysis has been completed (new AI pipeline)
    const metadata = document.metadata as any;
    const hasNewAIAnalysis =
      metadata &&
      typeof metadata === "object" &&
      (metadata.functionalAnalysis || metadata.functionalAnalysisCompleted);

    // If no new AI analysis, return appropriate response
    if (!hasNewAIAnalysis) {
      return NextResponse.json({
        document,
        hasAnalysis: false,
        analysisType: "none",
        message:
          "This document was processed with the legacy system. The new AI-powered functional medicine analysis is available for newly uploaded documents.",
        suggestion:
          "Upload a new document to see the complete AI pipeline with structure analysis, lab extraction, and functional medicine insights.",
      });
    }

    // Get lab values for context
    const labValues = await prisma.medicalLabValue.findMany({
      where: { documentId: id },
      orderBy: { confidence: "desc" },
    });

    // Extract the new AI functional analysis from metadata
    const functionalAnalysis = metadata.functionalAnalysis;
    const analysis = {
      functionalAnalysis,
      hasAnalysis: true,
      analysisType: "ai_powered",
      structureAnalysis: metadata.structureAnalysis,
      aiExtraction: metadata.aiExtraction,
      narrativeReport: metadata.narrativeReport,
      processingPipeline: metadata.processingPipeline,
    };

    return NextResponse.json({
      document,
      analysis,
      labValues,
      generatedAt: new Date().toISOString(),
      message: "Functional medicine analysis retrieved successfully",
    });
  } catch (error) {
    console.error("Analysis API error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analysis" },
      { status: 500 }
    );
  }
}

// Force re-analysis
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    console.log(`🔄 Forcing re-analysis for document: ${id}`);

    // Check if document exists and has lab values
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const labValuesCount = await prisma.medicalLabValue.count({
      where: { documentId: id },
    });

    if (labValuesCount === 0) {
      return NextResponse.json(
        { error: "No lab values found - please complete lab extraction first" },
        { status: 400 }
      );
    }

    const result = await functionalAnalyzer.analyzeDocument(id);

    return NextResponse.json({
      success: true,
      analysis: result,
      message: "Analysis completed successfully",
    });
  } catch (error) {
    console.error("Force analysis error:", error);
    return NextResponse.json(
      { error: "Failed to perform analysis" },
      { status: 500 }
    );
  }
}
