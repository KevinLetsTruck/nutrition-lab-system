import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    console.log("🔍 DEBUG: Getting Claude data for client:", clientId);

    // Get client with stored Claude analysis
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        healthGoals: true,
        firstName: true,
        lastName: true,
        id: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          error: "Client not found",
          clientId: clientId,
        },
        { status: 404 }
      );
    }

    console.log("👤 Found client:", client.firstName, client.lastName);

    if (!client.healthGoals) {
      return NextResponse.json({
        client: {
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
        },
        healthGoals: null,
        claudeAnalysis: null,
        message: "No healthGoals data found",
      });
    }

    const healthGoals = client.healthGoals as any;
    const claudeAnalysis = healthGoals.claudeAnalysis;

    return NextResponse.json({
      client: {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
      },
      healthGoalsKeys: Object.keys(healthGoals),
      claudeAnalysis: claudeAnalysis,
      analysisDataKeys: claudeAnalysis?.analysisData
        ? Object.keys(claudeAnalysis.analysisData)
        : null,
      rawAnalysisData: claudeAnalysis?.analysisData || null,
    });
  } catch (error) {
    console.error("🚨 DEBUG API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
