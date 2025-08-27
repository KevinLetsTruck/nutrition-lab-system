import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { parseClaudeAnalysis, validateAnalysis } from "@/lib/analysis-parser";

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

    const { clientId } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.analysisText || typeof body.analysisText !== 'string') {
      return NextResponse.json(
        { error: "Analysis text is required" },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Parse the Claude analysis
    const parsedAnalysis = parseClaudeAnalysis(body.analysisText);
    
    // Validate the parsed analysis
    const validationErrors = validateAnalysis(parsedAnalysis);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Analysis validation failed",
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Create the analysis record
    const analysis = await prisma.clientAnalysis.create({
      data: {
        clientId,
        fullAnalysis: parsedAnalysis.fullAnalysis,
        executiveSummary: parsedAnalysis.executiveSummary,
        systemAnalysis: parsedAnalysis.systemAnalysis,
        rootCauseAnalysis: parsedAnalysis.rootCauseAnalysis,
        protocolRecommendations: parsedAnalysis.protocolRecommendations,
        monitoringPlan: parsedAnalysis.monitoringPlan,
        patientEducation: parsedAnalysis.patientEducation,
        analysisVersion: body.analysisVersion || 'v1.0',
        practitionerNotes: body.practitionerNotes,
        createdBy: authUser.id,
      },
    });

    console.log(`✅ Claude analysis imported for client ${client.firstName} ${client.lastName}`);

    return NextResponse.json({
      success: true,
      message: "Analysis imported successfully",
      analysis: {
        id: analysis.id,
        analysisDate: analysis.analysisDate,
        sectionsDetected: Object.keys(parsedAnalysis).filter(key => 
          key !== 'fullAnalysis' && parsedAnalysis[key as keyof typeof parsedAnalysis]
        ).length
      }
    });

  } catch (error: any) {
    console.error("Analysis import error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to import analysis",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
