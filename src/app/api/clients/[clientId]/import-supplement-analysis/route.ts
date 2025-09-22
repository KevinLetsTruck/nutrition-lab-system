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

    // Create analysis record
    const analysis = await prisma.analysis.create({
      data: {
        id: randomBytes(12).toString('hex'),
        clientId,
        analysisType: 'SUPPLEMENT_RECOMMENDATION',
        analysisData: {
          structuredSupplementData: supplementData,
          originalAnalysis: analysisText,
          importType: 'structured_json'
        },
        rootCauses: supplementData.supplements?.map((s: any) => s.rationale) || [],
        priorityAreas: supplementData.supplements?.filter((s: any) => s.priority === 'CRITICAL').map((s: any) => s.name) || [],
        confidence: 0.95, // High confidence for structured data
        analysisDate: new Date(),
        version: "3.0.0",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create supplement records
    const createdSupplements = [];
    if (supplementData.supplements) {
      for (const supplement of supplementData.supplements) {
        const supplementRecord = await prisma.supplement.create({
          data: {
            id: randomBytes(12).toString('hex'),
            clientId,
            analysisId: analysis.id,
            name: supplement.name,
            brand: supplement.brand || 'Unknown',
            dosage: supplement.dosage,
            timing: supplement.timing,
            duration: supplement.duration,
            priority: mapPriority(supplement.priority),
            category: supplement.category || 'General',
            rationale: supplement.rationale,
            phase: supplement.phase || 'PHASE1',
            estimatedCost: supplement.estimatedCost || 0,
            interactions: supplement.interactions,
            contraindications: supplement.contraindications,
            status: 'RECOMMENDED',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        createdSupplements.push(supplementRecord);
      }
    }

    // Update client with latest supplement analysis
    await prisma.client.update({
      where: { id: clientId },
      data: {
        healthGoals: {
          ...client.healthGoals,
          latestSupplementAnalysis: supplementData,
          supplementAnalysisDate: new Date().toISOString(),
          totalMonthlyCost: supplementData.totalMonthlyCost,
          medicationWarnings: supplementData.medicationWarnings
        },
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Structured supplement analysis imported successfully",
      analysisId: analysis.id,
      supplementsCreated: createdSupplements.length,
      totalMonthlyCost: supplementData.totalMonthlyCost,
      medicationWarnings: supplementData.medicationWarnings?.length || 0,
      phaseTimeline: supplementData.phaseTimeline
    });

  } catch (error) {
    console.error("Import supplement analysis error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Import failed",
        details: "Failed to parse structured supplement data"
      },
      { status: 500 }
    );
  }
}

// Parse structured JSON from Claude analysis
function parseSupplementJSON(analysisText: string): any | null {
  try {
    // Look for JSON blocks in the analysis
    const jsonPattern = /```json\s*([\s\S]*?)\s*```/g;
    const matches = analysisText.match(jsonPattern);
    
    if (!matches) {
      // Try to find JSON without code blocks
      const directJsonPattern = /\{[\s\S]*"supplements"[\s\S]*\}/;
      const directMatch = analysisText.match(directJsonPattern);
      if (directMatch) {
        return JSON.parse(directMatch[0]);
      }
      return null;
    }

    // Parse the first JSON block found
    const jsonContent = matches[0].replace(/```json\s*/, '').replace(/\s*```/, '');
    const parsedData = JSON.parse(jsonContent);
    
    // Validate structure
    if (parsedData.supplements && Array.isArray(parsedData.supplements)) {
      return parsedData;
    }
    
    return null;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return null;
  }
}

// Map priority strings to enum values
function mapPriority(priority: string): string {
  const priorityMap: { [key: string]: string } = {
    'CRITICAL': 'CRITICAL',
    'HIGH': 'HIGH', 
    'MEDIUM': 'MEDIUM',
    'LOW': 'LOW'
  };
  
  return priorityMap[priority?.toUpperCase()] || 'MEDIUM';
}
