/**
 * Functional Medicine Assessment - Response Submission
 * 
 * Handles individual question responses with real-time scoring feedback
 */

import { verifyClientToken } from '@/lib/client-auth-utils';
import { prisma as db } from '@/lib/db';
import { FunctionalMedicineScoringEngine } from '@/lib/functional-medicine/scoring-engine';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ResponseSchema = z.object({
  questionId: z.number().int().positive(),
  responseValue: z.number().int().min(0).max(5),
  confidenceLevel: z.number().int().min(1).max(5).optional().default(5),
  notes: z.string().optional(),
  timeSpentSeconds: z.number().int().positive().optional()
});

interface Params {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const clientUser = await verifyClientToken(request);
    if (!clientUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ResponseSchema.parse(body);

    console.log(`📝 Submitting response for assessment ${params.id}, question ${validatedData.questionId}`);

    // Verify assessment exists and belongs to client
    const assessment = await db.functionalMedicineAssessment.findFirst({
      where: {
        id: params.id,
        clientId: clientUser.id,
        status: { in: ['draft', 'in_progress'] }
      },
      include: {
        responses: true
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Verify question exists
    const question = await db.fmDigestiveQuestion.findFirst({
      where: { 
        id: validatedData.questionId,
        isActive: true 
      }
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Get existing response to check if this is an update
    const existingResponse = assessment.responses.find(r => r.questionId === validatedData.questionId);
    const isUpdate = !!existingResponse;

    // Upsert the response
    await db.fmDigestiveResponse.upsert({
      where: {
        assessmentId_questionId: {
          assessmentId: params.id,
          questionId: validatedData.questionId
        }
      },
      update: {
        responseValue: validatedData.responseValue,
        confidenceLevel: validatedData.confidenceLevel,
        notes: validatedData.notes || null,
        timeSpentSeconds: validatedData.timeSpentSeconds || null,
        answerChangedCount: {
          increment: isUpdate ? 1 : 0
        }
      },
      create: {
        id: crypto.randomUUID(),
        assessmentId: params.id,
        questionId: validatedData.questionId,
        responseValue: validatedData.responseValue,
        confidenceLevel: validatedData.confidenceLevel,
        notes: validatedData.notes || null,
        timeSpentSeconds: validatedData.timeSpentSeconds || null,
        answerChangedCount: 0
      }
    });

    // Get updated responses for real-time analysis
    const allResponses = await db.fmDigestiveResponse.findMany({
      where: { assessmentId: params.id },
      include: {
        question: true
      }
    });

    // Get all questions for scoring
    const allQuestions = await db.fmDigestiveQuestion.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });

    // Calculate completion
    const totalQuestions = allQuestions.length;
    const answeredQuestions = allResponses.length;
    const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);
    const isComplete = answeredQuestions >= totalQuestions;

    // Update assessment status
    await db.functionalMedicineAssessment.update({
      where: { id: params.id },
      data: {
        completionPercentage,
        status: isComplete ? 'completed' : 'in_progress',
        completedAt: isComplete ? new Date() : null
      }
    });

    // Perform real-time scoring if we have enough responses
    let realTimeInsights: any = null;
    if (answeredQuestions >= 3) {
      const scoringEngine = new FunctionalMedicineScoringEngine();
      const responseData = allResponses.map(r => ({
        questionId: r.questionId,
        responseValue: r.responseValue,
        confidenceLevel: r.confidenceLevel || 5
      }));

      try {
        const results = await scoringEngine.analyzeAssessment(responseData, allQuestions);
        realTimeInsights = {
          categoryScores: results.categoryScores,
          earlyIndicators: results.primaryDrivers.slice(0, 2),
          overallTrend: results.overallSeverity
        };
      } catch (scoringError) {
        console.warn('⚠️ Real-time scoring error:', scoringError);
      }
    }

    // Get next question
    const answeredQuestionIds = allResponses.map(r => r.questionId);
    const nextQuestion = allQuestions.find(q => !answeredQuestionIds.includes(q.id));

    return NextResponse.json({
      success: true,
      assessment: {
        id: params.id,
        status: isComplete ? 'completed' : 'in_progress',
        progress: {
          current: answeredQuestions,
          total: totalQuestions,
          percentage: completionPercentage,
          isComplete
        },
        nextQuestion: nextQuestion ? {
          id: nextQuestion.id,
          category: nextQuestion.category,
          subcategory: nextQuestion.subcategory,
          questionText: nextQuestion.questionText,
          questionContext: nextQuestion.questionContext,
          scaleType: nextQuestion.scaleType,
          requiredLevel: nextQuestion.requiredLevel,
          displayOrder: nextQuestion.displayOrder
        } : null,
        realTimeInsights: realTimeInsights,
        responseConfirmed: {
          questionId: validatedData.questionId,
          responseValue: validatedData.responseValue,
          isUpdate: isUpdate
        }
      }
    });

  } catch (error) {
    console.error('❌ Submit response error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid response data',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to submit response',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
