import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Protocol progress interfaces
interface ProgressSummary {
  currentWeek: number;
  totalWeeks: number;
  latestScores: {
    energy: number | null;
    sleep: number | null;
    digestion: number | null;
    wellbeing: number | null;
    compliance: {
      supplements: number | null;
      dietary: number | null;
      lifestyle: number | null;
    };
  };
  trends: {
    energyTrend: 'improving' | 'stable' | 'declining';
    sleepTrend: 'improving' | 'stable' | 'declining';
    digestionTrend: 'improving' | 'stable' | 'declining';
    wellbeingTrend: 'improving' | 'stable' | 'declining';
  };
}

const ProgressUpdateSchema = z.object({
  energyLevel: z.number().min(1).max(5).optional(),
  sleepQuality: z.number().min(1).max(5).optional(),
  digestionHealth: z.number().min(1).max(5).optional(),
  overallWellbeing: z.number().min(1).max(5).optional(),
  supplementCompliance: z.number().min(1).max(5).optional(),
  dietaryCompliance: z.number().min(1).max(5).optional(),
  lifestyleCompliance: z.number().min(1).max(5).optional(),
  symptomsNotes: z.string().optional(),
  challengesFaced: z.string().optional(),
  positiveChanges: z.string().optional(),
  questionsConcerns: z.string().optional(),
  weekNumber: z.number().min(1),
  submittedBy: z.enum(['client', 'practitioner']).default('practitioner'),
});

// GET - Fetch protocol progress history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: protocolId } = await params;

    // Verify protocol access
    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id: protocolId },
      include: { 
        client: true,
        protocolProgress: {
          orderBy: { weekNumber: 'asc' }
        },
        protocolStatusChanges: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    // Calculate progress summary
    const progressSummary = calculateProgressSummary(protocol.protocolProgress);

    return NextResponse.json({
      protocol: {
        id: protocol.id,
        name: protocol.protocolName,
        currentStatus: protocol.status,
        startDate: protocol.startDate,
        durationWeeks: protocol.durationWeeks,
        client: {
          id: protocol.client.id,
          name: `${protocol.client.firstName} ${protocol.client.lastName}`
        }
      },
      progressHistory: protocol.protocolProgress,
      statusHistory: protocol.protocolStatusChanges,
      progressSummary
    });

  } catch (error) {
    console.error('Error fetching protocol progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST - Create new progress entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuthToken(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: protocolId } = await params;
    const body = await request.json();
    
    const validation = ProgressUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid progress data', 
          details: validation.error.issues 
        }, 
        { status: 400 }
      );
    }

    const progressData = validation.data;

    // Verify protocol exists and get client info
    const protocol = await prisma.enhancedProtocol.findUnique({
      where: { id: protocolId },
      include: { client: true }
    });

    if (!protocol) {
      return NextResponse.json({ error: 'Protocol not found' }, { status: 404 });
    }

    // Create or update progress entry for this week
    const progressEntry = await prisma.protocolProgress.upsert({
      where: {
        protocolId_weekNumber: {
          protocolId,
          weekNumber: progressData.weekNumber
        }
      },
      update: {
        energyLevel: progressData.energyLevel,
        sleepQuality: progressData.sleepQuality,
        digestionHealth: progressData.digestionHealth,
        overallWellbeing: progressData.overallWellbeing,
        supplementCompliance: progressData.supplementCompliance,
        dietaryCompliance: progressData.dietaryCompliance,
        lifestyleCompliance: progressData.lifestyleCompliance,
        symptomsNotes: progressData.symptomsNotes,
        challengesFaced: progressData.challengesFaced,
        positiveChanges: progressData.positiveChanges,
        questionsConcerns: progressData.questionsConcerns,
        submittedBy: progressData.submittedBy,
        updatedAt: new Date(),
      },
      create: {
        protocolId,
        clientId: protocol.clientId,
        energyLevel: progressData.energyLevel,
        sleepQuality: progressData.sleepQuality,
        digestionHealth: progressData.digestionHealth,
        overallWellbeing: progressData.overallWellbeing,
        supplementCompliance: progressData.supplementCompliance,
        dietaryCompliance: progressData.dietaryCompliance,
        lifestyleCompliance: progressData.lifestyleCompliance,
        symptomsNotes: progressData.symptomsNotes,
        challengesFaced: progressData.challengesFaced,
        positiveChanges: progressData.positiveChanges,
        questionsConcerns: progressData.questionsConcerns,
        weekNumber: progressData.weekNumber,
        submittedBy: progressData.submittedBy,
        trackingDate: new Date(),
      }
    });

    console.log(`✅ Progress updated for protocol ${protocolId}, week ${progressData.weekNumber}`);

    return NextResponse.json({
      success: true,
      progressEntry
    });

  } catch (error) {
    console.error('Error updating protocol progress:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function calculateProgressSummary(progressHistory: Array<{
  weekNumber: number;
  energyLevel: number | null;
  sleepQuality: number | null;
  digestionHealth: number | null;
  overallWellbeing: number | null;
  supplementCompliance: number | null;
  dietaryCompliance: number | null;
  lifestyleCompliance: number | null;
}>): ProgressSummary | null {
  if (progressHistory.length === 0) return null;

  const latest = progressHistory[progressHistory.length - 1];
  
  return {
    currentWeek: latest.weekNumber,
    totalWeeks: progressHistory.length,
    latestScores: {
      energy: latest.energyLevel,
      sleep: latest.sleepQuality,
      digestion: latest.digestionHealth,
      wellbeing: latest.overallWellbeing,
      compliance: {
        supplements: latest.supplementCompliance,
        dietary: latest.dietaryCompliance,
        lifestyle: latest.lifestyleCompliance,
      }
    },
    trends: {
      energyTrend: calculateTrend(progressHistory.map(p => p.energyLevel).filter(Boolean)),
      sleepTrend: calculateTrend(progressHistory.map(p => p.sleepQuality).filter(Boolean)),
      digestionTrend: calculateTrend(progressHistory.map(p => p.digestionHealth).filter(Boolean)),
      wellbeingTrend: calculateTrend(progressHistory.map(p => p.overallWellbeing).filter(Boolean)),
    }
  };
}

function calculateTrend(values: number[]): 'improving' | 'stable' | 'declining' {
  if (values.length < 2) return 'stable';
  
  const first = values[0];
  const last = values[values.length - 1];
  const diff = last - first;
  
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}
