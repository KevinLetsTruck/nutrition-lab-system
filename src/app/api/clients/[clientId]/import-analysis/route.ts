import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { z } from "zod";

// Validation schema for Claude analysis import
const importAnalysisSchema = z.object({
  analysisData: z.object({
    rootCauses: z.array(z.string()),
    riskFactors: z.array(z.string()),
    priorityAreas: z.array(z.string()),
    confidence: z.number().min(0).max(1),
    systemFindings: z.object({
      digestive: z.any().optional(),
      metabolic: z.any().optional(),
      hormonal: z.any().optional(),
      inflammatory: z.any().optional(),
      detoxification: z.any().optional(),
    }).optional(),
    protocolRecommendations: z.object({
      phase1: z.any().optional(),
      phase2: z.any().optional(),
      phase3: z.any().optional(),
    }).optional(),
    supplements: z.array(z.object({
      name: z.string(),
      dosage: z.string(),
      timing: z.string(),
      duration: z.string(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      category: z.string(),
      phase: z.string(),
      rationale: z.string().optional(),
      productUrl: z.string().optional(),
      estimatedCost: z.number().optional(),
    })).optional(),
  }),
  version: z.string().default("1.0"),
  analysisDate: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Authenticate user
    const user = await verifyAuthToken(request);
    const { clientId } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = importAnalysisSchema.parse(body);

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        clientId,
        analysisData: validatedData.analysisData as any,
        rootCauses: validatedData.analysisData.rootCauses,
        riskFactors: validatedData.analysisData.riskFactors,
        priorityAreas: validatedData.analysisData.priorityAreas,
        confidence: validatedData.analysisData.confidence,
        version: validatedData.version,
        analysisDate: validatedData.analysisDate 
          ? new Date(validatedData.analysisDate)
          : new Date(),
      },
    });

    // Create protocol phases if provided
    if (validatedData.analysisData.protocolRecommendations) {
      const protocolData = validatedData.analysisData.protocolRecommendations;
      
      const phases = [];
      if (protocolData.phase1) {
        phases.push({
          analysisId: analysis.id,
          clientId,
          phase: "PHASE1",
          name: "Foundation Phase",
          description: "Basic support, gut healing, inflammation reduction",
          duration: "30 days",
          supplements: Array.isArray(protocolData.phase1.supplements) ? protocolData.phase1.supplements : [],
          lifestyle: Array.isArray(protocolData.phase1.lifestyle) ? protocolData.phase1.lifestyle : [],
          dietary: Array.isArray(protocolData.phase1.dietary) ? protocolData.phase1.dietary : [],
          monitoring: Array.isArray(protocolData.phase1.monitoring) ? protocolData.phase1.monitoring : [],
        });
      }
      
      if (protocolData.phase2) {
        phases.push({
          analysisId: analysis.id,
          clientId,
          phase: "PHASE2",
          name: "Targeted Phase",
          description: "Specific interventions for identified patterns",
          duration: "60 days",
          supplements: Array.isArray(protocolData.phase2.supplements) ? protocolData.phase2.supplements : [],
          lifestyle: Array.isArray(protocolData.phase2.lifestyle) ? protocolData.phase2.lifestyle : [],
          dietary: Array.isArray(protocolData.phase2.dietary) ? protocolData.phase2.dietary : [],
          monitoring: Array.isArray(protocolData.phase2.monitoring) ? protocolData.phase2.monitoring : [],
        });
      }
      
      if (protocolData.phase3) {
        phases.push({
          analysisId: analysis.id,
          clientId,
          phase: "PHASE3",
          name: "Optimization Phase",
          description: "Fine-tuning and long-term maintenance",
          duration: "90 days",
          supplements: Array.isArray(protocolData.phase3.supplements) ? protocolData.phase3.supplements : [],
          lifestyle: Array.isArray(protocolData.phase3.lifestyle) ? protocolData.phase3.lifestyle : [],
          dietary: Array.isArray(protocolData.phase3.dietary) ? protocolData.phase3.dietary : [],
          monitoring: Array.isArray(protocolData.phase3.monitoring) ? protocolData.phase3.monitoring : [],
        });
      }

      if (phases.length > 0) {
        await prisma.protocolPhase.createMany({
          data: phases,
        });
      }
    }

    // Create individual supplement records if provided
    if (validatedData.analysisData.supplements && validatedData.analysisData.supplements.length > 0) {
      const supplementData = validatedData.analysisData.supplements.map(supp => ({
        clientId,
        analysisId: analysis.id,
        name: supp.name,
        dosage: supp.dosage,
        timing: supp.timing,
        duration: supp.duration,
        priority: supp.priority as any,
        category: supp.category,
        phase: supp.phase,
        rationale: supp.rationale || null,
        productUrl: supp.productUrl || null,
        estimatedCost: supp.estimatedCost || 0,
      }));

      await prisma.supplement.createMany({
        data: supplementData,
      });
    }

    // Create protocol history entry
    await prisma.protocolHistory.create({
      data: {
        clientId,
        analysisId: analysis.id,
        action: "ANALYSIS_IMPORTED",
        details: {
          importedBy: user.email,
          analysisVersion: validatedData.version,
          rootCausesCount: validatedData.analysisData.rootCauses.length,
          supplementsCount: validatedData.analysisData.supplements?.length || 0,
          confidence: validatedData.analysisData.confidence,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Analysis imported successfully",
      analysis: {
        id: analysis.id,
        confidence: analysis.confidence,
        rootCauses: analysis.rootCauses,
        priorityAreas: analysis.priorityAreas,
      },
      summary: {
        protocolPhases: phases.length,
        supplements: validatedData.analysisData.supplements?.length || 0,
        rootCauses: validatedData.analysisData.rootCauses.length,
        confidence: validatedData.analysisData.confidence,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Error importing analysis:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: "Invalid analysis data format",
        details: error.errors,
      }, { status: 400 });
    }

    return NextResponse.json({
      error: "Failed to import analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Authenticate user
    const user = await verifyAuthToken(request);
    const { clientId } = await params;

    // Get all analyses for this client
    const analyses = await prisma.analysis.findMany({
      where: { clientId },
      include: {
        protocolPhases: {
          orderBy: { phase: "asc" },
        },
        supplements: {
          orderBy: { priority: "desc" },
        },
        protocolHistory: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
      },
      orderBy: { analysisDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      analyses,
      summary: {
        totalAnalyses: analyses.length,
        latestAnalysis: analyses[0] || null,
        totalSupplements: analyses.reduce((sum, a) => sum + a.supplements.length, 0),
        totalPhases: analyses.reduce((sum, a) => sum + a.protocolPhases.length, 0),
      },
    });

  } catch (error) {
    console.error("Error fetching analyses:", error);
    return NextResponse.json({
      error: "Failed to fetch analyses",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
