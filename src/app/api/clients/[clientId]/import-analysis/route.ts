import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { z } from "zod";

// Flexible validation schema for Claude analysis import
const importAnalysisSchema = z.object({
  // Accept any structure from Claude - we'll extract what we can
  analysisData: z.any().optional(),
  version: z.string().default("1.0"),
  analysisDate: z.string().optional(),
  
  // Allow direct fields at root level too
  rootCauses: z.array(z.string()).optional(),
  riskFactors: z.array(z.string()).optional(),
  priorityAreas: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  supplements: z.array(z.any()).optional(),
  protocolRecommendations: z.any().optional(),
  
  // Accept any other fields Claude might provide
}).passthrough();

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
    console.log("📄 Received analysis data:", JSON.stringify(body, null, 2));
    
    const validatedData = importAnalysisSchema.parse(body);

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Extract data from flexible structure
    const analysisData = validatedData.analysisData || validatedData;
    const rootCauses = validatedData.rootCauses || analysisData.rootCauses || [];
    const riskFactors = validatedData.riskFactors || analysisData.riskFactors || [];
    const priorityAreas = validatedData.priorityAreas || analysisData.priorityAreas || [];
    const confidence = validatedData.confidence || analysisData.confidence || 0.8;

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        clientId,
        analysisData: body, // Store the entire original JSON
        rootCauses: Array.isArray(rootCauses) ? rootCauses : [],
        riskFactors: Array.isArray(riskFactors) ? riskFactors : [],
        priorityAreas: Array.isArray(priorityAreas) ? priorityAreas : [],
        confidence: typeof confidence === 'number' ? confidence : 0.8,
        version: validatedData.version || "1.0",
        analysisDate: validatedData.analysisDate 
          ? new Date(validatedData.analysisDate)
          : new Date(),
      },
    });

    // Create protocol phases if provided (flexible extraction)
    const protocolData = validatedData.protocolRecommendations || 
                        analysisData.protocolRecommendations || 
                        analysisData.protocols || 
                        analysisData.phases;
                        
    if (protocolData) {
      
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

    // Create individual supplement records if provided (flexible extraction)
    const supplements = validatedData.supplements || 
                       analysisData.supplements || 
                       analysisData.supplementRecommendations || 
                       [];
                       
    if (supplements && supplements.length > 0) {
      const supplementData = supplements.map((supp: any) => ({
        clientId,
        analysisId: analysis.id,
        name: supp.name || supp.supplement || "Unknown Supplement",
        dosage: supp.dosage || supp.dose || "As directed",
        timing: supp.timing || supp.when || "With meals",
        duration: supp.duration || "30 days",
        priority: (supp.priority || "MEDIUM") as any,
        category: supp.category || "General",
        phase: supp.phase || "PHASE1",
        rationale: supp.rationale || supp.reason || null,
        productUrl: supp.productUrl || supp.url || null,
        estimatedCost: supp.estimatedCost || supp.cost || 0,
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
        protocolPhases: protocolData ? Object.keys(protocolData).length : 0,
        supplements: supplements?.length || 0,
        rootCauses: rootCauses?.length || 0,
        confidence: confidence,
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
