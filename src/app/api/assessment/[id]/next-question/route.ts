import { NextRequest, NextResponse } from 'next/server';
import { assessmentService } from '@/lib/assessment/assessment-service';
import { prisma } from '@/lib/db/prisma';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    // Verify assessment exists and is active
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

    if (assessment.status === 'COMPLETED') {
      return NextResponse.json<APIResponse>({
        success: true,
        data: {
          completed: true,
          message: 'Assessment is already completed'
        }
      });
    }

    if (assessment.status === 'ABANDONED') {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'ASSESSMENT_ABANDONED',
          message: 'This assessment has been abandoned'
        }
      }, { status: 400 });
    }

    // Get next question from AI service
    const question = await assessmentService.getNextQuestion(assessmentId);

    if (!question) {
      // No more questions - assessment complete
      await assessmentService.completeAssessment(assessmentId);
      
      return NextResponse.json<APIResponse>({
        success: true,
        data: {
          completed: true,
          message: 'Assessment completed successfully'
        }
      });
    }

    // Get module progress
    const moduleQuestions = await prisma.clientResponse.findMany({
      where: {
        assessmentId,
        questionModule: assessment.currentModule
      }
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        question: {
          id: question.id,
          text: question.text,
          type: question.type,
          module: question.module,
          category: question.category,
          options: question.options,
          helpText: question.helpText,
          required: question.required
        },
        progress: {
          currentModule: assessment.currentModule,
          moduleProgress: moduleQuestions.length,
          overallProgress: assessment.completionRate,
          questionsAsked: assessment.questionsAsked
        }
      }
    });

  } catch (error) {
    console.error('Error getting next question:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: {
        code: 'NEXT_QUESTION_ERROR',
        message: 'Failed to get next question',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}
