import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { randomBytes } from "crypto";

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

    const { clientId } = params;
    const body = await request.json();

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Get recent documents to link to this analysis
    const recentDocuments = await prisma.document.findMany({
      where: {
        clientId,
        uploadedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: { id: true, fileName: true, uploadedAt: true },
    }).catch(() => []); // Fallback if document table issues

    // Create analysis history in client healthGoals (works with existing schema)
    const existingHealthGoals = client.healthGoals as any || {};
    const analysisHistory = existingHealthGoals.analysisHistory || [];
    
    // Determine analysis type
    const analysisType = analysisHistory.length === 0 ? "INITIAL" : "FOLLOW_UP";
    const triggerEvent = recentDocuments.length > 0
      ? `New documents uploaded: ${recentDocuments.map(d => d.fileName).join(', ')}`
      : "Manual analysis import";

    // Create new analysis record for history
    const newAnalysisRecord = {
      id: randomBytes(12).toString("hex"),
      analysisData: body.analysisData,
      analysisType,
      triggerEvent,
      relatedDocuments: recentDocuments.map(d => d.id),
      analysisDate: new Date().toISOString(),
      version: body.version || "2.0.0",
      confidence: calculateConfidence(body.analysisData?.content || ""),
      rootCauses: extractRootCauses(body.analysisData?.content || ""),
      priorityAreas: extractPriorityAreas(body.analysisData?.content || "")
    };

    // Add to analysis history (preserves all previous analyses)
    analysisHistory.push(newAnalysisRecord);

    // Update client with new analysis and preserved history
    await prisma.client.update({
      where: { id: clientId },
      data: {
        healthGoals: {
          ...existingHealthGoals,
          claudeAnalysis: body.analysisData, // Latest analysis (backward compatibility)
          analysisDate: new Date().toISOString(),
          analysisVersion: body.version || "2.0.0",
          analysisHistory, // Complete history of all analyses
          totalAnalyses: analysisHistory.length,
          latestAnalysisType: analysisType
        },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Analysis imported successfully",
      clientId: clientId,
      analysisId: newAnalysisRecord.id,
      analysisType,
      analysisDate: new Date().toISOString(),
      relatedDocuments: recentDocuments.length,
      preservedPreviousAnalyses: analysisHistory.length - 1,
      totalAnalyses: analysisHistory.length
    });
  } catch (error) {
    console.error("Import analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
      },
      { status: 500 }
    );
  }
}

// Helper functions for analysis processing
function extractRootCauses(content: string): string[] {
  const causes: string[] = [];

  // Look for common patterns in Claude analysis
  const patterns = [
    /root causes?[:\-\s]*(.*?)(?=\n\n|\n[A-Z]|$)/gis,
    /underlying causes?[:\-\s]*(.*?)(?=\n\n|\n[A-Z]|$)/gis,
    /primary causes?[:\-\s]*(.*?)(?=\n\n|\n[A-Z]|$)/gis,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const lines = match.split("\n").filter((line) => line.trim());
        lines.forEach((line) => {
          const cleaned = line.replace(/^[•\-\*\d\.]+\s*/, "").trim();
          if (cleaned.length > 10 && !causes.includes(cleaned)) {
            causes.push(cleaned);
          }
        });
      });
    }
  });

  return causes.slice(0, 10); // Limit to top 10
}

function extractPriorityAreas(content: string): string[] {
  const areas: string[] = [];

  const patterns = [
    /priority areas?[:\-\s]*(.*?)(?=\n\n|\n[A-Z]|$)/gis,
    /focus areas?[:\-\s]*(.*?)(?=\n\n|\n[A-Z]|$)/gis,
    /intervention areas?[:\-\s]*(.*?)(?=\n\n|\n[A-Z]|$)/gis,
  ];

  patterns.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const lines = match.split("\n").filter((line) => line.trim());
        lines.forEach((line) => {
          const cleaned = line.replace(/^[•\-\*\d\.]+\s*/, "").trim();
          if (cleaned.length > 5 && !areas.includes(cleaned)) {
            areas.push(cleaned);
          }
        });
      });
    }
  });

  return areas.slice(0, 8); // Limit to top 8
}

function calculateConfidence(content: string): number {
  // Simple confidence calculation based on content quality
  let confidence = 0.5; // Base confidence

  // Increase confidence based on content indicators
  if (content.includes("lab results") || content.includes("laboratory"))
    confidence += 0.1;
  if (content.includes("symptoms") || content.includes("symptom"))
    confidence += 0.1;
  if (content.includes("protocol") || content.includes("recommendations"))
    confidence += 0.1;
  if (content.includes("root cause") || content.includes("underlying"))
    confidence += 0.1;
  if (content.length > 1000) confidence += 0.1; // Detailed analysis
  if (content.length > 5000) confidence += 0.1; // Very detailed analysis

  return Math.min(confidence, 1.0); // Cap at 1.0
}
