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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId }
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

    if (assessment.status !== 'IN_PROGRESS') {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'CANNOT_PAUSE',
          message: 'Only active assessments can be paused'
        }
      }, { status: 400 });
    }

    // Pause the assessment
    const updated = await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: 'PAUSED',
        pausedAt: new Date()
      }
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        status: updated.status,
        pausedAt: updated.pausedAt,
        questionsAsked: updated.questionsAsked,
        completionRate: updated.completionRate
      }
    });

  } catch (error) {
    console.error('Error pausing assessment:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: {
        code: 'PAUSE_ERROR',
        message: 'Failed to pause assessment'
      }
    }, { status: 500 });
  }
}
