import { NextResponse } from "next/server";
import { claudeService } from "@/lib/api/claude";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const structureAnalysis = await claudeService.analyzeDocumentStructure(
      text
    );

    const extraction = await claudeService.extractLabValuesWithStructure(
      text,
      structureAnalysis
    );

    return NextResponse.json({
      success: true,
      structureAnalysis,
      extraction,
      summary: {
        documentType: structureAnalysis.documentType,
        ocrQuality: structureAnalysis.ocrQuality.overall,
        valuesExtracted: extraction.labValues.length,
        confidence: extraction.extractionSummary.confidence,
        isValid: extraction.isValid,
        expectedCount: structureAnalysis.extractionStrategy.expectedTestCount,
        actualCount: extraction.labValues.length,
        variance: Math.abs(
          extraction.labValues.length -
            structureAnalysis.extractionStrategy.expectedTestCount
        ),
      },
    });
  } catch (error) {
    console.error("❌ Extraction test failed:", error);
    return NextResponse.json(
      {
        error: "Extraction failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Lab Value Extraction Test Endpoint",
    usage: 'POST with { "text": "your OCR text here" }',
    description: "Tests the complete 2-step extraction pipeline",
    steps: [
      "1. Document structure analysis",
      "2. AI-powered lab value extraction",
    ],
    version: "2.0",
    status: "active",
  });
}
