/**
 * Functional Medicine Digestive Assessment - Start Endpoint
 * 
 * Creates or resumes a comprehensive digestive assessment for authenticated clients
 */

import { verifyClientToken } from '@/lib/client-auth-utils';
import { prisma as db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify client authentication
    const clientUser = await verifyClientToken(request);
    if (!clientUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🧠 Starting FM digestive assessment for client: ${clientUser.id}`);

    // Check for existing in-progress assessment
    let assessment = await db.functionalMedicineAssessment.findFirst({
      where: {
        clientId: clientUser.id,
        assessmentType: 'digestive_system',
        status: { in: ['draft', 'in_progress'] }
      },
      include: {
        responses: {
          orderBy: { answeredAt: 'asc' }
        }
      }
    });

    // Create new assessment if none exists
    if (!assessment) {
      assessment = await db.functionalMedicineAssessment.create({
        data: {
          clientId: clientUser.id,
          assessmentType: 'digestive_system',
          status: 'in_progress'
        },
        include: {
          responses: true
        }
      });
      
      console.log(`✅ Created new FM assessment: ${assessment.id}`);
    } else {
      console.log(`🔄 Resuming existing FM assessment: ${assessment.id}`);
    }

    // Get all active digestive questions
    const questions = await db.fmDigestiveQuestion.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });

    // Calculate progress
    const totalQuestions = questions.length;
    const answeredQuestions = assessment.responses.length;
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

    // Update completion percentage
    if (assessment.completionPercentage !== completionPercentage) {
      await db.functionalMedicineAssessment.update({
        where: { id: assessment.id },
        data: { completionPercentage }
      });
    }

    // Get next question to answer
    const answeredQuestionIds = assessment.responses.map(r => r.questionId);
    const nextQuestion = questions.find(q => !answeredQuestionIds.includes(q.id));
    const currentQuestionIndex = answeredQuestions;

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        status: assessment.status,
        assessmentType: assessment.assessmentType,
        progress: {
          current: answeredQuestions,
          total: totalQuestions,
          percentage: completionPercentage,
          currentQuestionIndex
        },
        nextQuestion: nextQuestion ? {
          id: nextQuestion.id,
          category: nextQuestion.category,
          subcategory: nextQuestion.subcategory,
          questionText: nextQuestion.questionText,
          questionContext: nextQuestion.questionContext,
          scaleType: nextQuestion.scaleType,
          requiredLevel: nextQuestion.requiredLevel
        } : null,
        responses: assessment.responses.map(r => ({
          questionId: r.questionId,
          responseValue: r.responseValue,
          confidenceLevel: r.confidenceLevel,
          answeredAt: r.answeredAt
        })),
        timeElapsed: assessment.startedAt ? 
          Math.round((Date.now() - assessment.startedAt.getTime()) / 60000) : 0
      }
    });

  } catch (error) {
    console.error('❌ FM assessment start error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start assessment',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify client authentication
    const clientUser = await verifyClientToken(request);
    if (!clientUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get client's latest assessment
    const assessment = await db.functionalMedicineAssessment.findFirst({
      where: {
        clientId: clientUser.id,
        assessmentType: 'digestive_system'
      },
      orderBy: { createdAt: 'desc' },
      include: {
        responses: {
          orderBy: { answeredAt: 'asc' }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json({ 
        hasAssessment: false,
        message: 'No assessment found - start a new assessment' 
      });
    }

    // Get total questions
    const totalQuestions = await db.fmDigestiveQuestion.count({
      where: { isActive: true }
    });

    return NextResponse.json({
      hasAssessment: true,
      assessment: {
        id: assessment.id,
        status: assessment.status,
        progress: {
          current: assessment.responses.length,
          total: totalQuestions,
          percentage: assessment.completionPercentage
        },
        completedAt: assessment.completedAt,
        canResume: assessment.status !== 'completed'
      }
    });

  } catch (error) {
    console.error('❌ Get assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to get assessment status' },
      { status: 500 }
    );
  }
}
