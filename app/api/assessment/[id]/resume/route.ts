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
      where: { id: assessmentId },
      include: {
        responses: {
          select: {
            id: true,
            questionId: true
          }
        }
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

    if (assessment.status !== 'PAUSED') {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'CANNOT_RESUME',
          message: 'Only paused assessments can be resumed'
        }
      }, { status: 400 });
    }

    // Resume the assessment
    const updated = await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: 'IN_PROGRESS',
        lastActiveAt: new Date()
      }
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        status: updated.status,
        currentModule: updated.currentModule,
        questionsAnswered: assessment.responses.length,
        completionRate: updated.completionRate,
        aiContext: updated.aiContext // Restore AI context for continuity
      }
    });

  } catch (error) {
    console.error('Error resuming assessment:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: {
        code: 'RESUME_ERROR',
        message: 'Failed to resume assessment'
      }
    }, { status: 500 });
  }
}
