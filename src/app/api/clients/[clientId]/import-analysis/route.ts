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
    // Simple auth check without database lookup
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Store analysis as a special note until Analysis tables are available on production
    const analysisNote = await prisma.note.create({
      data: {
        clientId,
        noteType: "COACHING",
        title: `Claude Analysis - ${new Date().toLocaleDateString()}`,
        generalNotes: JSON.stringify({
          type: "CLAUDE_ANALYSIS",
          analysisData: body,
          rootCauses: Array.isArray(rootCauses) ? rootCauses : [],
          riskFactors: Array.isArray(riskFactors) ? riskFactors : [],
          priorityAreas: Array.isArray(priorityAreas) ? priorityAreas : [],
          confidence: typeof confidence === 'number' ? confidence : 0.8,
          version: validatedData.version || "1.0",
          importedAt: new Date().toISOString(),
        }, null, 2),
        isImportant: true,
      },
    });

    // Skip complex table operations for now - just store in note

    return NextResponse.json({
      success: true,
      message: "Analysis imported successfully and stored as clinical note",
      analysis: {
        id: analysisNote.id,
        confidence: confidence,
        rootCauses: rootCauses,
        priorityAreas: priorityAreas,
      },
      summary: {
        noteId: analysisNote.id,
        rootCauses: rootCauses?.length || 0,
        confidence: confidence,
        storedAs: "Clinical Note",
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
    // Simple auth check without database lookup
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await params;

    // Look for analysis notes instead of Analysis table (fallback for production)
    const analysisNotes = await prisma.note.findMany({
      where: { 
        clientId,
        title: {
          contains: "Claude Analysis"
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert notes back to analysis format
    const analyses = analysisNotes.map(note => {
      try {
        const analysisData = JSON.parse(note.generalNotes || "{}");
        return {
          id: note.id,
          analysisData: analysisData.analysisData || {},
          rootCauses: analysisData.rootCauses || [],
          riskFactors: analysisData.riskFactors || [],
          priorityAreas: analysisData.priorityAreas || [],
          confidence: analysisData.confidence || 0.8,
          analysisDate: note.createdAt,
          version: analysisData.version || "1.0",
          protocolPhases: [],
          supplements: [],
          protocolHistory: [],
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      analyses,
      summary: {
        totalAnalyses: analyses.length,
        latestAnalysis: analyses[0] || null,
        totalSupplements: 0,
        totalPhases: 0,
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
