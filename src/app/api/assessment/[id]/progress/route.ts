import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

const MODULE_TOTALS = {
  SCREENING: 75,
  ASSIMILATION: 65,
  DEFENSE_REPAIR: 60,
  ENERGY: 70,
  BIOTRANSFORMATION: 55,
  TRANSPORT: 50,
  COMMUNICATION: 75,
  STRUCTURAL: 45
};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessmentId = params.id;

    // Get assessment with responses
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        clientId: session.user.id
      },
      include: {
        responses: {
          select: {
            id: true,
            questionModule: true,
            responseType: true,
            answeredAt: true
          },
          orderBy: { answeredAt: 'asc' }
        },
        assessmentTemplate: {
          select: {
            name: true,
            description: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate module-specific progress
    const moduleProgress: Record<string, {
      answered: number;
      total: number;
      percentage: number;
    }> = {};

    // Initialize all modules
    Object.entries(MODULE_TOTALS).forEach(([module, total]) => {
      moduleProgress[module] = {
        answered: 0,
        total,
        percentage: 0
      };
    });

    // Count responses per module
    assessment.responses.forEach(response => {
      if (moduleProgress[response.questionModule]) {
        moduleProgress[response.questionModule].answered++;
      }
    });

    // Calculate percentages
    Object.keys(moduleProgress).forEach(module => {
      const { answered, total } = moduleProgress[module];
      moduleProgress[module].percentage = Math.round((answered / total) * 100);
    });

    // Calculate overall progress
    const totalQuestions = Object.values(MODULE_TOTALS).reduce((sum, count) => sum + count, 0);
    const overallPercentage = Math.round((assessment.questionsAsked / totalQuestions) * 100);

    // Determine estimated time remaining
    const averageTimePerQuestion = 30; // seconds
    const remainingQuestions = totalQuestions - assessment.questionsAsked;
    const estimatedMinutesRemaining = Math.ceil((remainingQuestions * averageTimePerQuestion) / 60);

    // Calculate AI efficiency
    const potentialQuestions = assessment.questionsAsked + (assessment.questionsSaved || 0);
    const efficiencyRate = potentialQuestions > 0 
      ? Math.round(((assessment.questionsSaved || 0) / potentialQuestions) * 100)
      : 0;

    const progressData = {
      assessmentId,
      assessmentName: assessment.assessmentTemplate?.name || 'Health Assessment',
      status: assessment.status,
      startedAt: assessment.startedAt,
      lastActiveAt: assessment.lastActiveAt,
      completedAt: assessment.completedAt,
      
      // Current state
      currentModule: assessment.currentModule,
      currentModuleProgress: moduleProgress[assessment.currentModule],
      
      // Overall progress
      questionsAsked: assessment.questionsAsked,
      questionsSaved: assessment.questionsSaved || 0,
      totalQuestions,
      overallPercentage,
      
      // Module breakdown
      moduleProgress,
      
      // Time estimates
      estimatedMinutesRemaining,
      sessionDuration: assessment.startedAt 
        ? Math.round((new Date().getTime() - new Date(assessment.startedAt).getTime()) / 1000 / 60)
        : 0,
      
      // AI efficiency
      efficiencyRate,
      efficiencyMessage: efficiencyRate > 0 
        ? `AI has saved you ${assessment.questionsSaved} questions (${efficiencyRate}% reduction)`
        : 'AI is analyzing your responses to optimize the assessment',
      
      // Response history
      totalResponses: assessment.responses.length,
      lastResponseAt: assessment.responses.length > 0 
        ? assessment.responses[assessment.responses.length - 1].answeredAt
        : null
    };

    return NextResponse.json({
      success: true,
      data: progressData
    });

  } catch (error) {
    console.error('Error fetching assessment progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch assessment progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}