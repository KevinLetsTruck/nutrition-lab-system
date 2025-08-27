import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string; analysisId: string }> }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId, analysisId } = await params;

    // Verify client exists and user has access
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Fetch the specific analysis
    const analysis = await prisma.clientAnalysis.findUnique({
      where: { 
        id: analysisId,
        clientId: clientId
      },
      select: {
        id: true,
        analysisDate: true,
        analysisVersion: true,
        executiveSummary: true,
        systemAnalysis: true,
        rootCauseAnalysis: true,
        protocolRecommendations: true,
        monitoringPlan: true,
        patientEducation: true,
        fullAnalysis: true,
        practitionerNotes: true,
        status: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
