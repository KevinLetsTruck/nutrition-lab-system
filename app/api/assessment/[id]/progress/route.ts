import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: {
          select: {
            questionModule: true
          }
        },
        template: true
      }
    });

    if (!assessment) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'ASSESSMENT_NOT_FOUND',
          message: 'Assessment not found'
        }
      }, { status: 404 });
    }

    // Calculate module progress
    const moduleProgress = assessment.responses.reduce((acc, r) => {
      acc[r.questionModule] = (acc[r.questionModule] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Estimate time remaining (2 minutes per question average)
    const estimatedQuestionsRemaining = Math.max(0, 150 - assessment.questionsAsked);
    const estimatedMinutesRemaining = estimatedQuestionsRemaining * 2;

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        status: assessment.status,
        currentModule: assessment.currentModule,
        questionsAsked: assessment.questionsAsked,
        questionsSaved: assessment.questionsSaved,
        completionRate: assessment.completionRate,
        moduleProgress,
        estimatedMinutesRemaining,
        startedAt: assessment.startedAt,
        lastActiveAt: assessment.lastActiveAt,
        pausedAt: assessment.pausedAt,
        completedAt: assessment.completedAt
      }
    });

  } catch (error) {
    console.error('Error getting progress:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: {
        code: 'PROGRESS_ERROR',
        message: 'Failed to get assessment progress'
      }
    }, { status: 500 });
  }
}
