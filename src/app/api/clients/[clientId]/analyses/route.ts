import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const { clientId } = params;

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get all analyses for this client with timeline information
    const analyses = await prisma.analysis.findMany({
      where: { clientId },
      include: {
        parentAnalysis: {
          select: {
            id: true,
            analysisDate: true,
            analysisType: true,
          },
        },
        childAnalyses: {
          select: {
            id: true,
            analysisDate: true,
            analysisType: true,
          },
        },
      },
      orderBy: { analysisDate: "desc" },
    });

    // Calculate analysis statistics
    const stats = {
      totalAnalyses: analyses.length,
      initialAnalyses: analyses.filter((a) => a.analysisType === "INITIAL")
        .length,
      followUpAnalyses: analyses.filter((a) => a.analysisType === "FOLLOW_UP")
        .length,
      protocolReviews: analyses.filter(
        (a) => a.analysisType === "PROTOCOL_REVIEW"
      ).length,
      averageConfidence:
        analyses.length > 0
          ? analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length
          : 0,
      dateRange:
        analyses.length > 0
          ? {
              earliest: analyses[analyses.length - 1].analysisDate,
              latest: analyses[0].analysisDate,
            }
          : null,
    };

    return NextResponse.json({
      analyses,
      stats,
      clientName: `${client.firstName} ${client.lastName}`,
    });
  } catch (error) {
    console.error("Analysis history error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch analysis history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
