import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { randomBytes } from "crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    const { clientId } = params;
    const body = await request.json();
    const { analysisText } = body;

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Parse structured JSON from Claude analysis
    const supplementData = parseSupplementJSON(analysisText);

    if (!supplementData) {
      return NextResponse.json(
        { error: "No valid supplement JSON found in analysis" },
        { status: 400 }
      );
    }

    // Determine if this is a comprehensive export document or simple supplement data
    const isComprehensiveExport =
      supplementData.exportMetadata && supplementData.labAnalysis;

    // Create analysis data object (store in client.healthGoals instead of separate table)
    const analysisId = randomBytes(12).toString("hex");
    const analysisRecord = {
      id: analysisId,
      clientId,
      analysisType: isComprehensiveExport
        ? "FNTP_COMPREHENSIVE_PROTOCOL"
        : "SUPPLEMENT_RECOMMENDATION",
      analysisData: {
        structuredSupplementData: supplementData,
        originalAnalysis: analysisText,
        importType: isComprehensiveExport
          ? "comprehensive_export"
          : "structured_json",
        labAnalysis: supplementData.labAnalysis || null,
        clinicalSummary: supplementData.clinicalSummary || null,
        protocolLetter: supplementData.clientProtocolLetter || null,
        coachingNotes: supplementData.coachingNotes || null,
      },
      rootCauses: isComprehensiveExport
        ? extractRootCausesFromLabAnalysis(supplementData.labAnalysis)
        : (
            supplementData.supplements ||
            supplementData.supplementRecommendations
          )?.map((s: any) => s.rationale).filter(Boolean) || [],
      priorityAreas: isComprehensiveExport
        ? supplementData.coachingNotes?.keyHealthPriorities || []
        : (
            supplementData.supplements ||
            supplementData.supplementRecommendations
          )
            ?.filter((s: any) => s.priority === "CRITICAL")
            .map((s: any) => s.name).filter(Boolean) || [],
      relatedDocuments: [],
      confidence: 0.95, // High confidence for structured data
      analysisDate: new Date().toISOString(),
      version: supplementData.exportMetadata?.exportVersion || "3.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Process supplement data (store in healthGoals instead of separate table)
    const supplementsList =
      supplementData.supplements ||
      supplementData.supplementRecommendations ||
      [];

    const processedSupplements = supplementsList.map((supplement: any) => ({
      id: randomBytes(12).toString("hex"),
      analysisId: analysisId,
      name: supplement.name,
      brand: supplement.brand || "Unknown",
      dosage: supplement.dosage,
      timing: supplement.timing,
      duration: supplement.duration,
      priority: supplement.priority || "MEDIUM",
      category: supplement.category || "General",
      rationale: supplement.rationale,
      phase: supplement.phase || "PHASE1",
      estimatedCost: supplement.estimatedCost || 0,
      interactions: supplement.interactions,
      contraindications: supplement.contraindications,
      labJustification: supplement.labJustification,
      status: "RECOMMENDED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Update client with latest supplement analysis (store analysis in healthGoals)
    const currentAnalysisHistory = client.healthGoals?.analysisHistory || [];
    const updatedAnalysisHistory = [...currentAnalysisHistory, analysisRecord];
    
    const currentSupplements = client.healthGoals?.supplements || [];
    const updatedSupplements = [...currentSupplements, ...processedSupplements];

    await prisma.client.update({
      where: { id: clientId },
      data: {
        healthGoals: {
          ...client.healthGoals,
          latestSupplementAnalysis: supplementData,
          supplementAnalysisDate: new Date().toISOString(),
          totalMonthlyCost:
            supplementData.totalMonthlyCost ||
            supplementData.costAnalysis?.totalMonthlyCost ||
            processedSupplements.reduce((total, s) => total + (s.estimatedCost || 0), 0),
          medicationWarnings:
            supplementData.medicationWarnings ||
            supplementData.safetyConsiderations?.medicationWarnings,
          analysisHistory: updatedAnalysisHistory,
          supplements: updatedSupplements,
        },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Structured supplement analysis imported successfully",
      analysisId: analysisId,
      supplementsCreated: processedSupplements.length,
      totalMonthlyCost:
        supplementData.totalMonthlyCost ||
        supplementData.costAnalysis?.totalMonthlyCost ||
        0,
      medicationWarnings: (
        supplementData.medicationWarnings ||
        supplementData.safetyConsiderations?.medicationWarnings ||
        []
      ).length,
      phaseTimeline: supplementData.phaseTimeline,
      labAnalysisIncluded: !!supplementData.labAnalysis,
      protocolLetterIncluded: !!supplementData.clientProtocolLetter,
      coachingNotesIncluded: !!supplementData.coachingNotes,
    });
  } catch (error) {
    console.error("Import supplement analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
        details: "Failed to parse structured supplement data",
      },
      { status: 500 }
    );
  }
}

// Parse structured JSON from Claude analysis
function parseSupplementJSON(analysisText: string): any | null {
  try {
    // First, try to parse the entire content as JSON (for direct JSON files)
    try {
      const directJson = JSON.parse(analysisText);

      // Check for comprehensive export document structure
      if (directJson.exportMetadata || directJson.supplementRecommendations) {
        return directJson;
      }

      // Check for simple supplement structure
      if (directJson.supplements && Array.isArray(directJson.supplements)) {
        return directJson;
      }
    } catch (directParseError) {
      // Not a direct JSON file, continue with pattern matching
    }

    // Look for JSON blocks in markdown/text analysis
    const jsonPattern = /```json\s*([\s\S]*?)\s*```/g;
    const matches = analysisText.match(jsonPattern);

    if (!matches) {
      // Try to find JSON without code blocks
      const directJsonPattern =
        /\{[\s\S]*(?:"supplements"|"supplementRecommendations"|"exportMetadata")[\s\S]*\}/;
      const directMatch = analysisText.match(directJsonPattern);
      if (directMatch) {
        return JSON.parse(directMatch[0]);
      }
      return null;
    }

    // Parse the first JSON block found
    const jsonContent = matches[0]
      .replace(/```json\s*/, "")
      .replace(/\s*```/, "");
    const parsedData = JSON.parse(jsonContent);

    // Validate structure (support both formats)
    if (parsedData.supplements && Array.isArray(parsedData.supplements)) {
      return parsedData;
    }

    if (
      parsedData.supplementRecommendations &&
      Array.isArray(parsedData.supplementRecommendations)
    ) {
      return parsedData;
    }

    return null;
  } catch (error) {
    console.error("JSON parsing error:", error);
    return null;
  }
}

// Extract root causes from lab analysis data
function extractRootCausesFromLabAnalysis(labAnalysis: any): string[] {
  const rootCauses: string[] = [];

  if (labAnalysis?.dutchTestFindings?.hormoneImbalances) {
    rootCauses.push(labAnalysis.dutchTestFindings.hormoneImbalances);
  }

  if (labAnalysis?.nutriqFindings?.topConditions) {
    rootCauses.push(...labAnalysis.nutriqFindings.topConditions.slice(0, 3));
  }

  if (labAnalysis?.otherLabFindings?.abnormalValues) {
    rootCauses.push(labAnalysis.otherLabFindings.abnormalValues);
  }

  return rootCauses.filter(Boolean).slice(0, 10);
}

// Map priority strings to enum values
function mapPriority(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    CRITICAL: "CRITICAL",
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",
  };

  return priorityMap[priority?.toUpperCase()] || "MEDIUM";
}
