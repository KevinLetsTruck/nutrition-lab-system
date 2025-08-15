import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth-helpers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authenticated user
    const session = await auth(req);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: assessmentId } = await params;

    // Verify assessment belongs to user and is in progress
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        clientId: session.user.id,
        status: 'IN_PROGRESS'
      },
      include: {
        responses: {
          select: {
            id: true,
            questionModule: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found or not in progress' },
        { status: 404 }
      );
    }

    // Calculate progress stats for pause summary
    const moduleResponseCounts = assessment.responses.reduce((acc, response) => {
      acc[response.questionModule] = (acc[response.questionModule] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Update assessment status to PAUSED
    const updatedAssessment = await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: 'PAUSED',
        lastActiveAt: new Date(),
        aiContext: {
          ...(assessment.aiContext as any || {}),
          pausedAt: new Date(),
          pauseCount: ((assessment.aiContext as any)?.pauseCount || 0) + 1,
          progressAtPause: {
            questionsAsked: assessment.questionsAsked,
            questionsSaved: assessment.questionsSaved,
            currentModule: assessment.currentModule,
            moduleResponseCounts
          }
        }
      }
    });

    // Log the pause action
    console.log(`Assessment ${assessmentId} paused by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      data: {
        assessmentId,
        status: 'PAUSED',
        questionsAnswered: assessment.responses.length,
        questionsAsked: assessment.questionsAsked,
        questionsSaved: assessment.questionsSaved || 0,
        currentModule: assessment.currentModule,
        progressPercentage: Math.round((assessment.questionsAsked / 400) * 100),
        message: 'Assessment saved successfully. You can resume anytime.'
      }
    });

  } catch (error) {
    console.error('Error pausing assessment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to pause assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}