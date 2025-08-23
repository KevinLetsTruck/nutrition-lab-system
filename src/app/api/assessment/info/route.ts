import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get assessment template from database
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: 'default' }
    });

    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'No assessment template found'
      }, { status: 404 });
    }

    // Count questions from the database
    const questions = template.questionBank as any[];
    const moduleCount: Record<string, number> = {};
    
    if (Array.isArray(questions)) {
      questions.forEach((q: any) => {
        if (q.module) {
          moduleCount[q.module] = (moduleCount[q.module] || 0) + 1;
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      totalQuestions: questions?.length || 0,
      modules: Object.keys(moduleCount),
      moduleBreakdown: moduleCount,
      templateVersion: template.version,
      status: 'Assessment system loaded successfully from database'
    });
  } catch (error) {
    console.error('Error in /api/assessment/info:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
