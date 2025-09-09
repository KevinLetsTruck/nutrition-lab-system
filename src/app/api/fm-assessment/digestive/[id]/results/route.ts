/**
 * Functional Medicine Assessment - Results Endpoint
 * 
 * Serves comprehensive analysis results to clients
 */

import { verifyClientToken } from '@/lib/client-auth-utils';
import { prisma as db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const clientUser = await verifyClientToken(request);
    if (!clientUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`📊 Retrieving FM assessment results: ${params.id}`);

    // Get completed assessment with all data
    const assessment = await db.functionalMedicineAssessment.findFirst({
      where: {
        id: params.id,
        clientId: clientUser.id,
        status: 'completed'
      },
      include: {
        responses: {
          include: {
            question: true
          },
          orderBy: { questionId: 'asc' }
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            isTruckDriver: true
          }
        }
      }
    });

    if (!assessment) {
      return NextResponse.json({ 
        error: 'Completed assessment not found',
        message: 'Assessment may not be completed yet or does not exist'
      }, { status: 404 });
    }

    // Format results for client display
    const results = {
      // Assessment metadata
      assessmentInfo: {
        id: assessment.id,
        completedAt: assessment.completedAt,
        totalTimeMinutes: assessment.totalTimeMinutes,
        responseCount: assessment.responses.length,
        clientName: `${assessment.client.firstName} ${assessment.client.lastName}`
      },

      // Overall scoring
      overallResults: {
        digestiveScore: assessment.overallDigestiveScore,
        severity: getSeverityLabel(assessment.overallDigestiveScore || 0),
        interpretation: getScoreInterpretation(assessment.overallDigestiveScore || 0)
      },

      // Category breakdown
      categoryScores: formatCategoryScores(assessment.subsystemScores as any),

      // Root cause analysis
      rootCauseAnalysis: {
        primaryDrivers: formatRootCauses(assessment.rootCauseIndicators as any),
        keyFindings: extractKeyFindings(assessment.responses),
        clinicalSignificance: generateClinicalSummary(assessment.responses)
      },

      // Modern FM insights
      modernInsights: {
        environmentalFactors: assessment.environmentalFactors,
        lifestyleFactors: assessment.lifestyleFactors,
        traditionalVsModern: formatModernInsights(assessment.rootCauseAnalysis as any)
      },

      // Treatment recommendations
      recommendations: {
        treatmentPriorities: assessment.treatmentPriorities,
        immediateActions: generateImmediateActions(assessment.rootCauseIndicators as any),
        lifestyleModifications: generateLifestyleRecommendations(assessment.environmentalFactors as any),
        followUpPlan: generateFollowUpPlan(assessment.overallDigestiveScore || 0)
      },

      // Response breakdown for detailed review
      responseBreakdown: {
        byCategory: groupResponsesByCategory(assessment.responses),
        significantFindings: identifySignificantFindings(assessment.responses),
        patternAnalysis: analyzeResponsePatterns(assessment.responses)
      }
    };

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('❌ Get results error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve results',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions for result formatting
function getSeverityLabel(score: number): string {
    if (score <= 20) return 'Excellent';
    if (score <= 40) return 'Good';
    if (score <= 60) return 'Fair';
    if (score <= 80) return 'Poor';
    return 'Critical';
  }

function getScoreInterpretation(score: number): string {
    if (score <= 20) return 'Your digestive system shows excellent function with minimal dysfunction patterns.';
    if (score <= 40) return 'Your digestive system shows good function with some areas for optimization.';
    if (score <= 60) return 'Your digestive system shows moderate dysfunction that would benefit from targeted support.';
    if (score <= 80) return 'Your digestive system shows significant dysfunction requiring comprehensive intervention.';
    return 'Your digestive system shows critical dysfunction requiring immediate medical attention.';
  }

function formatCategoryScores(subsystemScores: any): any {
    if (!subsystemScores || !Array.isArray(subsystemScores)) {
      return {
        upperGI: { score: 0, severity: 'unknown', insights: [] },
        smallIntestine: { score: 0, severity: 'unknown', insights: [] },
        largeIntestine: { score: 0, severity: 'unknown', insights: [] },
        liverDetox: { score: 0, severity: 'unknown', insights: [] }
      };
    }

    const formatted: any = {};
    subsystemScores.forEach((category: any) => {
      formatted[category.category] = {
        score: category.adjustedScore,
        severity: category.severityLevel,
        insights: category.clinicalInsights || []
      };
    });

    return formatted;
  }

function formatRootCauses(rootCauseIndicators: any): any[] {
    if (!rootCauseIndicators || !Array.isArray(rootCauseIndicators)) {
      return [];
    }

    return rootCauseIndicators.map((indicator: any) => ({
      condition: indicator.condition,
      probability: indicator.probability,
      evidenceLevel: indicator.evidenceStrength,
      symptoms: indicator.supportingSymptoms || [],
      treatmentApproach: indicator.modernFMInsights || []
    }));
  }

function extractKeyFindings(responses: any[]): string[] {
    const findings: string[] = [];
    
    responses.forEach(response => {
      if (response.responseValue >= 4 && response.question?.clinicalSignificance) {
        findings.push(`High severity: ${response.question.clinicalSignificance}`);
      }
    });

    return findings.slice(0, 5); // Top 5 findings
  }

function generateClinicalSummary(responses: any[]): string {
    const highScoreResponses = responses.filter(r => r.responseValue >= 4);
    const categories = [...new Set(highScoreResponses.map(r => r.question?.category))];
    
    if (categories.length === 0) {
      return 'Assessment shows minimal digestive dysfunction with good overall function.';
    }
    
    return `Assessment indicates primary dysfunction in ${categories.join(', ')} with ${highScoreResponses.length} significant symptoms requiring attention.`;
  }

function formatModernInsights(rootCauseAnalysis: any): any {
    return rootCauseAnalysis?.modernInsights || {
      traditionalIndicators: [],
      modernFMEnhancements: [],
      uniqueInsights: []
    };
  }

function generateImmediateActions(rootCauseIndicators: any): string[] {
    if (!rootCauseIndicators || !Array.isArray(rootCauseIndicators)) {
      return ['Schedule consultation to review results'];
    }

    const actions: string[] = [];
    rootCauseIndicators.forEach((indicator: any) => {
      if (indicator.interventionPriority <= 2) {
        actions.push(`Address ${indicator.condition}: ${indicator.expectedTimelineWeeks} weeks`);
      }
    });

    return actions.length > 0 ? actions : ['Schedule consultation to review results'];
  }

function generateLifestyleRecommendations(environmentalFactors: any): string[] {
    const recommendations = [
      'Optimize meal timing and eating environment',
      'Reduce EMF exposure during meals',
      'Eliminate inflammatory seed oils',
      'Address environmental mold exposure if indicated'
    ];

    return recommendations;
  }

function generateFollowUpPlan(score: number): any {
    return {
      initialConsultation: score > 60 ? 'Within 1-2 weeks' : 'Within 2-4 weeks',
      progressReview: '4-6 weeks',
      reassessment: '12 weeks',
      urgency: score > 80 ? 'high' : score > 60 ? 'medium' : 'standard'
    };
  }

function groupResponsesByCategory(responses: any[]): any {
    const grouped: any = {};
    
    responses.forEach(response => {
      const category = response.question?.category || 'unknown';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        questionText: response.question?.questionText,
        responseValue: response.responseValue,
        clinicalSignificance: response.question?.clinicalSignificance
      });
    });

    return grouped;
  }

function identifySignificantFindings(responses: any[]): any[] {
    return responses
      .filter(r => r.responseValue >= 4)
      .map(r => ({
        question: r.question?.questionText,
        severity: r.responseValue,
        category: r.question?.category,
        clinicalRelevance: r.question?.clinicalSignificance
      }))
      .slice(0, 10); // Top 10 most significant
  }

function analyzeResponsePatterns(responses: any[]): any {
    const patterns = {
      consistentHighScores: responses.filter(r => r.responseValue >= 4).length,
      crossCategoryPatterns: findCrossCategoryPatterns(responses),
      modernFMPatterns: responses.filter(r => r.question?.isModernInsight && r.responseValue >= 3).length
    };

    return patterns;
  }

function findCrossCategoryPatterns(responses: any[]): string[] {
    // Analyze patterns across categories that suggest specific conditions
    const patterns: string[] = [];
    
    const upperGIHigh = responses.filter(r => r.question?.category === 'upper_gi' && r.responseValue >= 4).length;
    const smallIntestineHigh = responses.filter(r => r.question?.category === 'small_intestine' && r.responseValue >= 4).length;
    
    if (upperGIHigh >= 2 && smallIntestineHigh >= 2) {
      patterns.push('Upper GI dysfunction cascading to small intestine issues');
    }
    
    return patterns;
  }
