import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { assessmentAI } from '@/lib/ai/assessment-ai';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assessmentId = params.id;

    // Get assessment with analysis
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        analysis: true,
        responses: {
          select: {
            questionId: true,
            questionModule: true,
            responseValue: true
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

    // If no analysis exists yet, generate it
    if (!assessment.analysis && assessment.status === 'COMPLETED') {
      const analysis = await assessmentAI.scoreAssessment(assessmentId);
      const labs = await assessmentAI.recommendLabs(assessmentId);
      
      // Get the updated analysis
      const updatedAnalysis = await prisma.assessmentAnalysis.findUnique({
        where: { assessmentId }
      });

      return NextResponse.json<APIResponse>({
        success: true,
        data: {
          assessment: {
            id: assessment.id,
            status: assessment.status,
            completedAt: assessment.completedAt,
            questionsAsked: assessment.questionsAsked
          },
          analysis: updatedAnalysis,
          recommendations: labs
        }
      });
    }

    if (!assessment.analysis) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_AVAILABLE',
          message: 'Assessment must be completed before analysis is available'
        }
      }, { status: 400 });
    }

    // Get lab recommendations
    const labs = await assessmentAI.recommendLabs(assessmentId);

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        assessment: {
          id: assessment.id,
          status: assessment.status,
          completedAt: assessment.completedAt,
          questionsAsked: assessment.questionsAsked,
          seedOilRisk: assessment.seedOilRisk
        },
        analysis: assessment.analysis,
        recommendations: labs,
        responsesByModule: assessment.responses.reduce((acc, r) => {
          if (!acc[r.questionModule]) acc[r.questionModule] = [];
          acc[r.questionModule].push(r);
          return acc;
        }, {} as Record<string, any[]>)
      }
    });

  } catch (error) {
    console.error('Error getting analysis:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: {
        code: 'ANALYSIS_ERROR',
        message: 'Failed to get assessment analysis'
      }
    }, { status: 500 });
  }
}
