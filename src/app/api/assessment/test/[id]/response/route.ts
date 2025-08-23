import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { questionBank } from '@/lib/assessment/questions';

// TEST ENDPOINT - No authentication required
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await context.params;
    const body = await req.json();
    const { questionId, response } = body;

    console.log(`TEST: Submitting response for assessment ${assessmentId}`);
    console.log(`Question: ${questionId}, Response:`, response);

    // Verify assessment exists and is in progress
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        status: 'IN_PROGRESS',
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found or not in progress' },
        { status: 404 }
      );
    }

    // Get the question to validate response
    const question = questionBank.find(q => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Save the response
    const savedResponse = await prisma.clientResponse.create({
      data: {
        assessmentId,
        questionId,
        questionText: question.text,
        questionModule: question.module,
        responseType: response.type || question.type,
        responseValue: response.value,
        responseText: response.text,
        answeredAt: new Date(),
      },
    });

    // Update assessment progress
    const updatedAssessment = await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        questionsAsked: { increment: 1 },
        lastActiveAt: new Date(),
        completionRate: Math.min(((assessment.questionsAsked + 1) / 200) * 100, 100), // Estimate 200 questions total
      },
    });

    console.log(`TEST: Response saved. Total questions answered: ${updatedAssessment.questionsAsked}`);

    return NextResponse.json({
      success: true,
      data: {
        responseId: savedResponse.id,
        questionsAnswered: updatedAssessment.questionsAsked,
        completionRate: updatedAssessment.completionRate,
      }
    });

  } catch (error) {
    console.error('TEST: Response submission error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to submit response' 
      },
      { status: 500 }
    );
  }
}
