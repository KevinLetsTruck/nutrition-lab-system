import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = params;
    const body = await request.json();

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Update client with Claude analysis data
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        healthGoals: {
          ...client.healthGoals,
          claudeAnalysis: body.analysisData,
          analysisDate: new Date().toISOString(),
          analysisVersion: body.version || "1.0.0",
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Analysis imported successfully",
      clientId: clientId,
      analysisDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Import analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 }
    );
  }
}
