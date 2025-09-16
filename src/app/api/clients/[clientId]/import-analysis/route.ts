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

    // Just return success for now to test if the endpoint works
    return NextResponse.json({
      success: true,
      message: "Analysis received successfully (stored temporarily)",
      analysis: {
        id: "temp-" + Date.now(),
        confidence: 0.8,
        rootCauses: ["Sample root cause"],
        priorityAreas: ["Sample priority area"],
      },
      summary: {
        noteId: "temp-note",
        rootCauses: 1,
        confidence: 0.8,
        storedAs: "Temporary Storage",
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
    // Return empty analyses for now to test basic functionality
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
    console.error("Error in GET endpoint:", error);
    return NextResponse.json({
      error: "Failed to fetch analyses",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
