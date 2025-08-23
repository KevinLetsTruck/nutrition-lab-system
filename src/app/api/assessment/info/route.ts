import { NextResponse } from 'next/server';
// The questions are in /lib not /src/lib
import { questionBank } from '../../../../lib/assessment/questions';

export async function GET() {
  try {
    const questions = questionBank;
    
    // Count questions by module
    const moduleCount: Record<string, number> = {};
    questions.forEach(q => {
      moduleCount[q.module] = (moduleCount[q.module] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      totalQuestions: questions.length,
      modules: Object.keys(moduleCount),
      moduleBreakdown: moduleCount,
      status: 'Assessment system loaded successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
