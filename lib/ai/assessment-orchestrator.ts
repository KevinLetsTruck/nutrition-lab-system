// Enhanced AI Assessment Orchestrator (continued)
// This manages the adaptive questioning logic to ensure users answer 200-250 questions
// from the 495 total questions, achieving 90% diagnostic accuracy

import { Anthropic } from '@anthropic-ai/sdk';
import { 
  AssessmentQuestion, 
  ClientResponse, 
  FunctionalModule,
  QuestionType,
  QuestionCategory 
} from '../assessment/types';
import { getQuestionsByModule, getQuestionById } from '../assessment/questions';

// [Previous interfaces and definitions from above...]

export class AssessmentOrchestrator {
  private anthropic: Anthropic;
  private context: AssessmentContext;
  private readonly TARGET_MIN_QUESTIONS = 200;
  private readonly TARGET_MAX_QUESTIONS = 250;

  constructor(apiKey: string, context: AssessmentContext) {
    this.anthropic = new Anthropic({ apiKey });
    this.context = context;
  }

  // Update module scores based on responses
  private updateModuleScores(): void {
    const modules = Object.values(FunctionalModule);
    
    this.context.moduleScores = modules.map(module => {
      const moduleResponses = this.context.responses.filter(r => 
        r.questionModule === module
      );
      
      const score = this.calculateModuleScore(moduleResponses);
      const threshold = MODULE_ACTIVATION_THRESHOLDS[module].threshold;
      
      return {
        module,
        score,
        questionsAnswered: moduleResponses.length,
        activated: score >= threshold || module === FunctionalModule.SCREENING,
        priority: this.calculateModulePriority(module, score),
        completionStatus: this.getModuleCompletionStatus(module, moduleResponses.length)
      };
    });
  }

  // Calculate module score
  private calculateModuleScore(responses: ClientResponse[]): number {
    if (responses.length === 0) return 0;
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const response of responses) {
      const question = getQuestionById(response.questionId);
      if (!question) continue;
      
      const responseScore = this.getResponseScore(response, question);
      totalScore += responseScore * question.scoringWeight;
      totalWeight += question.scoringWeight;
    }
    
    return totalWeight > 0 ? (totalScore / totalWeight) * 20 : 0; // Scale to 0-100
  }

  // Get numeric score for response
  private getResponseScore(response: ClientResponse, question: AssessmentQuestion): number {
    if (question.type === QuestionType.LIKERT_SCALE) {
      return Number(response.responseValue) / 10;
    }
    
    if (question.options) {
      const option = question.options.find(o => o.value === response.responseValue);
      return option?.score || 0;
    }
    
    return 0;
  }

  // Calculate module priority
  private calculateModulePriority(module: FunctionalModule, score: number): number {
    // Higher score = higher priority
    let priority = Math.min(score / 10, 10);
    
    // Boost priority if module appears in detected patterns
    const inPatterns = this.context.symptomClusters.some(cluster => 
      cluster.relatedModules.includes(module)
    );
    if (inPatterns) priority += 2;
    
    // Boost priority for seed oil relevant modules
    if ([FunctionalModule.ENERGY, FunctionalModule.BIOTRANSFORMATION].includes(module)) {
      if (this.context.seedOilMetrics.exposureLevel > 5) priority += 1;
    }
    
    return Math.min(priority, 10);
  }

  // Get module completion status
  private getModuleCompletionStatus(
    module: FunctionalModule, 
    questionsAnswered: number
  ): 'not_started' | 'in_progress' | 'sufficient' | 'complete' {
    const thresholds = MODULE_ACTIVATION_THRESHOLDS[module];
    
    if (questionsAnswered === 0) return 'not_started';
    if (questionsAnswered >= thresholds.maxQuestions) return 'complete';
    if (questionsAnswered >= thresholds.minQuestions) return 'sufficient';
    return 'in_progress';
  }

  // Update completion prediction
  private updateCompletionPrediction(): void {
    const totalQuestions = this.context.questionsAsked;
    const activatedModules = this.context.moduleScores.filter(m => m.activated);
    const sufficientModules = activatedModules.filter(m => 
      m.completionStatus === 'sufficient' || m.completionStatus === 'complete'
    );
    
    // Estimate remaining questions
    const remainingModules = activatedModules.filter(m => 
      m.completionStatus === 'in_progress' || m.completionStatus === 'not_started'
    );
    
    const estimatedRemaining = remainingModules.reduce((sum, module) => {
      const minQuestions = MODULE_ACTIVATION_THRESHOLDS[module.module].minQuestions;
      return sum + Math.max(0, minQuestions - module.questionsAnswered);
    }, 0);
    
    // Calculate confidence
    const confidence = Math.min(
      sufficientModules.length / Math.max(activatedModules.length, 1),
      0.95
    );
    
    // Check if ready for analysis
    const readyForAnalysis = 
      totalQuestions >= this.TARGET_MIN_QUESTIONS && 
      sufficientModules.length >= 3 &&
      this.context.moduleScores.find(m => m.module === FunctionalModule.SCREENING)?.completionStatus === 'complete';
    
    this.context.completionPrediction = {
      estimatedQuestionsRemaining: estimatedRemaining,
      confidence,
      readyForAnalysis,
      missingCriticalAreas: this.identifyMissingAreas()
    };
  }

  // Identify missing critical areas
  private identifyMissingAreas(): FunctionalModule[] {
    const critical = [];
    
    // Check for high-priority modules not yet explored
    for (const moduleScore of this.context.moduleScores) {
      if (moduleScore.priority >= 7 && moduleScore.completionStatus === 'not_started') {
        critical.push(moduleScore.module);
      }
    }
    
    return critical;
  }

  // Check if should terminate early
  private shouldTerminateEarly(): boolean {
    // Hard limit at 250 questions
    if (this.context.questionsAsked >= this.TARGET_MAX_QUESTIONS) return true;
    
    // Low risk profile - can stop at 200
    if (this.context.questionsAsked >= this.TARGET_MIN_QUESTIONS) {
      const averageScore = this.context.moduleScores.reduce((sum, m) => sum + m.score, 0) / 
                          this.context.moduleScores.length;
      if (averageScore < 30) return true; // Low risk
    }
    
    // Clear pattern identified - can stop at 225
    if (this.context.questionsAsked >= 225) {
      const highConfidencePatterns = this.context.symptomClusters.filter(c => c.confidence > 0.8);
      if (highConfidencePatterns.length >= 2) return true;
    }
    
    // All critical areas covered
    if (this.context.completionPrediction.readyForAnalysis && 
        this.context.completionPrediction.missingCriticalAreas.length === 0) {
      return true;
    }
    
    return false;
  }

  // Get termination reason
  private getTerminationReason(): string {
    if (this.context.questionsAsked >= this.TARGET_MAX_QUESTIONS) {
      return "Maximum question limit reached (250 questions)";
    }
    
    const averageScore = this.context.moduleScores.reduce((sum, m) => sum + m.score, 0) / 
                        this.context.moduleScores.length;
    if (averageScore < 30) {
      return "Low risk profile identified - assessment complete";
    }
    
    const patterns = this.context.symptomClusters.map(c => c.name).join(', ');
    if (patterns) {
      return `Clear patterns identified: ${patterns}. Sufficient data for analysis.`;
    }
    
    return "All critical areas assessed - ready for comprehensive analysis";
  }

  // Check if current module is complete
  private isCurrentModuleComplete(): boolean {
    const currentModuleScore = this.context.moduleScores.find(m => 
      m.module === this.context.currentModule
    );
    
    if (!currentModuleScore) return true;
    
    return currentModuleScore.completionStatus === 'sufficient' || 
           currentModuleScore.completionStatus === 'complete';
  }

  // Select next module based on priority
  private selectNextModule(): FunctionalModule | null {
    // Sort modules by priority, excluding completed ones
    const availableModules = this.context.moduleScores
      .filter(m => 
        m.activated && 
        m.completionStatus !== 'sufficient' && 
        m.completionStatus !== 'complete'
      )
      .sort((a, b) => b.priority - a.priority);
    
    return availableModules.length > 0 ? availableModules[0].module : null;
  }

  // Get first question for new module
  private async getFirstQuestionForModule(module: FunctionalModule): Promise<AIDecision> {
    const moduleQuestions = getQuestionsByModule(module);
    const answeredIds = this.context.responses.map(r => r.questionId);
    const unanswered = moduleQuestions.filter(q => !answeredIds.includes(q.id));
    
    if (unanswered.length === 0) {
      return {
        reasoning: `No unanswered questions in ${module}`,
        confidenceScore: 0.9
      };
    }
    
    // Select most relevant first question for the module
    const firstQuestion = await this.selectWithClaude(unanswered.slice(0, 10), module);
    
    return {
      nextQuestion: firstQuestion,
      nextModule: module,
      reasoning: `Starting ${module} module based on symptom patterns`,
      confidenceScore: 0.85
    };
  }

  // Select next question using Claude AI
  private async selectNextQuestionWithAI(): Promise<AIDecision> {
    const moduleQuestions = getQuestionsByModule(this.context.currentModule);
    const answeredIds = this.context.responses.map(r => r.questionId);
    const unanswered = moduleQuestions.filter(q => !answeredIds.includes(q.id));
    
    if (unanswered.length === 0) {
      return {
        reasoning: "All questions in current module answered",
        confidenceScore: 1.0
      };
    }
    
    // Filter out questions that can be skipped based on patterns
    const questionsToConsider = this.filterSkippableQuestions(unanswered);
    
    // Use Claude to select the most diagnostic question
    const selectedQuestion = await this.selectWithClaude(
      questionsToConsider.slice(0, 20), // Consider top 20 candidates
      this.context.currentModule
    );
    
    // Identify questions that can be skipped
    const skipQuestions = this.identifySkippableQuestions(selectedQuestion);
    
    // Increment question saved counter
    this.context.questionsSaved += skipQuestions.length;
    
    return {
      nextQuestion: selectedQuestion,
      skipQuestions,
      reasoning: this.generateReasoning(selectedQuestion),
      patternDetected: this.context.symptomClusters[0]?.name,
      confidenceScore: this.calculateConfidence(selectedQuestion)
    };
  }

  // Filter out skippable questions
  private filterSkippableQuestions(questions: AssessmentQuestion[]): AssessmentQuestion[] {
    const patterns = this.context.symptomClusters;
    
    return questions.filter(q => {
      // Check if question is in any pattern's skipIfClear list
      for (const pattern of patterns) {
        if (pattern.confidence > 0.7) {
          const patternDef = SYMPTOM_PATTERNS[pattern.name as keyof typeof SYMPTOM_PATTERNS];
          if (patternDef?.skipIfClear?.some(skip => q.clinicalRelevance?.includes(skip))) {
            return false; // Skip this question
          }
        }
      }
      return true;
    });
  }

  // Use Claude to select best question
  private async selectWithClaude(
    candidates: AssessmentQuestion[], 
    module: FunctionalModule
  ): Promise<AssessmentQuestion> {
    const prompt = this.buildClaudePrompt(candidates, module);
    
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3 // Lower temperature for more consistent selection
      });
      
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const selectedId = this.parseClaudeResponse(content);
      
      return candidates.find(q => q.id === selectedId) || candidates[0];
    } catch (error) {
      console.error('Claude API error:', error);
      // Fallback to first question
      return candidates[0];
    }
  }

  // Build prompt for Claude
  private buildClaudePrompt(candidates: AssessmentQuestion[], module: FunctionalModule): string {
    const recentResponses = this.context.responses.slice(-10);
    const patterns = this.context.symptomClusters.map(c => c.name).join(', ');
    
    return `You are conducting a functional medicine assessment. Based on the following context, select the MOST DIAGNOSTIC next question.

Current Module: ${module}
Questions Asked: ${this.context.questionsAsked}
Target Range: ${this.TARGET_MIN_QUESTIONS}-${this.TARGET_MAX_QUESTIONS} total questions
Detected Patterns: ${patterns || 'None yet'}
Module Scores: ${JSON.stringify(this.context.moduleScores.map(m => ({ module: m.module, score: m.score })))}
Seed Oil Metrics: Exposure: ${this.context.seedOilMetrics.exposureLevel}/10, Damage: ${this.context.seedOilMetrics.damageIndicators}/10

Recent Responses (last 10):
${recentResponses.map(r => `- ${r.questionText}: ${r.responseValue}`).join('\n')}

Candidate Questions:
${candidates.map(q => `${q.id}: ${q.text} (Weight: ${q.scoringWeight}, Relevance: ${q.clinicalRelevance?.join(', ')})`).join('\n')}

Select the question that will:
1. Provide maximum diagnostic value
2. Avoid redundancy with already gathered information
3. Follow logical clinical reasoning
4. Help confirm or rule out suspected patterns
5. Keep us on track to complete assessment within 200-250 questions

Return ONLY the question ID of your selection.`;
  }

  // Parse Claude's response to get question ID
  private parseClaudeResponse(response: string): string {
    // Extract question ID from response (e.g., "SCR001" or "ASM023")
    const match = response.match(/[A-Z]{3}\d{3}/);
    return match ? match[0] : '';
  }

  // Identify questions that can be skipped
  private identifySkippableQuestions(selected: AssessmentQuestion): string[] {
    const skipList: string[] = [];
    
    // If we're asking about a specific condition, skip general questions
    if (selected.clinicalRelevance?.includes('specific_diagnosis')) {
      const generalQuestions = getQuestionsByModule(this.context.currentModule)
        .filter(q => q.clinicalRelevance?.includes('general_screening'))
        .map(q => q.id);
      skipList.push(...generalQuestions);
    }
    
    return skipList;
  }

  // Generate reasoning for question selection
  private generateReasoning(question: AssessmentQuestion): string {
    const patterns = this.context.symptomClusters.map(c => c.name).join(', ');
    const module = this.context.currentModule;
    
    if (patterns) {
      return `Selected to explore ${patterns} pattern in ${module} module. This question targets ${question.clinicalRelevance?.join(', ')}.`;
    }
    
    return `Exploring ${module} module systematically. This question assesses ${question.clinicalRelevance?.join(', ')}.`;
  }

  // Calculate confidence in selection
  private calculateConfidence(question: AssessmentQuestion): number {
    let confidence = 0.7; // Base confidence
    
    // Higher confidence if question relates to detected patterns
    const patterns = this.context.symptomClusters;
    for (const pattern of patterns) {
      if (question.clinicalRelevance?.some(r => pattern.keySymptoms.includes(r))) {
        confidence += 0.1 * pattern.confidence;
      }
    }
    
    // Higher confidence if high scoring weight
    confidence += question.scoringWeight * 0.05;
    
    return Math.min(confidence, 0.95);
  }

  // Calculate severity for pattern
  private calculateSeverity(pattern: any): 'low' | 'moderate' | 'high' | 'critical' {
    const avgScore = this.context.moduleScores
      .filter(m => pattern.modules.includes(m.module))
      .reduce((sum, m) => sum + m.score, 0) / pattern.modules.length;
    
    if (avgScore >= 75) return 'critical';
    if (avgScore >= 50) return 'high';
    if (avgScore >= 25) return 'moderate';
    return 'low';
  }

  // Update seed oil metrics
  updateSeedOilMetrics(): void {
    const seedOilResponses = this.context.responses.filter(r => {
      const question = getQuestionById(r.questionId);
      return question?.seedOilRelevant || question?.category === QuestionCategory.SEED_OIL;
    });
    
    let exposureScore = 0;
    let damageScore = 0;
    const criticalFindings: string[] = [];
    
    for (const response of seedOilResponses) {
      const question = getQuestionById(response.questionId);
      if (!question) continue;
      
      const score = this.getResponseScore(response, question);
      
      if (question.clinicalRelevance?.includes('seed_oil_exposure')) {
        exposureScore += score;
      }
      if (question.clinicalRelevance?.includes('oxidative_damage')) {
        damageScore += score;
      }
      
      if (score >= 3) {
        criticalFindings.push(question.text);
      }
    }
    
    // Calculate recovery potential (inverse of damage)
    const recoveryPotential = Math.max(0, 10 - damageScore);
    
    this.context.seedOilMetrics = {
      exposureLevel: Math.min(exposureScore, 10),
      damageIndicators: Math.min(damageScore, 10),
      recoveryPotential,
      questionsAsked: seedOilResponses.length,
      criticalFindings
    };
  }

  // Get assessment summary
  getAssessmentSummary(): any {
    return {
      questionsAsked: this.context.questionsAsked,
      questionsSaved: this.context.questionsSaved,
      modules: this.context.moduleScores,
      patterns: this.context.symptomClusters,
      seedOilMetrics: this.context.seedOilMetrics,
      completion: this.context.completionPrediction,
      riskLevel: this.calculateOverallRisk(),
      estimatedTimeRemaining: this.estimateTimeRemaining()
    };
  }

  // Calculate overall risk level
  private calculateOverallRisk(): 'low' | 'moderate' | 'high' | 'critical' {
    const avgScore = this.context.moduleScores.reduce((sum, m) => sum + m.score, 0) / 
                    this.context.moduleScores.length;
    
    const criticalPatterns = this.context.symptomClusters.filter(c => c.severity === 'critical');
    
    if (criticalPatterns.length > 0 || avgScore >= 70) return 'critical';
    if (avgScore >= 50) return 'high';
    if (avgScore >= 30) return 'moderate';
    return 'low';
  }

  // Estimate time remaining
  private estimateTimeRemaining(): number {
    const remainingQuestions = Math.min(
      this.context.completionPrediction.estimatedQuestionsRemaining,
      this.TARGET_MAX_QUESTIONS - this.context.questionsAsked
    );
    
    // Assume 15 seconds per question average
    return Math.ceil(remainingQuestions * 15 / 60); // Return in minutes
  }
}

// Export the orchestrator and types
export default AssessmentOrchestrator;