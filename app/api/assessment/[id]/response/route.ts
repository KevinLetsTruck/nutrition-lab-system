import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { auth } from '@/src/lib/auth';
import { getNextQuestionWithAI } from '@/lib/ai/assessment-ai';
import { getScreeningQuestions } from '@/lib/assessment/questions/screening-questions';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessmentId = params.id;
    const body = await req.json();
    const { questionId, value, module } = body;

    // Verify assessment belongs to user and is in progress
    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: assessmentId,
        clientId: session.user.id,
        status: 'IN_PROGRESS'
      },
      include: {
        responses: {
          orderBy: { answeredAt: 'desc' }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found or not in progress' },
        { status: 404 }
      );
    }

    // Get the current question to determine response type
    const questions = getScreeningQuestions();
    const currentQuestion = questions.find(q => q.id === questionId);
    
    if (!currentQuestion) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }

    // Save the response
    const responseData = {
      assessmentId,
      questionId,
      questionText: currentQuestion.text,
      questionModule: module || assessment.currentModule,
      responseType: currentQuestion.type,
      responseValue: value,
      answeredAt: new Date()
    };

    // Check for seed oil related responses
    let seedOilIndicator = false;
    if (currentQuestion.category === 'SEED_OIL') {
      seedOilIndicator = true;
      
      // Update AI context with seed oil information
      const aiContext = assessment.aiContext as any || {};
      if (!aiContext.seedOilExposure) {
        aiContext.seedOilExposure = [];
      }
      aiContext.seedOilExposure.push({
        questionId,
        response: value,
        timestamp: new Date()
      });
      
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: { aiContext }
      });
    }

    const savedResponse = await prisma.clientResponse.create({
      data: responseData
    });

    // Prepare context for AI to determine next question
    const allResponses = [...assessment.responses, savedResponse];
    
    // Build symptom profile from responses
    const symptomProfile: any = assessment.symptomProfile || {};
    
    // Update symptom profile based on response
    if (currentQuestion.type === 'LIKERT_SCALE' && typeof value === 'number') {
      if (!symptomProfile[module]) {
        symptomProfile[module] = {};
      }
      symptomProfile[module][questionId] = value;
      
      // Flag high severity symptoms
      if (value >= 7) {
        const aiContext = assessment.aiContext as any || {};
        if (!aiContext.highSeveritySymptoms) {
          aiContext.highSeveritySymptoms = [];
        }
        aiContext.highSeveritySymptoms.push({
          questionId,
          severity: value,
          module
        });
        
        await prisma.clientAssessment.update({
          where: { id: assessmentId },
          data: { aiContext }
        });
      }
    }

    // Get next question using AI
    const aiDecision = await getNextQuestionWithAI({
      currentModule: assessment.currentModule,
      responses: allResponses,
      symptomProfile,
      questionsAsked: assessment.questionsAsked,
      assessmentContext: assessment.aiContext as any
    });

    // Update assessment stats
    const updateData: any = {
      questionsAsked: assessment.questionsAsked + 1,
      lastActiveAt: new Date(),
      symptomProfile
    };

    // Check if we're moving to a new module
    if (aiDecision.nextModule && aiDecision.nextModule !== assessment.currentModule) {
      updateData.currentModule = aiDecision.nextModule;
      
      // Update AI context with module progression
      const aiContext = assessment.aiContext as any || {};
      if (!aiContext.modulesCompleted) {
        aiContext.modulesCompleted = [];
      }
      aiContext.modulesCompleted.push(assessment.currentModule);
      updateData.aiContext = aiContext;
    }

    // Track questions saved by AI
    if (aiDecision.questionsSaved) {
      updateData.questionsSaved = (assessment.questionsSaved || 0) + aiDecision.questionsSaved;
    }

    // Update assessment
    await prisma.clientAssessment.update({
      where: { id: assessmentId },
      data: updateData
    });

    // Check if assessment is complete
    if (!aiDecision.nextQuestion) {
      // Mark assessment as complete
      await prisma.clientAssessment.update({
        where: { id: assessmentId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      // Trigger AI analysis for final report
      // This will be implemented in a separate endpoint
      
      return NextResponse.json({
        success: true,
        data: {
          assessmentComplete: true,
          totalQuestions: assessment.questionsAsked + 1,
          questionsSaved: updateData.questionsSaved || 0,
          message: 'Assessment completed successfully'
        }
      });
    }

    // Return next question
    return NextResponse.json({
      success: true,
      data: {
        nextQuestion: aiDecision.nextQuestion,
        module: aiDecision.nextModule || assessment.currentModule,
        questionsInModule: aiDecision.questionsInModule,
        questionsSaved: updateData.questionsSaved || 0,
        aiReasoning: aiDecision.reasoning, // For debugging
        seedOilFlag: seedOilIndicator
      }
    });

  } catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve assessment progress
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const assessment = await prisma.clientAssessment.findFirst({
      where: {
        id: params.id,
        clientId: session.user.id
      },
      include: {
        responses: {
          orderBy: { answeredAt: 'asc' }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        assessment,
        responsesCount: assessment.responses.length,
        questionsAsked: assessment.questionsAsked,
        questionsSaved: assessment.questionsSaved,
        currentModule: assessment.currentModule,
        status: assessment.status
      }
    });

  } catch (error) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}