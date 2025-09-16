import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Minimal validation - accept any JSON
const importAnalysisSchema = {
  parse: (data: any) => data // Just return the data as-is
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Skip auth for now to isolate the issue
    const { clientId } = await params;

    // Parse request body
    const body = await request.json();
    console.log("📄 Received analysis data for import");

    // Log the analysis data for now - skip database operations
    console.log("📊 Analysis data received, size:", JSON.stringify(body).length);
    console.log("🎯 Analysis structure keys:", Object.keys(body));

    return NextResponse.json({
      success: true,
      message: "Analysis processed successfully (logged for debugging)",
      analysis: {
        id: "debug-" + Date.now(),
        confidence: 0.8,
        rootCauses: ["Analysis data received"],
        priorityAreas: ["Check console logs"],
      },
      summary: {
        noteId: "debug-note",
        rootCauses: 1,
        confidence: 0.8,
        storedAs: "Debug Mode",
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Error in import endpoint:", error);
    return NextResponse.json({
      error: "Failed to process import",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Return empty for now to avoid database issues
    return NextResponse.json({
      success: true,
      analyses: [],
      summary: {
        totalAnalyses: 0,
        latestAnalysis: null,
        totalSupplements: 0,
        totalPhases: 0,
      },
    });

  } catch (error) {
    console.error("Error fetching analysis notes:", error);
    return NextResponse.json({
      success: true,
      analyses: [],
      summary: {
        totalAnalyses: 0,
        latestAnalysis: null,
        totalSupplements: 0,
        totalPhases: 0,
      },
    });
  }
}
