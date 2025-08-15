import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth-helpers';
import { getQuestionsByModule } from '@/lib/assessment/questions';
import { FunctionalModule } from '@/lib/assessment/types';
// Import other modules as they are created
// import { getAssimilationQuestions } from '@/lib/assessment/questions/assimilation-questions';
// import { getDefenseRepairQuestions } from '@/lib/assessment/questions/defense-repair-questions';
// import { getEnergyQuestions } from '@/lib/assessment/questions/energy-questions';
// import { getBiotransformationQuestions } from '@/lib/assessment/questions/biotransformation-questions';
// import { getTransportQuestions } from '@/lib/assessment/questions/transport-questions';
// import { getCommunicationQuestions } from '@/lib/assessment/questions/communication-questions';
// import { getStructuralQuestions } from '@/lib/assessment/questions/structural-questions';
import { ModuleType } from '@prisma/client';

const getQuestionsForModule = (module: ModuleType) => {
  // Convert Prisma ModuleType to FunctionalModule enum
  const functionalModule = module as unknown as FunctionalModule;
  return getQuestionsByModule(functionalModule);
};

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

    // Get assessment with responses
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        clientId: session.user.id,
        status: { in: ['PAUSED', 'IN_PROGRESS'] }
      },
      include: {
        responses: {
          orderBy: { answeredAt: 'desc' }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found or cannot be resumed' },
        { status: 404 }
      );
    }

    // Update assessment status to IN_PROGRESS
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: {
        status: 'IN_PROGRESS',
        lastActiveAt: new Date(),
        aiContext: {
          ...(assessment.aiContext as any || {}),
          resumedAt: new Date(),
          resumeCount: ((assessment.aiContext as any)?.resumeCount || 0) + 1
        }
      }
    });

    // Get questions for current module
    const moduleQuestions = getQuestionsForModule(assessment.currentModule);
    
    // Find the last answered question and determine next
    let currentQuestion = null;
    let questionsAnsweredInModule = 0;

    if (assessment.responses.length > 0) {
      // Count questions answered in current module
      questionsAnsweredInModule = assessment.responses.filter(
        r => r.questionModule === assessment.currentModule
      ).length;

      // Get the last response
      const lastResponse = assessment.responses[0];
      
      // Find the index of the last answered question
      const lastQuestionIndex = moduleQuestions.findIndex(
        q => q.id === lastResponse.questionId
      );

      // Get the next question
      if (lastQuestionIndex >= 0 && lastQuestionIndex < moduleQuestions.length - 1) {
        currentQuestion = moduleQuestions[lastQuestionIndex + 1];
      } else if (lastQuestionIndex === moduleQuestions.length - 1) {
        // Module complete, need to move to next module
        // This will be handled by the next response submission
        currentQuestion = null;
      } else {
        // Couldn't find last question, start from beginning of module
        currentQuestion = moduleQuestions[0];
      }
    } else {
      // No responses yet, start from the beginning
      currentQuestion = moduleQuestions[0];
    }

    // Prepare resume data
    const formattedCurrentQuestion = currentQuestion ? {
      ...currentQuestion,
      type: currentQuestion.type as string
    } : null;
    
    const resumeData = {
      assessmentId,
      currentQuestion: formattedCurrentQuestion,
      currentModule: assessment.currentModule,
      responses: assessment.responses.map(r => ({
        id: r.id,
        questionId: r.questionId,
        questionText: r.questionText,
        questionModule: r.questionModule,
        responseType: r.responseType,
        responseValue: r.responseValue,
        answeredAt: r.answeredAt
      })),
      questionsAsked: assessment.questionsAsked,
      questionsSaved: assessment.questionsSaved || 0,
      questionsAnsweredInModule,
      questionsInCurrentModule: moduleQuestions.length,
      progressPercentage: Math.round((assessment.questionsAsked / 400) * 100)
    };

    console.log(`Assessment ${assessmentId} resumed by user ${session.user.id}`);

    return NextResponse.json({
      success: true,
      data: resumeData
    });

  } catch (error) {
    console.error('Error resuming assessment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to resume assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}