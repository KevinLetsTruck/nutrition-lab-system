import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Protocol data interfaces
interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  duration?: string;
  notes?: string;
  phase?: string;
}

interface ProtocolDataType {
  analysisDate: string;
  rootCauseAnalysis: string;
  systemPriorities: string[];
  phase1Protocol: {
    supplements: Supplement[];
    dietaryChanges: string[];
    lifestyleModifications: string[];
    duration: string;
  };
  phase2Protocol?: {
    supplements: Supplement[];
    additionalInterventions: string[];
    duration: string;
  };
  phase3Protocol?: {
    maintenanceSupplements: Supplement[];
    longTermRecommendations: string[];
  };
  monitoringPlan: {
    keyBiomarkers: string[];
    retestingSchedule: string;
    progressIndicators: string[];
    warningSignsToWatch: string[];
  };
  practitionerNotes?: string;
}

const SupplementSchema = z.object({
  name: z.string(),
  dosage: z.string(),
  timing: z.string(),
  duration: z.string().optional(),
  notes: z.string().optional(),
});

const ProtocolImportSchema = z.object({
  clientId: z.string().cuid(),
  protocolData: z.object({
    analysisDate: z.string(),
    rootCauseAnalysis: z.string(),
    systemPriorities: z.array(z.string()),
    phase1Protocol: z.object({
      supplements: z.array(SupplementSchema),
      dietaryChanges: z.array(z.string()),
      lifestyleModifications: z.array(z.string()),
      duration: z.string(),
    }),
    phase2Protocol: z.object({
      supplements: z.array(SupplementSchema),
      additionalInterventions: z.array(z.string()),
      duration: z.string(),
    }).optional(),
    phase3Protocol: z.object({
      maintenanceSupplements: z.array(SupplementSchema),
      longTermRecommendations: z.array(z.string()),
    }).optional(),
    monitoringPlan: z.object({
      keyBiomarkers: z.array(z.string()),
      retestingSchedule: z.string(),
      progressIndicators: z.array(z.string()),
      warningSignsToWatch: z.array(z.string()),
    }),
    practitionerNotes: z.string().optional(),
  }),
  formatOptions: z.object({
    generateCoachingNotes: z.boolean().default(true),
    generateClientLetter: z.boolean().default(true),
    generateSupplementList: z.boolean().default(true),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = ProtocolImportSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Validation errors:', validation.error.issues);
      return NextResponse.json(
        { 
          error: 'Invalid protocol data format',
          details: validation.error.issues 
        }, 
        { status: 400 }
      );
    }

    const { clientId, protocolData, formatOptions } = validation.data;

    // Verify client exists and user has access
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create enhanced protocol record
    const protocol = await prisma.enhancedProtocol.create({
      data: {
        clientId,
        protocolName: `Claude Analysis Protocol - ${new Date().toLocaleDateString()}`,
        protocolPhase: 'Phase 1',
        
        // Store structured protocol data
        supplements: protocolData.phase1Protocol.supplements as object,
        dietaryGuidelines: protocolData.phase1Protocol.dietaryChanges as object,
        lifestyleModifications: protocolData.phase1Protocol.lifestyleModifications as object,
        monitoringRequirements: protocolData.monitoringPlan as object,
        
        // Timeline information
        startDate: new Date(),
        durationWeeks: extractDurationWeeks(protocolData.phase1Protocol.duration),
        status: 'planned',
        
        // Clinical context
        clinicalFocus: protocolData.systemPriorities.join(', '),
        protocolNotes: protocolData.rootCauseAnalysis,
        
        // Store full import data for reference
        brandingConfig: {
          importedFrom: 'Claude Desktop',
          importDate: new Date().toISOString(),
          fullProtocolData: protocolData,
          formatOptions: formatOptions || {}
        } as object,
      },
    });

    // Create individual supplement records for structured tracking
    const allSupplements = extractAllSupplements(protocolData);
    
    if (allSupplements.length > 0) {
      await prisma.protocolSupplement.createMany({
        data: allSupplements.map((supplement, index) => ({
          protocolId: protocol.id,
          productName: supplement.name,
          dosage: supplement.dosage,
          timing: supplement.timing,
          purpose: supplement.phase,
          priority: index + 1,
          startDate: new Date(),
          endDate: supplement.duration ? calculateEndDate(supplement.duration) : null,
        }))
      });
    }

    // Generate formatted outputs using protocol formatters
    const { generateCoachingNotes, generateClientLetter, generateSupplementList } = await import('@/lib/protocol-formatters');
    
    const formattedOutputs: Record<string, string> = {};

    if (formatOptions?.generateCoachingNotes) {
      formattedOutputs.coachingNotes = await generateCoachingNotes(client, protocolData);
    }

    if (formatOptions?.generateClientLetter) {
      formattedOutputs.clientLetter = await generateClientLetter(client, protocolData);
    }

    if (formatOptions?.generateSupplementList) {
      formattedOutputs.supplementList = await generateSupplementList(protocolData);
    }

    // Create protocol generation record for tracking
    await prisma.protocolGeneration.create({
      data: {
        protocolId: protocol.id,
        clientId,
        generationData: {
          formatOptions: formatOptions || {},
          documentsGenerated: Object.keys(formattedOutputs),
          generatedAt: new Date().toISOString(),
        } as object,
      },
    });

    console.log(`✅ Protocol imported successfully for client ${clientId}`);

    return NextResponse.json({
      success: true,
      protocolId: protocol.id,
      formattedOutputs,
    });

  } catch (error) {
    console.error('Protocol import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import protocol',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function extractAllSupplements(protocolData: ProtocolDataType) {
  const supplements = [];
  
  // Phase 1 supplements
  if (protocolData.phase1Protocol?.supplements) {
    supplements.push(...protocolData.phase1Protocol.supplements.map((s: Supplement) => ({
      ...s,
      phase: 'Phase 1'
    })));
  }
  
  // Phase 2 supplements
  if (protocolData.phase2Protocol?.supplements) {
    supplements.push(...protocolData.phase2Protocol.supplements.map((s: Supplement) => ({
      ...s,
      phase: 'Phase 2'
    })));
  }
  
  // Phase 3 maintenance supplements
  if (protocolData.phase3Protocol?.maintenanceSupplements) {
    supplements.push(...protocolData.phase3Protocol.maintenanceSupplements.map((s: Supplement) => ({
      ...s,
      phase: 'Maintenance'
    })));
  }
  
  return supplements;
}

function extractDurationWeeks(duration: string): number {
  // Parse duration strings like "4-6 weeks", "2 months", etc.
  const matches = duration.match(/(\d+)(?:-\d+)?\s*(week|month)/i);
  if (!matches) return 4; // Default to 4 weeks
  
  const number = parseInt(matches[1]);
  const unit = matches[2].toLowerCase();
  
  if (unit === 'month') {
    return number * 4; // Convert months to weeks
  }
  
  return number;
}

function calculateEndDate(duration: string): Date | null {
  const weeks = extractDurationWeeks(duration);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (weeks * 7));
  return endDate;
}
