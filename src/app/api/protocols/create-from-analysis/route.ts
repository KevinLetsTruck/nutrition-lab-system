import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";

// Response type for consistent API responses
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interface for extracted supplement information
interface ExtractedSupplement {
  name: string;
  dosage: string;
  timing: string;
  purpose?: string;
  priority: number;
}

/**
 * Extract supplements from Claude analysis text
 * Looks for supplement recommendations in various formats
 */
function extractSupplementsFromAnalysis(analysisText: string): ExtractedSupplement[] {
  const supplements: ExtractedSupplement[] = [];
  
  // Common patterns for supplement recommendations
  const supplementPatterns = [
    // Pattern: "Supplement Name: dosage timing"
    /([A-Za-z0-9\s\-]+):\s*([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml))\s*([^.\n]*)/gi,
    
    // Pattern: "Take X mg of Supplement Name timing"
    /(?:take|recommend|suggest)\s+([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml))\s+(?:of\s+)?([A-Za-z0-9\s\-]+)\s*([^.\n]*)/gi,
    
    // Pattern: "Supplement Name (dosage) timing"
    /([A-Za-z0-9\s\-]+)\s*\(([0-9]+(?:\.[0-9]+)?\s*(?:mg|g|mcg|IU|capsules?|tablets?|drops?|ml))\)\s*([^.\n]*)/gi
  ];

  let priority = 1;
  
  for (const pattern of supplementPatterns) {
    let match;
    while ((match = pattern.exec(analysisText)) !== null) {
      const [_, name, dosage, timing] = match;
      
      // Clean up the extracted data
      const cleanName = name.trim().replace(/[:\-()]/g, '');
      const cleanDosage = dosage.trim();
      const cleanTiming = timing.trim().replace(/[.\n]/g, '').substring(0, 100);
      
      // Skip if name is too short or looks like a sentence
      if (cleanName.length < 3 || cleanName.split(' ').length > 5) continue;
      
      // Check if supplement already exists
      const existingIndex = supplements.findIndex(s => 
        s.name.toLowerCase() === cleanName.toLowerCase()
      );
      
      if (existingIndex === -1) {
        supplements.push({
          name: cleanName,
          dosage: cleanDosage,
          timing: cleanTiming || 'as directed',
          priority: priority++,
        });
      }
    }
  }
  
  // Also look for common supplements mentioned without specific dosage
  const commonSupplements = [
    'Probiotics', 'Vitamin D3', 'Magnesium', 'Omega-3', 'B-Complex',
    'Vitamin C', 'Zinc', 'Iron', 'Calcium', 'CoQ10', 'Glutamine',
    'NAC', 'Digestive Enzymes', 'Ashwagandha', 'Rhodiola'
  ];
  
  for (const supplement of commonSupplements) {
    const regex = new RegExp(`\\b${supplement}\\b`, 'gi');
    if (regex.test(analysisText) && !supplements.some(s => 
      s.name.toLowerCase().includes(supplement.toLowerCase())
    )) {
      supplements.push({
        name: supplement,
        dosage: 'as recommended',
        timing: 'as directed',
        priority: priority++,
      });
    }
  }
  
  return supplements.slice(0, 20); // Limit to 20 supplements
}

/**
 * Extract greeting and clinical focus from analysis
 */
function extractProtocolMetadata(analysisText: string, clientName: string) {
  // Generate personalized greeting
  const greeting = `Dear ${clientName},

Based on your comprehensive functional medicine assessment, I've created this personalized protocol to address your unique health needs and support your wellness journey.`;

  // Extract clinical focus from executive summary or first paragraph
  let clinicalFocus = '';
  
  // Look for executive summary section
  const executiveSummaryMatch = analysisText.match(/executive summary[:\n]([^#\n]*(?:\n[^#\n]*)*)/i);
  if (executiveSummaryMatch) {
    clinicalFocus = executiveSummaryMatch[1].trim().substring(0, 300) + '...';
  }
  
  // Fallback: look for first paragraph that mentions health concerns
  if (!clinicalFocus) {
    const healthConcernMatch = analysisText.match(/(primary concerns?|main issues?|key findings?)[:\n]([^#\n]*(?:\n[^#\n]*)*)/i);
    if (healthConcernMatch) {
      clinicalFocus = healthConcernMatch[2].trim().substring(0, 300) + '...';
    }
  }
  
  // Final fallback
  if (!clinicalFocus) {
    clinicalFocus = 'Comprehensive functional medicine approach to address identified health patterns and optimize overall wellness.';
  }
  
  return { greeting, clinicalFocus };
}

/**
 * POST /api/protocols/create-from-analysis
 * Create a protocol from existing Claude analysis data
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.analysisId || !body.protocolName) {
      return NextResponse.json<APIResponse>(
        {
          success: false,
          error: "Missing required fields: analysisId, protocolName",
        },
        { status: 400 }
      );
    }

    // Fetch the analysis with client data
    const analysis = await prisma.clientAnalysis.findUnique({
      where: { id: body.analysisId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json<APIResponse>(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    const clientName = `${analysis.client.firstName} ${analysis.client.lastName}`;
    
    // Extract supplements from analysis text
    const extractedSupplements = extractSupplementsFromAnalysis(analysis.fullAnalysis);
    
    // Extract metadata
    const { greeting, clinicalFocus } = extractProtocolMetadata(analysis.fullAnalysis, clientName);
    
    // Extract dietary guidelines from analysis
    let dietaryGuidelines = null;
    const dietaryMatch = analysis.fullAnalysis.match(/diet[ary]*\s*(?:recommendations?|guidelines?)[:\n]([^#]*?)(?=\n#|\n\n[A-Z]|$)/i);
    if (dietaryMatch) {
      dietaryGuidelines = {
        recommendations: dietaryMatch[1].trim().split('\n').filter(line => line.trim()),
        extractedFrom: 'analysis'
      };
    }
    
    // Extract lifestyle modifications
    let lifestyleModifications = null;
    const lifestyleMatch = analysis.fullAnalysis.match(/lifestyle\s*(?:modifications?|recommendations?)[:\n]([^#]*?)(?=\n#|\n\n[A-Z]|$)/i);
    if (lifestyleMatch) {
      lifestyleModifications = {
        recommendations: lifestyleMatch[1].trim().split('\n').filter(line => line.trim()),
        extractedFrom: 'analysis'
      };
    }

    // Create priority supplements JSON
    const prioritySupplements = extractedSupplements.slice(0, 5).map(supplement => ({
      name: supplement.name,
      dosage: supplement.dosage,
      timing: supplement.timing,
      priority: supplement.priority,
    }));

    // Use transaction to create protocol and related data
    const protocol = await prisma.$transaction(async (tx) => {
      // Create the main protocol
      const newProtocol = await tx.enhancedProtocol.create({
        data: {
          clientId: analysis.clientId,
          analysisId: analysis.id,
          protocolName: body.protocolName,
          protocolPhase: body.protocolPhase || "Phase 1",
          supplements: {
            total: extractedSupplements.length,
            categories: ['Core Supplements', 'Targeted Support'],
            extractedFrom: 'analysis'
          },
          dietaryGuidelines,
          lifestyleModifications,
          monitoringRequirements: {
            followUpWeeks: [2, 4, 8, 12],
            keyMetrics: ['symptoms', 'energy', 'digestion', 'sleep'],
            extractedFrom: 'analysis'
          },
          startDate: body.startDate ? new Date(body.startDate) : new Date(),
          durationWeeks: body.durationWeeks || 12,
          status: body.status || "planned",
          greeting,
          clinicalFocus,
          currentStatus: "Protocol created from analysis - ready for review",
          prioritySupplements,
          dailySchedule: body.dailySchedule || {
            morning: "8:00 AM",
            evening: "6:00 PM",
            description: "Standard morning and evening routine"
          },
          protocolNotes: `Auto-generated from Claude analysis on ${new Date().toISOString().split('T')[0]}. ${extractedSupplements.length} supplements extracted. Please review and customize as needed.`,
          brandingConfig: {
            theme: 'professional',
            includeGreeting: true,
            includeClinicLogo: true,
            extractedFrom: 'analysis'
          },
        },
      });

      // Create associated supplements
      if (extractedSupplements.length > 0) {
        await tx.protocolSupplement.createMany({
          data: extractedSupplements.map((supplement) => ({
            protocolId: newProtocol.id,
            productName: supplement.name,
            dosage: supplement.dosage,
            timing: supplement.timing,
            purpose: supplement.purpose || 'As recommended in analysis',
            priority: supplement.priority,
            isActive: true,
            startDate: body.startDate ? new Date(body.startDate) : new Date(),
          })),
        });
      }

      return newProtocol;
    });

    // Fetch the created protocol with related data
    const protocolWithData = await prisma.enhancedProtocol.findUnique({
      where: { id: protocol.id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        analysis: {
          select: {
            id: true,
            analysisDate: true,
            analysisVersion: true,
          },
        },
        protocolSupplements: {
          orderBy: { priority: "asc" },
        },
        protocolGenerations: true,
      },
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        protocol: protocolWithData,
        extractedSupplementsCount: extractedSupplements.length,
        metadata: {
          greeting: !!greeting,
          clinicalFocus: !!clinicalFocus,
          dietaryGuidelines: !!dietaryGuidelines,
          lifestyleModifications: !!lifestyleModifications,
        },
      },
    });

  } catch (error: any) {
    console.error("Error creating protocol from analysis:", error);
    return NextResponse.json<APIResponse>(
      {
        success: false,
        error: "Failed to create protocol from analysis",
      },
      { status: 500 }
    );
  }
}
