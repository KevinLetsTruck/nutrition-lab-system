/**
 * FNTP Master Clinical Recommendation System API
 * Enhanced protocol generation with root cause analysis and strict supplement limits
 */

import { NextRequest, NextResponse } from "next/server";
import { fntpMasterProtocolGenerator } from "@/lib/medical/fntp-master-protocol-generator";
import { DecisionTreeProcessor } from "@/lib/medical/fntp-decision-trees";
import { prisma } from "@/lib/db/prisma";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Get document with metadata to check if master protocol exists
    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isTruckDriver: true,
          },
        },
        labValues: true,
        analysis: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Check if functional analysis has been completed
    const metadata = document.metadata as any;
    const hasAnalysis = metadata && "functionalAnalysisComplete" in metadata;

    if (!hasAnalysis) {
      return NextResponse.json(
        {
          error: "Functional analysis not completed - complete analysis first",
          message:
            "The FNTP Master Protocol requires completed functional analysis to identify root causes",
        },
        { status: 404 }
      );
    }

    // Check if master protocol already exists
    const hasMasterProtocol =
      metadata && "fntpMasterProtocolComplete" in metadata;

    if (hasMasterProtocol) {
      // Return existing protocol indication
      return NextResponse.json({
        document,
        protocolExists: true,
        protocolGeneratedAt: metadata.masterProtocolGeneratedAt,
        rootCause: metadata.rootCause,
        supplementPhases: metadata.supplementPhases,
        message: "FNTP Master Protocol exists - use POST to regenerate",
      });
    }

    // Generate new master protocol
    const masterProtocol =
      await fntpMasterProtocolGenerator.generateMasterProtocol(id);

    return NextResponse.json({
      masterProtocol,
      document,
      generatedAt: new Date(),
      message: "FNTP Master Protocol generated successfully",
      summary: {
        rootCause: masterProtocol.rootCauseAnalysis.primary,
        confidence: masterProtocol.rootCauseAnalysis.confidence,
        phases: masterProtocol.phases.length,
        phase1Supplements: masterProtocol.phases[0]?.supplements.length || 0,
        dotOptimization: !!masterProtocol.dotOptimization,
      },
    });
  } catch (error) {
    console.error("FNTP Master Protocol API error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate FNTP Master Protocol",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Force regenerate master protocol
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { forceRegenerate = false, options = {} } = body;

    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isTruckDriver: true,
          },
        },
        labValues: true,
        analysis: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Generate new master protocol (force regeneration)

    const masterProtocol =
      await fntpMasterProtocolGenerator.generateMasterProtocol(id);

    // Get automated decision tree recommendations if requested
    let decisionTreeResults = null;
    if (options.includeDecisionTrees) {
      const symptoms = (document.metadata as any)?.symptoms || [];
      decisionTreeResults = DecisionTreeProcessor.getAutomatedRecommendations(
        [], // complaints - could extract from analysis
        symptoms,
        document.labValues
      );
    }

    return NextResponse.json({
      masterProtocol,
      decisionTreeResults,
      document,
      regeneratedAt: new Date(),
      message: "FNTP Master Protocol regenerated successfully",
      summary: {
        rootCause: masterProtocol.rootCauseAnalysis.primary,
        confidence: masterProtocol.rootCauseAnalysis.confidence,
        phases: masterProtocol.phases.length,
        totalSupplementsPhase1:
          masterProtocol.phases[0]?.supplements.length || 0,
        totalSupplementsPhase2:
          masterProtocol.phases[1]?.supplements.length || 0,
        totalSupplementsPhase3:
          masterProtocol.phases[2]?.supplements.length || 0,
        dotOptimization: !!masterProtocol.dotOptimization,
        labTriggers: masterProtocol.rootCauseAnalysis.labTriggers.length,
        clientEducationReady: !!masterProtocol.clientEducation,
      },
    });
  } catch (error) {
    console.error("FNTP Master Protocol regeneration error:", error);
    return NextResponse.json(
      {
        error: "Failed to regenerate FNTP Master Protocol",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Get quick protocol recommendations based on lab values (no full protocol generation)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { quickAnalysis = false } = body;

    if (!quickAnalysis) {
      return NextResponse.json(
        { error: "PATCH method requires quickAnalysis=true" },
        { status: 400 }
      );
    }

    const document = await prisma.medicalDocument.findUnique({
      where: { id },
      include: {
        labValues: true,
        client: {
          select: { firstName: true, lastName: true, isTruckDriver: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Quick analysis for immediate recommendations
    const quickRecommendations = {
      criticalFindings: [],
      immediateActions: [],
      suggestedSupplements: [],
      followUpNeeded: false,
    };

    // Check critical lab values
    const labValues = document.labValues;

    // Critical blood pressure
    const systolic = labValues.find(
      (lab) =>
        lab.testName?.toLowerCase().includes("systolic") ||
        lab.testName?.toLowerCase().includes("blood pressure")
    );

    if (systolic && systolic.value > 140) {
      quickRecommendations.criticalFindings.push(
        `Critical: Blood pressure ${systolic.value} mmHg`
      );
      quickRecommendations.immediateActions.push(
        "Start Cardio Miracle immediately"
      );
      quickRecommendations.immediateActions.push(
        "Begin Lyte Balance for electrolyte support"
      );
      quickRecommendations.followUpNeeded = true;
    }

    // Critical glucose
    const glucose = labValues.find(
      (lab) =>
        lab.testName?.toLowerCase().includes("glucose") &&
        !lab.testName?.toLowerCase().includes("random")
    );

    if (glucose && glucose.value > 126) {
      quickRecommendations.criticalFindings.push(
        `Critical: Fasting glucose ${glucose.value} mg/dL`
      );
      quickRecommendations.immediateActions.push(
        "Start Glucobalance with meals"
      );
      quickRecommendations.immediateActions.push("Consider Berberine addition");
      quickRecommendations.followUpNeeded = true;
    }

    // Always recommend foundation supplements for truckers
    if (document.client?.isTruckDriver) {
      quickRecommendations.suggestedSupplements.push(
        "Algae Omega-3 DHA (LetsTruck) - 2 caps 2x daily"
      );
      quickRecommendations.suggestedSupplements.push(
        "Lyte Balance (LetsTruck) - 1 scoop 2x daily"
      );
      quickRecommendations.suggestedSupplements.push(
        "Bio-D-Mulsion (LetsTruck) - 4 drops daily"
      );
    }

    return NextResponse.json({
      quickRecommendations,
      document: {
        id: document.id,
        client: document.client,
        labValueCount: labValues.length,
      },
      message:
        "Quick analysis completed - consider full FNTP Master Protocol for comprehensive recommendations",
      nextSteps: [
        "Review critical findings immediately",
        "Implement immediate actions if any",
        "Schedule full FNTP Master Protocol generation",
        "Plan follow-up based on findings",
      ],
    });
  } catch (error) {
    console.error("Quick analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform quick analysis",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
