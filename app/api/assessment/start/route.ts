import { NextRequest, NextResponse } from 'next/server';
import { assessmentService } from '@/lib/assessment/assessment-service';
import { prisma } from '@/lib/db/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get session - adjust based on your auth setup
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json<APIResponse>({
    //     success: false,
    //     error: {
    //       code: 'UNAUTHORIZED',
    //       message: 'You must be logged in to start an assessment'
    //     }
    //   }, { status: 401 });
    // }

    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'MISSING_CLIENT_ID',
          message: 'Client ID is required to start an assessment'
        }
      }, { status: 400 });
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return NextResponse.json<APIResponse>({
        success: false,
        error: {
          code: 'CLIENT_NOT_FOUND',
          message: 'Client not found'
        }
      }, { status: 404 });
    }

    // Start or resume assessment
    const assessmentId = await assessmentService.startAssessment(clientId);

    // Get initial assessment data
    const assessment = await prisma.clientAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: {
          select: {
            id: true,
            questionId: true,
            responseValue: true
          }
        }
      }
    });

    return NextResponse.json<APIResponse>({
      success: true,
      data: {
        assessmentId,
        status: assessment?.status,
        currentModule: assessment?.currentModule,
        questionsAsked: assessment?.questionsAsked || 0,
        completionRate: assessment?.completionRate || 0,
        resuming: assessment?.responses && assessment.responses.length > 0
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });

  } catch (error) {
    console.error('Error starting assessment:', error);
    return NextResponse.json<APIResponse>({
      success: false,
      error: {
        code: 'ASSESSMENT_START_ERROR',
        message: 'Failed to start assessment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}
