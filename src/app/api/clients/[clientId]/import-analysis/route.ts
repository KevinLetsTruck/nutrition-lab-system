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
    });

    // Check for previous analyses to determine type
    const previousAnalyses = await prisma.analysis.findMany({
      where: { clientId },
      orderBy: { analysisDate: "desc" },
      take: 1,
    });

    const analysisType =
      previousAnalyses.length === 0 ? "INITIAL" : "FOLLOW_UP";
    const triggerEvent =
      recentDocuments.length > 0
        ? `New documents uploaded: ${recentDocuments
            .map((d) => d.fileName)
            .join(", ")}`
        : "Manual analysis import";

    // Extract key data from analysis content
    const analysisContent = body.analysisData?.content || "";
    const rootCauses = extractRootCauses(analysisContent);
    const priorityAreas = extractPriorityAreas(analysisContent);

    // Create new Analysis record (don't overwrite!)
    const newAnalysis = await prisma.analysis.create({
      data: {
        id: randomBytes(12).toString("hex"),
        clientId,
        analysisData: body.analysisData,
        rootCauses,
        priorityAreas,
        confidence: calculateConfidence(analysisContent),
        analysisDate: new Date(),
        version: body.version || "2.0.0",
        analysisType,
        triggerEvent,
        relatedDocuments: recentDocuments.map((d) => d.id),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Also update client healthGoals for backward compatibility
    await prisma.client.update({
      where: { id: clientId },
      data: {
        healthGoals: {
          ...client.healthGoals,
          claudeAnalysis: body.analysisData,
          analysisDate: new Date().toISOString(),
          analysisVersion: body.version || "2.0.0",
          latestAnalysisId: newAnalysis.id, // Link to latest analysis
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Analysis imported successfully",
      clientId: clientId,
      analysisId: newAnalysis.id,
      analysisType,
      analysisDate: new Date().toISOString(),
      relatedDocuments: recentDocuments.length,
      preservedPreviousAnalyses: previousAnalyses.length,
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
