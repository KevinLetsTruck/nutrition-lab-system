/**
 * Functional Medicine Assessment - Completion & Analysis
 * 
 * Performs comprehensive analysis and generates treatment recommendations
 */

import { verifyClientToken } from '@/lib/client-auth-utils';
import { prisma as db } from '@/lib/db';
import { FunctionalMedicineScoringEngine } from '@/lib/functional-medicine/scoring-engine';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const clientUser = await verifyClientToken(request);
    if (!clientUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`🎯 Completing FM assessment analysis: ${params.id}`);

    // Get assessment with all responses
    const assessment = await db.functionalMedicineAssessment.findFirst({
      where: {
        id: params.id,
        clientId: clientUser.id
      },
      include: {
        responses: {
          include: {
            question: true
          }
        },
        client: true
      }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    // Get all questions for complete analysis
    const allQuestions = await db.fmDigestiveQuestion.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });

    // Get scoring algorithm
    const scoringAlgorithm = await db.fmScoringAlgorithm.findFirst({
      where: { 
        systemName: 'digestive_system',
        isActive: true 
      }
    });

    // Perform comprehensive analysis
    const scoringEngine = new FunctionalMedicineScoringEngine(scoringAlgorithm);
    
    const responseData = assessment.responses.map(r => ({
      questionId: r.questionId,
      responseValue: r.responseValue,
      confidenceLevel: r.confidenceLevel || 5
    }));

    console.log(`🧠 Analyzing ${responseData.length} responses with sophisticated FM algorithms...`);

    const analysisResults = await scoringEngine.analyzeAssessment(
      responseData, 
      allQuestions,
      {
        clientAge: assessment.client.dateOfBirth ? 
          Math.floor((Date.now() - assessment.client.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null,
        isTruckDriver: assessment.client.isTruckDriver
      }
    );

    // Calculate total assessment time
    const totalTimeMinutes = assessment.startedAt ? 
      Math.round((Date.now() - assessment.startedAt.getTime()) / 60000) : null;

    // Update assessment with final results
    const updatedAssessment = await db.functionalMedicineAssessment.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        completionPercentage: 100,
        totalTimeMinutes,
        overallDigestiveScore: analysisResults.overallDigestiveScore,
        subsystemScores: analysisResults.categoryScores,
        rootCauseIndicators: analysisResults.primaryDrivers,
        treatmentPriorities: analysisResults.treatmentPriorities,
        environmentalFactors: analysisResults.environmentalFactors,
        lifestyleFactors: analysisResults.lifestyleFactors,
        rootCauseAnalysis: {
          primaryDrivers: analysisResults.primaryDrivers,
          secondaryFactors: analysisResults.secondaryFactors,
          modernInsights: analysisResults.traditionalVsModernFindings
        }
      }
    });

    console.log(`✅ FM assessment completed with score: ${analysisResults.overallDigestiveScore}/100`);

    return NextResponse.json({
      success: true,
      analysis: {
        assessmentId: params.id,
        completedAt: updatedAssessment.completedAt,
        totalTimeMinutes: totalTimeMinutes,
        
        // Core results
        overallDigestiveScore: analysisResults.overallDigestiveScore,
        overallSeverity: analysisResults.overallSeverity,
        
        // Category breakdown
        categoryScores: analysisResults.categoryScores,
        
        // Root cause analysis
        primaryDrivers: analysisResults.primaryDrivers,
        secondaryFactors: analysisResults.secondaryFactors,
        
        // Modern FM insights
        environmentalFactors: analysisResults.environmentalFactors,
        lifestyleFactors: analysisResults.lifestyleFactors,
        traditionalVsModernFindings: analysisResults.traditionalVsModernFindings,
        
        // Treatment recommendations
        treatmentPriorities: analysisResults.treatmentPriorities,
        
        // Assessment quality
        assessmentQuality: analysisResults.assessmentQuality,
        
        // Next steps
        recommendedActions: generateRecommendedActions(analysisResults),
        followUpSchedule: generateFollowUpSchedule(analysisResults),
        
        // Export readiness
        claudeDesktopReady: true,
        exportUrl: `/api/fm-assessment/digestive/${params.id}/export`
      }
    });

  } catch (error) {
    console.error('❌ Complete assessment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete assessment analysis',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions for generating recommendations
function generateRecommendedActions(results: any): string[] {
  const actions: string[] = [];
  
  if (results.primaryDrivers.length > 0) {
    actions.push(`Address primary driver: ${results.primaryDrivers[0].condition}`);
  }
  
  if (results.overallDigestiveScore > 60) {
    actions.push('Schedule comprehensive functional medicine consultation');
  }
  
  actions.push('Download detailed analysis report');
  actions.push('Review treatment priorities with practitioner');
  
  return actions;
}

function generateFollowUpSchedule(results: any): any {
  return {
    initialConsultation: '1-2 weeks',
    progressCheck: '4-6 weeks', 
    reassessment: '12 weeks',
    priorities: results.treatmentPriorities.slice(0, 3)
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const clientUser = await verifyClientToken(request);
    if (!clientUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current responses for this assessment
    const responses = await db.fmDigestiveResponse.findMany({
      where: { assessmentId: params.id },
      include: {
        question: {
          select: {
            id: true,
            category: true,
            questionText: true,
            scaleType: true
          }
        }
      },
      orderBy: { answeredAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      responses: responses.map(r => ({
        questionId: r.questionId,
        questionText: r.question.questionText,
        category: r.question.category,
        responseValue: r.responseValue,
        confidenceLevel: r.confidenceLevel,
        notes: r.notes,
        timeSpentSeconds: r.timeSpentSeconds,
        answeredAt: r.answeredAt,
        answerChangedCount: r.answerChangedCount
      }))
    });

  } catch (error) {
    console.error('❌ Get responses error:', error);
    return NextResponse.json(
      { error: 'Failed to get responses' },
      { status: 500 }
    );
  }
}
