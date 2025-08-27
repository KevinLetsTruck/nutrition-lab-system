import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Get all analyses for this client, ordered by date (newest first)
    const analyses = await prisma.clientAnalysis.findMany({
      where: { clientId },
      orderBy: { analysisDate: 'desc' },
      include: {
        enhancedProtocols: {
          select: {
            id: true,
            protocolName: true,
            status: true,
            effectivenessRating: true
          }
        }
      }
    });

    // Transform the data for the frontend
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis.id,
      analysisDate: analysis.analysisDate,
      analysisVersion: analysis.analysisVersion,
      status: analysis.status,
      
      // Section availability
      sections: {
        executiveSummary: !!analysis.executiveSummary,
        systemAnalysis: !!analysis.systemAnalysis,
        rootCauseAnalysis: !!analysis.rootCauseAnalysis,
        protocolRecommendations: !!analysis.protocolRecommendations,
        monitoringPlan: !!analysis.monitoringPlan,
        patientEducation: !!analysis.patientEducation
      },
      
      // Metadata
      practitionerNotes: analysis.practitionerNotes,
      createdBy: analysis.createdBy,
      createdAt: analysis.createdAt,
      
      // Related protocols
      protocolsGenerated: analysis.enhancedProtocols.length,
      activeProtocols: analysis.enhancedProtocols.filter(p => p.status === 'active').length,
      
      // Summary metrics
      analysisLength: analysis.fullAnalysis.length,
      sectionsDetected: Object.values({
        executiveSummary: !!analysis.executiveSummary,
        systemAnalysis: !!analysis.systemAnalysis,
        rootCauseAnalysis: !!analysis.rootCauseAnalysis,
        protocolRecommendations: !!analysis.protocolRecommendations,
        monitoringPlan: !!analysis.monitoringPlan,
        patientEducation: !!analysis.patientEducation
      }).filter(Boolean).length
    }));

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`
      },
      totalAnalyses: analyses.length,
      analyses: formattedAnalyses
    });

  } catch (error: any) {
    console.error("Analysis history error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to fetch analysis history",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
