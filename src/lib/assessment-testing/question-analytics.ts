/**
 * Question Analytics & Optimization System
 * 
 * Tracks question performance, identifies optimization opportunities,
 * and provides data-driven recommendations for assessment improvement.
 */

import { ComprehensiveQuestion } from '../simple-assessment/comprehensive-questions';

// Performance tracking interfaces
export interface QuestionPerformance {
  questionId: number;
  questionText: string;
  systemCategory: string;
  subCategory: string;
  
  // Usage analytics
  usageCount: number;
  responseDistribution: Record<number, number>; // {1: 50, 2: 30, 3: 20, etc.}
  averageResponse: number;
  responseVariability: number;
  
  // Diagnostic effectiveness
  diagnosticAccuracy: number;      // How well does it predict clinical outcomes (0-100%)
  correlationStrength: number;     // Correlation with system dysfunction (0-1.0)
  discriminatoryPower: number;     // Ability to distinguish between healthy/unhealthy (0-1.0)
  
  // Client feedback & usability
  clientFeedback: ClientFeedback[];
  clarityScore: number;            // How well clients understand the question (1-5)
  relevanceScore: number;          // How relevant clients find the question (1-5)
  completionRate: number;          // Percentage of clients who answer this question
  
  // Clinical outcomes correlation
  treatmentSuccessCorrelation: number;  // Correlation with positive treatment outcomes
  protocolComplianceCorrelation: number; // Correlation with protocol adherence
  
  // Optimization recommendations
  recommendedActions: QuestionAction[];
  optimizationPriority: 'high' | 'medium' | 'low';
  lastAnalyzed: string;
}

export interface ClientFeedback {
  feedback: string;
  clarity: number;     // 1-5 scale
  relevance: number;   // 1-5 scale
  submittedAt: string;
  clientId?: string;   // Anonymous tracking
}

export interface QuestionAction {
  action: 'modify' | 'remove' | 'weight_adjust' | 'reword' | 'add_help_text';
  priority: number;
  description: string;
  rationale: string;
  suggestedChange?: string;
}

// System-level analytics
export interface SystemAnalytics {
  systemCategory: string;
  systemName: string;
  totalQuestions: number;
  averageDiagnosticWeight: number;
  overallPerformanceScore: number;
  
  // Question quality metrics
  highPerformingQuestions: number;
  lowPerformingQuestions: number;
  questionsNeedingReview: number;
  
  // Clinical effectiveness
  systemDiagnosticAccuracy: number;
  treatmentPredictiveValue: number;
  
  // Optimization recommendations
  systemOptimizationActions: SystemAction[];
}

export interface SystemAction {
  action: 'add_questions' | 'remove_questions' | 'reweight_system' | 'reorder_questions';
  priority: number;
  description: string;
  expectedImpact: string;
  suggestedQuestions?: string[];
}

// Assessment optimization report
export interface OptimizationReport {
  reportDate: string;
  assessmentVersion: string;
  totalAssessments: number;
  
  // Overall assessment performance
  overallDiagnosticAccuracy: number;
  averageCompletionTime: number;
  averageCompletionRate: number;
  clientSatisfactionScore: number;
  
  // Question-level recommendations
  questionsToModify: QuestionPerformance[];
  questionsToRemove: QuestionPerformance[];
  questionsToAdd: NewQuestionSuggestion[];
  
  // System-level recommendations
  systemOptimizations: SystemAnalytics[];
  scoringAdjustments: ScoringAdjustment[];
  
  // Implementation priorities
  implementationPriorities: OptimizationPriority[];
}

export interface NewQuestionSuggestion {
  systemCategory: string;
  subCategory: string;
  suggestedQuestion: string;
  rationale: string;
  expectedDiagnosticValue: number;
  priority: number;
}

export interface ScoringAdjustment {
  type: 'system_weight' | 'severity_threshold' | 'diagnostic_weight';
  target: string;
  currentValue: number;
  suggestedValue: number;
  rationale: string;
  expectedImpact: string;
}

export interface OptimizationPriority {
  priority: number;
  category: 'questions' | 'scoring' | 'system';
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
}

export class QuestionAnalyzer {
  private assessments: Array<{
    id: string;
    responses: Array<{questionId: number, responseValue: number}>;
    completionDate: string;
    treatmentOutcome?: string; // 'improved' | 'no_change' | 'worsened'
    protocolCompliance?: number; // 1-5 scale
  }>;

  constructor(assessments: any[]) {
    this.assessments = assessments;
  }

  public analyzeQuestionPerformance(): QuestionPerformance[] {
    console.log('📊 Analyzing question performance across', this.assessments.length, 'assessments...');
    
    const performances: QuestionPerformance[] = [];

    COMPREHENSIVE_QUESTIONS.forEach(question => {
      const performance = this.analyzeIndividualQuestion(question);
      performances.push(performance);
    });

    console.log('✅ Question performance analysis complete');
    return performances.sort((a, b) => b.diagnosticAccuracy - a.diagnosticAccuracy);
  }

  private analyzeIndividualQuestion(question: ComprehensiveQuestion): QuestionPerformance {
    // Get all responses for this question
    const responses = this.assessments
      .flatMap(assessment => assessment.responses)
      .filter(response => response.questionId === question.id);

    // Calculate response distribution
    const responseDistribution: Record<number, number> = {};
    let totalResponses = 0;
    let responseSum = 0;

    responses.forEach(response => {
      const value = response.responseValue;
      responseDistribution[value] = (responseDistribution[value] || 0) + 1;
      responseSum += value;
      totalResponses++;
    });

    const averageResponse = totalResponses > 0 ? responseSum / totalResponses : 0;

    // Calculate response variability (standard deviation)
    let varianceSum = 0;
    responses.forEach(response => {
      varianceSum += Math.pow(response.responseValue - averageResponse, 2);
    });
    const responseVariability = totalResponses > 1 ? 
      Math.sqrt(varianceSum / (totalResponses - 1)) : 0;

    // Calculate diagnostic accuracy (placeholder - would use real clinical data)
    const diagnosticAccuracy = this.calculateDiagnosticAccuracy(question, responses);
    
    // Calculate correlation strength (placeholder)
    const correlationStrength = this.calculateCorrelationStrength(question, responses);
    
    // Calculate completion rate
    const completionRate = this.assessments.length > 0 ? 
      (totalResponses / this.assessments.length) * 100 : 0;

    // Generate optimization recommendations
    const recommendedActions = this.generateQuestionRecommendations(
      question, 
      averageResponse, 
      responseVariability, 
      completionRate,
      diagnosticAccuracy
    );

    return {
      questionId: question.id,
      questionText: question.questionText,
      systemCategory: question.systemCategory,
      subCategory: question.subCategory,
      usageCount: totalResponses,
      responseDistribution,
      averageResponse,
      responseVariability,
      diagnosticAccuracy,
      correlationStrength,
      discriminatoryPower: this.calculateDiscriminatoryPower(responseDistribution),
      clientFeedback: [], // Would be populated from feedback collection
      clarityScore: 4.0, // Placeholder - would be from client feedback
      relevanceScore: 4.2, // Placeholder
      completionRate,
      treatmentSuccessCorrelation: 0.65, // Placeholder
      protocolComplianceCorrelation: 0.58, // Placeholder
      recommendedActions,
      optimizationPriority: this.determineOptimizationPriority(diagnosticAccuracy, completionRate),
      lastAnalyzed: new Date().toISOString(),
    };
  }

  private calculateDiagnosticAccuracy(question: ComprehensiveQuestion, responses: any[]): number {
    // Placeholder calculation - in production would correlate with clinical outcomes
    
    // High diagnostic weight questions should have higher baseline accuracy
    let baseAccuracy = question.diagnosticWeight * 25; // 2.5 weight = 62.5% base
    
    // Root cause indicators should be more accurate
    if (question.rootCauseIndicator) {
      baseAccuracy += 15;
    }
    
    // Modern FM questions might have lower initial accuracy until validated
    if (question.modernFMUpdate) {
      baseAccuracy -= 10;
    }
    
    // Add some variability based on response patterns
    const responseVariability = responses.length > 0 ? 
      responses.reduce((sum, r) => sum + r.responseValue, 0) / responses.length : 2.5;
    
    // Questions with more extreme responses (very high or low) tend to be more diagnostic
    const extremeResponseFactor = Math.abs(responseVariability - 2.5) * 5;
    baseAccuracy += extremeResponseFactor;
    
    return Math.min(95, Math.max(20, Math.round(baseAccuracy)));
  }

  private calculateCorrelationStrength(question: ComprehensiveQuestion, responses: any[]): number {
    // Placeholder - would calculate actual correlation with system dysfunction
    return question.diagnosticWeight / 3.0; // Normalize to 0-1.0 scale
  }

  private calculateDiscriminatoryPower(responseDistribution: Record<number, number>): number {
    // Calculate how well the question distinguishes between different levels of dysfunction
    const values = Object.keys(responseDistribution).map(Number);
    const counts = Object.values(responseDistribution);
    
    if (values.length <= 1) return 0;
    
    // Higher discriminatory power when responses are spread across the scale
    const totalResponses = counts.reduce((sum, count) => sum + count, 0);
    let entropy = 0;
    
    counts.forEach(count => {
      const probability = count / totalResponses;
      if (probability > 0) {
        entropy -= probability * Math.log2(probability);
      }
    });
    
    // Normalize entropy to 0-1 scale
    const maxEntropy = Math.log2(5); // 5 possible responses
    return entropy / maxEntropy;
  }

  private generateQuestionRecommendations(
    question: ComprehensiveQuestion,
    averageResponse: number,
    responseVariability: number,
    completionRate: number,
    diagnosticAccuracy: number
  ): QuestionAction[] {
    const actions: QuestionAction[] = [];

    // Low completion rate suggests confusion or irrelevance
    if (completionRate < 70) {
      actions.push({
        action: 'add_help_text',
        priority: 2,
        description: 'Add or improve help text to increase completion rate',
        rationale: `Only ${completionRate.toFixed(1)}% completion rate suggests confusion`,
        suggestedChange: 'Add explanatory text to clarify question intent',
      });
    }

    // Low diagnostic accuracy suggests question needs improvement
    if (diagnosticAccuracy < 60) {
      actions.push({
        action: 'modify',
        priority: 1,
        description: 'Question shows low diagnostic accuracy',
        rationale: `${diagnosticAccuracy}% diagnostic accuracy is below effective threshold`,
        suggestedChange: 'Reword for better clinical specificity',
      });
    }

    // Very low response variability suggests question isn't discriminating
    if (responseVariability < 0.8) {
      actions.push({
        action: 'reword',
        priority: 2,
        description: 'Low response variability - question may not be discriminating',
        rationale: `Variability of ${responseVariability.toFixed(2)} suggests most responses are similar`,
        suggestedChange: 'Make question more specific or adjust response options',
      });
    }

    // Very high average response for reverse-scored questions suggests ineffective question
    if (question.reverseScore && averageResponse > 4.0) {
      actions.push({
        action: 'weight_adjust',
        priority: 3,
        description: 'Consider reducing diagnostic weight for this symptom question',
        rationale: `High average response (${averageResponse.toFixed(1)}) suggests symptom is common but may not be specific`,
        suggestedChange: `Reduce diagnostic weight from ${question.diagnosticWeight} to ${(question.diagnosticWeight * 0.8).toFixed(1)}`,
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }

  private determineOptimizationPriority(diagnosticAccuracy: number, completionRate: number): 'high' | 'medium' | 'low' {
    // High priority: Low diagnostic accuracy OR very low completion rate
    if (diagnosticAccuracy < 60 || completionRate < 50) {
      return 'high';
    }
    
    // Medium priority: Moderate issues
    if (diagnosticAccuracy < 75 || completionRate < 70) {
      return 'medium';
    }
    
    // Low priority: Minor optimizations
    return 'low';
  }

  public generateOptimizationReport(): OptimizationReport {
    console.log('📋 Generating comprehensive optimization report...');
    
    const questionPerformances = this.analyzeQuestionPerformance();
    const systemAnalytics = this.analyzeSystemPerformance();
    
    // Identify questions needing attention
    const questionsToModify = questionPerformances.filter(q => 
      q.optimizationPriority === 'high' && q.diagnosticAccuracy < 75
    );
    
    const questionsToRemove = questionPerformances.filter(q => 
      q.diagnosticAccuracy < 40 && q.correlationStrength < 0.3
    );
    
    // Generate new question suggestions
    const questionsToAdd = this.suggestNewQuestions(systemAnalytics);
    
    // Scoring adjustments
    const scoringAdjustments = this.analyzeScoringOptimizations(questionPerformances);
    
    // Implementation priorities
    const implementationPriorities = this.prioritizeImplementations(
      questionsToModify,
      questionsToRemove,
      questionsToAdd,
      scoringAdjustments
    );

    console.log('✅ Optimization report generation complete');
    
    return {
      reportDate: new Date().toISOString(),
      assessmentVersion: '2.0-comprehensive',
      totalAssessments: this.assessments.length,
      
      overallDiagnosticAccuracy: this.calculateOverallAccuracy(questionPerformances),
      averageCompletionTime: 0, // Would track from real usage
      averageCompletionRate: this.calculateAverageCompletionRate(questionPerformances),
      clientSatisfactionScore: 4.1, // Placeholder - would be from feedback
      
      questionsToModify,
      questionsToRemove,
      questionsToAdd,
      systemOptimizations: systemAnalytics,
      scoringAdjustments,
      implementationPriorities,
    };
  }

  private analyzeSystemPerformance(): SystemAnalytics[] {
    const systemAnalytics: SystemAnalytics[] = [];

    Object.entries(SYSTEM_CATEGORIES).forEach(([systemKey, systemConfig]) => {
      const systemQuestions = COMPREHENSIVE_QUESTIONS.filter(q => 
        q.systemCategory === systemKey
      );

      if (systemQuestions.length === 0) return;

      const performanceData = systemQuestions.map(q => 
        this.analyzeIndividualQuestion(q)
      );

      const averageDiagnosticWeight = systemQuestions.reduce((sum, q) => 
        sum + q.diagnosticWeight, 0
      ) / systemQuestions.length;

      const overallPerformanceScore = performanceData.reduce((sum, p) => 
        sum + p.diagnosticAccuracy, 0
      ) / performanceData.length;

      const highPerforming = performanceData.filter(p => p.diagnosticAccuracy >= 75).length;
      const lowPerforming = performanceData.filter(p => p.diagnosticAccuracy < 60).length;
      const needingReview = performanceData.filter(p => p.optimizationPriority === 'high').length;

      // Generate system-level optimization actions
      const systemActions = this.generateSystemActions(systemKey, performanceData, systemConfig);

      systemAnalytics.push({
        systemCategory: systemKey,
        systemName: systemConfig.name,
        totalQuestions: systemQuestions.length,
        averageDiagnosticWeight,
        overallPerformanceScore,
        highPerformingQuestions: highPerforming,
        lowPerformingQuestions: lowPerforming,
        questionsNeedingReview: needingReview,
        systemDiagnosticAccuracy: overallPerformanceScore,
        treatmentPredictiveValue: overallPerformanceScore * 0.85, // Correlation estimate
        systemOptimizationActions: systemActions,
      });
    });

    return systemAnalytics.sort((a, b) => b.overallPerformanceScore - a.overallPerformanceScore);
  }

  private generateSystemActions(
    systemKey: string, 
    performanceData: QuestionPerformance[], 
    systemConfig: any
  ): SystemAction[] {
    const actions: SystemAction[] = [];

    // Check if system needs more questions
    if (performanceData.length < systemConfig.questionCount * 0.8) {
      actions.push({
        action: 'add_questions',
        priority: 2,
        description: `Add more questions to reach target of ${systemConfig.questionCount}`,
        expectedImpact: 'Improved diagnostic accuracy and system coverage',
        suggestedQuestions: this.suggestQuestionsForSystem(systemKey),
      });
    }

    // Check for low-performing questions to remove
    const lowPerforming = performanceData.filter(p => p.diagnosticAccuracy < 50);
    if (lowPerforming.length > 2) {
      actions.push({
        action: 'remove_questions',
        priority: 1,
        description: `Remove ${lowPerforming.length} low-performing questions`,
        expectedImpact: 'Reduced assessment length while maintaining diagnostic accuracy',
      });
    }

    // Check if system weight needs adjustment
    const overallAccuracy = performanceData.reduce((sum, p) => sum + p.diagnosticAccuracy, 0) / performanceData.length;
    if (overallAccuracy < 65 && systemConfig.diagnosticPriority === 1) {
      actions.push({
        action: 'reweight_system',
        priority: 3,
        description: 'Consider adjusting system weight based on performance',
        expectedImpact: 'Better balanced scoring across systems',
      });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }

  private suggestNewQuestions(systemAnalytics: SystemAnalytics[]): NewQuestionSuggestion[] {
    const suggestions: NewQuestionSuggestion[] = [];

    // Suggest questions for systems with low question counts or poor performance
    systemAnalytics.forEach(system => {
      if (system.totalQuestions < SYSTEM_CATEGORIES[system.systemCategory]?.questionCount * 0.7) {
        // System needs more questions - generate suggestions based on gaps
        const suggestionText = this.generateQuestionSuggestion(system.systemCategory);
        
        suggestions.push({
          systemCategory: system.systemCategory,
          subCategory: 'primary', // Default sub-category
          suggestedQuestion: suggestionText,
          rationale: `System has only ${system.totalQuestions} questions, target is ${SYSTEM_CATEGORIES[system.systemCategory]?.questionCount}`,
          expectedDiagnosticValue: 2.0,
          priority: system.lowPerformingQuestions > 2 ? 1 : 2,
        });
      }
    });

    return suggestions.sort((a, b) => a.priority - b.priority);
  }

  private generateQuestionSuggestion(systemCategory: string): string {
    // Generate system-specific question suggestions
    const suggestions = {
      digestive: [
        'How often do you experience food getting stuck or delayed digestion?',
        'How much do your symptoms improve on a low-FODMAP diet?',
        'How often do you have mucus in your stool?',
      ],
      energy: [
        'How much does your energy improve after eating vs. worsen?',
        'How often do you need stimulants (coffee, energy drinks) to function?',
        'How much does exercise improve vs. worsen your energy?',
      ],
      hormonal: [
        'How much do your symptoms fluctuate with your menstrual cycle?',
        'How often do you wake up between 1-3 AM unable to fall back asleep?',
        'How cold are your hands and feet compared to others?',
      ],
      modern_fm: [
        'How much do your symptoms worsen in moldy or water-damaged buildings?',
        'How often do you feel better when away from technology/cities?',
        'How much do you react to processed foods vs. whole foods?',
      ],
    };

    const systemSuggestions = suggestions[systemCategory] || ['How does this system affect your daily function?'];
    return systemSuggestions[Math.floor(Math.random() * systemSuggestions.length)];
  }

  private analyzeScoringOptimizations(performances: QuestionPerformance[]): ScoringAdjustment[] {
    const adjustments: ScoringAdjustment[] = [];

    // Analyze if any systems are consistently over/under-weighted
    const systemPerformances = new Map<string, number[]>();
    
    performances.forEach(p => {
      if (!systemPerformances.has(p.systemCategory)) {
        systemPerformances.set(p.systemCategory, []);
      }
      systemPerformances.get(p.systemCategory)!.push(p.diagnosticAccuracy);
    });

    systemPerformances.forEach((accuracies, system) => {
      const averageAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
      const currentWeight = SCORING_CONFIG.systemWeights[system] || 1.0;

      // If system performance is consistently low, consider reducing weight
      if (averageAccuracy < 60 && currentWeight > 0.8) {
        adjustments.push({
          type: 'system_weight',
          target: system,
          currentValue: currentWeight,
          suggestedValue: Math.round((currentWeight * 0.9) * 10) / 10,
          rationale: `Average diagnostic accuracy of ${averageAccuracy.toFixed(1)}% suggests over-weighting`,
          expectedImpact: 'More balanced scoring across systems',
        });
      }

      // If system performance is consistently high, consider increasing weight
      if (averageAccuracy > 85 && currentWeight < 1.2) {
        adjustments.push({
          type: 'system_weight',
          target: system,
          currentValue: currentWeight,
          suggestedValue: Math.round((currentWeight * 1.1) * 10) / 10,
          rationale: `High diagnostic accuracy of ${averageAccuracy.toFixed(1)}% suggests under-weighting`,
          expectedImpact: 'Better utilization of high-performing system',
        });
      }
    });

    return adjustments;
  }

  private prioritizeImplementations(
    questionsToModify: QuestionPerformance[],
    questionsToRemove: QuestionPerformance[],
    questionsToAdd: NewQuestionSuggestion[],
    scoringAdjustments: ScoringAdjustment[]
  ): OptimizationPriority[] {
    const priorities: OptimizationPriority[] = [];

    // High impact, low effort: Remove clearly ineffective questions
    if (questionsToRemove.length > 0) {
      priorities.push({
        priority: 1,
        category: 'questions',
        action: `Remove ${questionsToRemove.length} low-performing questions`,
        impact: 'high',
        effort: 'low',
        timeline: '1-2 weeks',
      });
    }

    // High impact, medium effort: Modify high-priority questions
    const highPriorityModifications = questionsToModify.filter(q => q.optimizationPriority === 'high');
    if (highPriorityModifications.length > 0) {
      priorities.push({
        priority: 2,
        category: 'questions',
        action: `Modify ${highPriorityModifications.length} high-priority questions`,
        impact: 'high',
        effort: 'medium',
        timeline: '2-4 weeks',
      });
    }

    // Medium impact, low effort: Scoring adjustments
    if (scoringAdjustments.length > 0) {
      priorities.push({
        priority: 3,
        category: 'scoring',
        action: `Adjust scoring weights for ${scoringAdjustments.length} systems`,
        impact: 'medium',
        effort: 'low',
        timeline: '1 week',
      });
    }

    return priorities;
  }

  private calculateOverallAccuracy(performances: QuestionPerformance[]): number {
    if (performances.length === 0) return 0;
    return performances.reduce((sum, p) => sum + p.diagnosticAccuracy, 0) / performances.length;
  }

  private calculateAverageCompletionRate(performances: QuestionPerformance[]): number {
    if (performances.length === 0) return 0;
    return performances.reduce((sum, p) => sum + p.completionRate, 0) / performances.length;
  }

  private suggestQuestionsForSystem(systemCategory: string): string[] {
    // Return suggestions based on system category
    return [
      `Additional ${systemCategory} assessment question needed`,
      `Specific ${systemCategory} dysfunction indicator`,
      `${systemCategory} treatment response predictor`,
    ];
  }
}

// Export utility functions
export function analyzeAssessmentData(assessments: any[]): OptimizationReport {
  const analyzer = new QuestionAnalyzer(assessments);
  return analyzer.generateOptimizationReport();
}

export function getQuestionPerformanceMetrics(assessments: any[]): QuestionPerformance[] {
  const analyzer = new QuestionAnalyzer(assessments);
  return analyzer.analyzeQuestionPerformance();
}
