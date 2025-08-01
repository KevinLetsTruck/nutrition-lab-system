import { 
  getQuestionById, 
  getQuestionsByCategory,
  SECTION_PRIORITY_QUESTIONS,
  RED_FLAG_SYMPTOMS,
  SYMPTOM_CLUSTERS,
  AssessmentSection
} from './complete-symptom-bank';
import { Response } from './symptom-ai-selector';

export interface QuestionFlowConfig {
  maxQuestionsPerSection: number;
  minQuestionsPerSection: number;
  followUpThreshold: number; // Severity score that triggers follow-ups (2 or 3)
  maxFollowUpsPerQuestion: number;
}

export const DEFAULT_FLOW_CONFIG: QuestionFlowConfig = {
  maxQuestionsPerSection: 20,
  minQuestionsPerSection: 5,
  followUpThreshold: 2,
  maxFollowUpsPerQuestion: 2
};

export class SymptomQuestionFlow {
  private config: QuestionFlowConfig;
  
  constructor(config: Partial<QuestionFlowConfig> = {}) {
    this.config = { ...DEFAULT_FLOW_CONFIG, ...config };
  }
  
  // Determine if we should continue asking questions in current section
  shouldContinueSection(
    section: AssessmentSection,
    responses: Response[],
    sectionResponses: Response[]
  ): boolean {
    // Check minimum questions
    if (sectionResponses.length < this.config.minQuestionsPerSection) {
      return true;
    }
    
    // Check maximum questions
    if (sectionResponses.length >= this.config.maxQuestionsPerSection) {
      return false;
    }
    
    // Check if there are high-severity symptoms that need more exploration
    const highSeverityCount = sectionResponses.filter(r => 
      typeof r.value === 'number' && r.value >= 2
    ).length;
    
    // Continue if more than 30% of responses show moderate/severe symptoms
    if (highSeverityCount / sectionResponses.length > 0.3) {
      return true;
    }
    
    // Check for red flag symptoms in this section
    const hasRedFlags = sectionResponses.some(r => 
      RED_FLAG_SYMPTOMS.includes(r.questionId)
    );
    
    if (hasRedFlags) {
      return true; // Continue to explore red flags
    }
    
    return false;
  }
  
  // Determine next section based on patterns and responses
  getNextSection(
    currentSection: AssessmentSection,
    completedSections: AssessmentSection[],
    allResponses: Response[]
  ): AssessmentSection | null {
    const allSections: AssessmentSection[] = [
      'digestive',
      'metabolicCardio',
      'neuroCognitive',
      'immuneInflammatory',
      'hormonal',
      'detoxification',
      'painMusculoskeletal',
      'driverSpecific',
      'ancestralMismatch'
    ];
    
    // Get remaining sections
    const remainingSections = allSections.filter(s => !completedSections.includes(s));
    
    if (remainingSections.length === 0) {
      return null; // Assessment complete
    }
    
    // Prioritize sections based on symptom patterns
    const sectionScores = this.scoreSections(remainingSections, allResponses);
    
    // Return highest scoring section
    const sortedSections = remainingSections.sort((a, b) => 
      (sectionScores[b] || 0) - (sectionScores[a] || 0)
    );
    
    return sortedSections[0];
  }
  
  // Score sections based on related symptoms already reported
  private scoreSections(
    sections: AssessmentSection[],
    responses: Response[]
  ): Record<AssessmentSection, number> {
    const scores: Record<string, number> = {};
    
    sections.forEach(section => {
      scores[section] = 0;
      
      // Check for related symptom clusters
      Object.entries(SYMPTOM_CLUSTERS).forEach(([clusterName, clusterQuestions]) => {
        const clusterResponses = responses.filter(r => 
          clusterQuestions.includes(r.questionId) && 
          typeof r.value === 'number' && 
          r.value >= 2
        );
        
        // If cluster symptoms are present, prioritize related sections
        if (clusterResponses.length > 0) {
          if (this.isClusterRelatedToSection(clusterName, section)) {
            scores[section] += clusterResponses.length * 2;
          }
        }
      });
      
      // Check for red flags that might relate to this section
      const redFlagResponses = responses.filter(r => 
        RED_FLAG_SYMPTOMS.includes(r.questionId) && 
        typeof r.value === 'number' && 
        r.value >= 1
      );
      
      redFlagResponses.forEach(response => {
        const question = getQuestionById(response.questionId);
        if (question && question.category === section) {
          scores[section] += 5; // High priority for red flags
        }
      });
    });
    
    return scores;
  }
  
  // Determine if a symptom cluster is related to a section
  private isClusterRelatedToSection(clusterName: string, section: AssessmentSection): boolean {
    const clusterSectionMap: Record<string, AssessmentSection[]> = {
      metabolicSyndrome: ['metabolicCardio', 'hormonal'],
      digestiveInsufficiency: ['digestive'],
      sibo: ['digestive', 'immuneInflammatory'],
      thyroidDysfunction: ['hormonal', 'metabolicCardio'],
      adrenalFatigue: ['hormonal', 'neuroCognitive'],
      inflammation: ['immuneInflammatory', 'painMusculoskeletal']
    };
    
    return clusterSectionMap[clusterName]?.includes(section) || false;
  }
  
  // Check if we should ask a follow-up question
  shouldAskFollowUp(lastResponse: Response, followUpCount: number): boolean {
    // Don't follow up on follow-ups
    if (lastResponse.isFollowUp) return false;
    
    // Check follow-up limit
    if (followUpCount >= this.config.maxFollowUpsPerQuestion) return false;
    
    // Check severity threshold
    if (typeof lastResponse.value === 'number' && lastResponse.value >= this.config.followUpThreshold) {
      return true;
    }
    
    // Always follow up on red flags
    if (RED_FLAG_SYMPTOMS.includes(lastResponse.questionId)) {
      return true;
    }
    
    return false;
  }
  
  // Get priority questions for initial section exploration
  getInitialQuestionsForSection(section: AssessmentSection): string[] {
    return SECTION_PRIORITY_QUESTIONS[section] || [];
  }
  
  // Estimate remaining questions
  estimateRemainingQuestions(
    currentSection: AssessmentSection,
    completedSections: AssessmentSection[],
    sectionResponses: Response[]
  ): number {
    const remainingSections = this.getRemainingAssessmentSections(completedSections);
    const currentSectionRemaining = Math.max(
      0,
      this.config.minQuestionsPerSection - sectionResponses.length
    );
    
    // Estimate based on minimum questions per section
    const otherSectionsEstimate = remainingSections.length * this.config.minQuestionsPerSection;
    
    return currentSectionRemaining + otherSectionsEstimate;
  }
  
  private getRemainingAssessmentSections(completedSections: AssessmentSection[]): AssessmentSection[] {
    const allSections: AssessmentSection[] = [
      'digestive',
      'metabolicCardio', 
      'neuroCognitive',
      'immuneInflammatory',
      'hormonal',
      'detoxification',
      'painMusculoskeletal',
      'driverSpecific',
      'ancestralMismatch'
    ];
    
    return allSections.filter(s => !completedSections.includes(s));
  }
  
  // Check if assessment is complete
  isAssessmentComplete(
    completedSections: AssessmentSection[],
    totalResponses: Response[]
  ): boolean {
    // Must complete core sections
    const coreSections: AssessmentSection[] = [
      'digestive',
      'metabolicCardio',
      'neuroCognitive'
    ];
    
    const coreComplete = coreSections.every(s => completedSections.includes(s));
    
    // Must have minimum total responses
    const hasMinimumResponses = totalResponses.length >= 30;
    
    // If significant symptoms found, ensure thorough assessment
    const severeSymptomsCount = totalResponses.filter(r => 
      typeof r.value === 'number' && r.value >= 3
    ).length;
    
    if (severeSymptomsCount > 5 && completedSections.length < 5) {
      return false; // Need more thorough assessment
    }
    
    return coreComplete && hasMinimumResponses;
  }
}

// Export singleton instance
export const symptomQuestionFlow = new SymptomQuestionFlow();