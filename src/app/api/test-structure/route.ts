import { NextResponse } from "next/server";
import { claudeService } from "@/lib/api/claude";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const analysis = await claudeService.analyzeDocumentStructure(text);

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        textLength: text.length,
        timestamp: new Date().toISOString(),
        version: "2.0",
      },
    });
  } catch (error) {
    console.error("❌ Structure analysis test failed:", error);
    return NextResponse.json(
      {
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Document Structure Analysis Test Endpoint",
    usage: 'POST with { "text": "your OCR text here" }',
    version: "2.0",
    status: "active",
  });
}
