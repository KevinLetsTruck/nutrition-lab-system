import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { questionBank, getQuestionsByModule } from '@/lib/assessment/questions';

export async function GET() {
  try {
    // Get assessment info
    const assessmentCount = await prisma.clientAssessment.count();
    const lastAssessment = await prisma.clientAssessment.findFirst({
      orderBy: { startedAt: 'desc' },
      include: {
        responses: {
          take: 5,
          orderBy: { answeredAt: 'desc' }
        }
      }
    });

    // Test question loading
    const screeningFromModule = getQuestionsByModule("SCREENING");
    const screeningFromBank = questionBank.filter(q => q.module === "SCREENING");
    
    return NextResponse.json({
      success: true,
      database: {
        totalAssessments: assessmentCount,
        lastAssessmentId: lastAssessment?.id,
        lastAssessmentStatus: lastAssessment?.status,
        lastAssessmentModule: lastAssessment?.currentModule,
        responseCount: lastAssessment?.responses.length || 0
      },
      questions: {
        totalInBank: questionBank.length,
        screeningFromGetModule: screeningFromModule?.length || 0,
        screeningFromFilter: screeningFromBank.length,
        firstQuestion: screeningFromBank[0] || null,
        modules: [...new Set(questionBank.map(q => q.module))]
      },
      debug: {
        getQuestionsByModuleWorks: screeningFromModule && screeningFromModule.length > 0,
        questionBankWorks: questionBank.length > 0,
        firstQuestionText: screeningFromBank[0]?.text?.substring(0, 100)
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Debug failed'
    }, { status: 500 });
  }
}
