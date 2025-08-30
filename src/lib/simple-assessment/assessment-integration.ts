/**
 * Assessment Integration Layer
 * 
 * Provides seamless integration between existing 80-question system and new comprehensive
 * 270+ question system with backward compatibility and flexible assessment options.
 */

import { Question, SIMPLE_QUESTIONS } from './questions';
import { ComprehensiveQuestion, COMPREHENSIVE_QUESTIONS } from './comprehensive-questions';
import { getAllComprehensiveQuestions } from './comprehensive-questions-extended';
import { ComprehensiveAssessmentScorer, AssessmentResults } from '../assessment-scoring/comprehensive-scoring';

// Assessment mode configuration
export type AssessmentMode = 'simple' | 'comprehensive' | 'adaptive';

export interface AssessmentConfig {
  mode: AssessmentMode;
  maxQuestions?: number;        // For adaptive mode
  focusSystems?: string[];      // For targeted assessments
  includeModerrFM?: boolean;    // Include modern FM categories
  adaptiveThreshold?: number;   // Score threshold for additional questions
}

export interface UnifiedAssessmentResults {
  mode: AssessmentMode;
  questionCount: number;
  completionRate: number;
  
  // Simple assessment results (backward compatibility)
  simpleResults?: {
    averageScore: number;
    categoryScores: Record<string, number>;
    significantFindings: string[];
  };
  
  // Comprehensive assessment results
  comprehensiveResults?: AssessmentResults;
  
  // Assessment quality metrics
  assessmentQuality: {
    confidence: 'high' | 'medium' | 'low' | 'insufficient';
    completionTime?: number;
    recommendedFollowUp?: string[];
  };
}

export class AssessmentIntegrator {
  private config: AssessmentConfig;

  constructor(config: AssessmentConfig) {
    this.config = config;
  }

  /**
   * Get appropriate questions based on assessment configuration
   */
  public getAssessmentQuestions(): (Question | ComprehensiveQuestion)[] {
    switch (this.config.mode) {
      case 'simple':
        return this.getSimpleQuestions();
        
      case 'comprehensive':
        return this.getComprehensiveQuestions();
        
      case 'adaptive':
        return this.getAdaptiveQuestions();
        
      default:
        return this.getSimpleQuestions();
    }
  }

  /**
   * Process assessment responses with appropriate scoring algorithm
   */
  public processAssessmentResults(
    responses: Array<{questionId: number, responseValue: number}>
  ): UnifiedAssessmentResults {
    
    console.log(`📊 Processing ${this.config.mode} assessment with ${responses.length} responses`);

    const questionCount = this.getAssessmentQuestions().length;
    const completionRate = Math.round((responses.length / questionCount) * 100);

    switch (this.config.mode) {
      case 'simple':
        return this.processSimpleResults(responses, questionCount, completionRate);
        
      case 'comprehensive':
        return this.processComprehensiveResults(responses, questionCount, completionRate);
        
      case 'adaptive':
        return this.processAdaptiveResults(responses, questionCount, completionRate);
        
      default:
        return this.processSimpleResults(responses, questionCount, completionRate);
    }
  }

  private getSimpleQuestions(): Question[] {
    // Return existing 80-question system for backward compatibility
    let questions = [...SIMPLE_QUESTIONS];

    // Apply focus system filter if specified
    if (this.config.focusSystems?.length) {
      questions = questions.filter(q => 
        this.config.focusSystems!.includes(q.category)
      );
    }

    return questions;
  }

  private getComprehensiveQuestions(): ComprehensiveQuestion[] {
    // Get all comprehensive questions (270+)
    let questions = getAllComprehensiveQuestions();

    // Filter by focus systems if specified
    if (this.config.focusSystems?.length) {
      questions = questions.filter(q => 
        this.config.focusSystems!.includes(q.systemCategory)
      );
    }

    // Filter modern FM questions if not included
    if (!this.config.includeModerrFM) {
      questions = questions.filter(q => !q.modernFMUpdate);
    }

    return questions.filter(q => q.isActive);
  }

  private getAdaptiveQuestions(): ComprehensiveQuestion[] {
    // Start with high-priority questions from each system
    const highPriorityQuestions = getAllComprehensiveQuestions()
      .filter(q => 
        q.isActive && 
        q.rootCauseIndicator && 
        q.diagnosticWeight >= 2.5
      )
      .slice(0, this.config.maxQuestions || 50);

    return highPriorityQuestions;
  }

  private processSimpleResults(
    responses: Array<{questionId: number, responseValue: number}>,
    questionCount: number,
    completionRate: number
  ): UnifiedAssessmentResults {
    
    // Calculate simple category scores (existing logic)
    const categoryScores: Record<string, number> = {};
    const categoryResponses: Record<string, number[]> = {};

    responses.forEach(response => {
      const question = SIMPLE_QUESTIONS.find(q => q.id === response.questionId);
      if (!question) return;

      if (!categoryResponses[question.category]) {
        categoryResponses[question.category] = [];
      }
      categoryResponses[question.category].push(response.responseValue);
    });

    // Calculate averages for each category
    Object.entries(categoryResponses).forEach(([category, scores]) => {
      categoryScores[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    const averageScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.values(categoryScores).length;

    // Identify significant findings (scores >= 4.0)
    const significantFindings: string[] = [];
    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score >= 4.0) {
        significantFindings.push(`High ${category} dysfunction (${score.toFixed(1)}/5.0)`);
      }
    });

    return {
      mode: 'simple',
      questionCount,
      completionRate,
      simpleResults: {
        averageScore,
        categoryScores,
        significantFindings,
      },
      assessmentQuality: {
        confidence: completionRate >= 80 ? 'high' : completionRate >= 60 ? 'medium' : 'low',
        recommendedFollowUp: averageScore >= 3.5 ? ['Consider comprehensive assessment for detailed analysis'] : [],
      },
    };
  }

  private processComprehensiveResults(
    responses: Array<{questionId: number, responseValue: number}>,
    questionCount: number,
    completionRate: number
  ): UnifiedAssessmentResults {
    
    // Use comprehensive scoring system
    const scorer = new ComprehensiveAssessmentScorer(responses);
    const comprehensiveResults = scorer.calculateComprehensiveResults();

    return {
      mode: 'comprehensive',
      questionCount,
      completionRate,
      comprehensiveResults,
      assessmentQuality: {
        confidence: comprehensiveResults.assessmentQuality.confidence,
        recommendedFollowUp: comprehensiveResults.assessmentQuality.recommendedImprovements,
      },
    };
  }

  private processAdaptiveResults(
    responses: Array<{questionId: number, responseValue: number}>,
    questionCount: number,
    completionRate: number
  ): UnifiedAssessmentResults {
    
    // Use comprehensive scoring but with adaptive interpretation
    const scorer = new ComprehensiveAssessmentScorer(responses);
    const comprehensiveResults = scorer.calculateComprehensiveResults();

    // Determine if additional questions are recommended
    const highScoringSystems = comprehensiveResults.systemScores
      .filter(s => s.adjustedScore >= (this.config.adaptiveThreshold || 3.5))
      .map(s => s.systemCategory);

    const recommendedFollowUp = highScoringSystems.length > 0 
      ? [`Consider full assessment for: ${highScoringSystems.join(', ')}`]
      : [];

    return {
      mode: 'adaptive',
      questionCount,
      completionRate,
      comprehensiveResults: {
        ...comprehensiveResults,
        // Mark as adaptive assessment
        assessmentQuality: {
          ...comprehensiveResults.assessmentQuality,
          confidence: 'medium', // Adaptive assessments have medium confidence
        },
      },
      assessmentQuality: {
        confidence: 'medium',
        recommendedFollowUp,
      },
    };
  }

  /**
   * Recommend assessment mode based on client profile
   */
  public static recommendAssessmentMode(clientProfile: {
    isNewClient: boolean;
    hasComplexSymptoms: boolean;
    timeAvailable: 'limited' | 'moderate' | 'extensive';
    practitionerPreference?: AssessmentMode;
  }): AssessmentConfig {
    
    // New clients with complex symptoms - comprehensive assessment
    if (clientProfile.isNewClient && clientProfile.hasComplexSymptoms && 
        clientProfile.timeAvailable === 'extensive') {
      return {
        mode: 'comprehensive',
        includeModerrFM: true,
      };
    }
    
    // Limited time but complex symptoms - adaptive assessment
    if (clientProfile.hasComplexSymptoms && clientProfile.timeAvailable === 'limited') {
      return {
        mode: 'adaptive',
        maxQuestions: 60,
        adaptiveThreshold: 3.0,
      };
    }
    
    // Simple follow-up or basic screening - simple assessment
    if (!clientProfile.hasComplexSymptoms || clientProfile.timeAvailable === 'limited') {
      return {
        mode: 'simple',
      };
    }
    
    // Default to practitioner preference or comprehensive
    return {
      mode: clientProfile.practitionerPreference || 'comprehensive',
      includeModerrFM: true,
    };
  }

  /**
   * Convert comprehensive results to simple format for backward compatibility
   */
  public static convertToSimpleFormat(results: AssessmentResults): {
    averageScore: number;
    categoryScores: Record<string, number>;
    significantFindings: string[];
  } {
    const categoryScores: Record<string, number> = {};
    
    results.systemScores.forEach(system => {
      categoryScores[system.systemCategory] = system.adjustedScore;
    });

    const averageScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.values(categoryScores).length;

    const significantFindings = results.systemScores
      .filter(s => s.severityLevel === 'severe' || s.severityLevel === 'critical')
      .map(s => `${s.systemName}: ${s.severityLevel} dysfunction`)
      .slice(0, 5);

    return {
      averageScore,
      categoryScores,
      significantFindings,
    };
  }
}

// Utility functions for assessment management
export function createSimpleAssessment(clientId: string): AssessmentIntegrator {
  return new AssessmentIntegrator({
    mode: 'simple'
  });
}

export function createComprehensiveAssessment(clientId: string, includeModerrFM: boolean = true): AssessmentIntegrator {
  return new AssessmentIntegrator({
    mode: 'comprehensive',
    includeModerrFM,
  });
}

export function createAdaptiveAssessment(clientId: string, maxQuestions: number = 60): AssessmentIntegrator {
  return new AssessmentIntegrator({
    mode: 'adaptive',
    maxQuestions,
    adaptiveThreshold: 3.0,
    includeModerrFM: true,
  });
}

// Assessment mode descriptions for UI
export const ASSESSMENT_MODE_INFO = {
  simple: {
    name: 'Simple Assessment (80 questions)',
    description: 'Quick functional medicine screening - established question set',
    duration: '10-15 minutes',
    bestFor: 'Follow-up assessments, basic screening, time-limited situations',
    confidence: 'Good for basic screening',
  },
  comprehensive: {
    name: 'Comprehensive Assessment (270+ questions)',
    description: 'Complete functional medicine evaluation with modern categories',
    duration: '30-45 minutes',
    bestFor: 'New clients, complex cases, thorough evaluation',
    confidence: 'Highest accuracy and clinical insight',
  },
  adaptive: {
    name: 'Adaptive Assessment (40-80 questions)',
    description: 'Smart question selection based on initial responses',
    duration: '15-25 minutes',
    bestFor: 'Balanced approach, moderate complexity cases',
    confidence: 'Good efficiency with targeted depth',
  },
};
