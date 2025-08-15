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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;
    const body = await request.json();
    const { questionId, value, text, confidence } = body;

    if (!questionId || value === undefined) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'MISSING_RESPONSE_DATA',
          message: 'Question ID and response value are required'
        }
      }, { status: 400 });
    }

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

    if (assessment.status !== 'IN_PROGRESS' && assessment.status !== 'PAUSED') {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'ASSESSMENT_NOT_ACTIVE',
          message: 'Assessment is not active'
        }
      }, { status: 400 });
    }

    // Check if question was already answered (prevent duplicates)
    const existingResponse = await prisma.clientResponse.findFirst({
      where: {
        assessmentId,
        questionId
      }
    });

    if (existingResponse) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'QUESTION_ALREADY_ANSWERED',
          message: 'This question has already been answered'
        }
      }, { status: 400 });
    }

    // Save the response
    await assessmentService.saveResponse(assessmentId, questionId, {
      value,
      text,
      confidence
    });

    // Get updated progress
    const updatedAssessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId }
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        saved: true,
        progress: {
          questionsAsked: updatedAssessment?.questionsAsked || 0,
          completionRate: updatedAssessment?.completionRate || 0
        }
      }
    });

  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: {
        code: 'SAVE_RESPONSE_ERROR',
        message: 'Failed to save response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}
