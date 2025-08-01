import ClaudeClient from '@/lib/claude-client';
import { 
  getQuestionById, 
  getQuestionsByCategory, 
  SECTION_PRIORITY_QUESTIONS,
  RED_FLAG_SYMPTOMS,
  SYMPTOM_CLUSTERS,
  SymptomQuestion,
  getAllQuestions
} from './complete-symptom-bank';
import { DetectedPattern } from './pattern-matcher';

export interface Response {
  questionId: string;
  questionText?: string;
  value: number | string;
  timestamp: Date;
  isFollowUp?: boolean;
}

export interface StructuredQuestion {
  id: string;
  section: string;
  questionText: string;
  responseType: 'scale' | 'multiple_choice' | 'binary' | 'frequency';
  options: Array<{
    value: number | string;
    label: string;
    description?: string;
  }>;
  aiContext?: string;
  truckDriverContext?: string;
  isFollowUp?: boolean;
  parentQuestionId?: string;
}

export class SymptomFocusedAI {
  private claudeClient: ClaudeClient | null = null;
  
  private getClaudeClient(): ClaudeClient | null {
    if (!this.claudeClient) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('ANTHROPIC_API_KEY not configured');
        return null;
      }
      this.claudeClient = new ClaudeClient(apiKey);
    }
    return this.claudeClient;
  }
  
  async selectNextQuestion(
    responses: Response[], 
    patterns: DetectedPattern[],
    currentSection: string
  ): Promise<StructuredQuestion | null> {
    // Get list of already asked question IDs
    const askedQuestionIds = responses.map(r => r.questionId);
    
    // First check if we should ask a follow-up to the last response
    if (responses.length > 0) {
      const lastResponse = responses[responses.length - 1];
      
      // Only generate follow-ups for non-follow-up questions with moderate/severe symptoms
      if (!lastResponse.isFollowUp && typeof lastResponse.value === 'number' && lastResponse.value >= 2) {
        const followUp = await this.generateFollowUpQuestion(lastResponse, responses);
        if (followUp) return followUp;
      }
    }
    
    // Otherwise, select next primary symptom question
    const nextQuestion = await this.selectPrimaryQuestion(currentSection, askedQuestionIds, responses, patterns);
    return nextQuestion;
  }
  
  private async selectPrimaryQuestion(
    section: string,
    askedQuestionIds: string[],
    responses: Response[],
    patterns: DetectedPattern[]
  ): Promise<StructuredQuestion | null> {
    // Get priority questions for this section
    const priorityQuestions = SECTION_PRIORITY_QUESTIONS[section] || [];
    
    // Find first unasked priority question
    for (const questionId of priorityQuestions) {
      if (!askedQuestionIds.includes(questionId)) {
        const question = getQuestionById(questionId);
        if (question) {
          return this.convertToStructuredQuestion(question, section);
        }
      }
    }
    
    // If all priority questions asked, get remaining questions in section
    const sectionQuestions = getQuestionsByCategory(section);
    const unaskedQuestions = sectionQuestions.filter(q => !askedQuestionIds.includes(q.id));
    
    if (unaskedQuestions.length === 0) {
      return null; // Section complete
    }
    
    // If we have patterns, try to select relevant questions
    if (patterns.length > 0 && this.claudeClient) {
      const selectedQuestion = await this.aiSelectRelevantQuestion(unaskedQuestions, responses, patterns, section);
      if (selectedQuestion) return selectedQuestion;
    }
    
    // Otherwise return the first unasked question
    return this.convertToStructuredQuestion(unaskedQuestions[0], section);
  }
  
  private async aiSelectRelevantQuestion(
    availableQuestions: SymptomQuestion[],
    responses: Response[],
    patterns: DetectedPattern[],
    section: string
  ): Promise<StructuredQuestion | null> {
    const client = this.getClaudeClient();
    if (!client) return null;
    
    const prompt = `
    You are helping select the most relevant symptom question to ask next.
    
    Current section: ${section}
    Detected patterns: ${patterns.map(p => p.displayName).join(', ')}
    Recent responses showing symptoms: ${responses.filter(r => Number(r.value) >= 2).map(r => r.questionId).join(', ')}
    
    Available questions to choose from:
    ${availableQuestions.map(q => `- ${q.id}: "${q.text}"`).join('\n')}
    
    Based on the patterns and symptoms, which question would provide the most valuable information?
    Consider symptom clusters - if someone has ${patterns[0]?.displayName}, what related symptoms should we check?
    
    Return ONLY the question ID, nothing else.
    `;
    
    try {
      const response = await client.analyzePractitionerReport(
        prompt,
        "Select the most clinically relevant symptom question"
      );
      
      const selectedId = response.trim();
      const selectedQuestion = availableQuestions.find(q => q.id === selectedId);
      
      if (selectedQuestion) {
        return this.convertToStructuredQuestion(selectedQuestion, section);
      }
    } catch (error) {
      console.error('Error in AI question selection:', error);
    }
    
    return null;
  }
  
  async generateFollowUpQuestion(
    lastResponse: Response,
    allResponses: Response[]
  ): Promise<StructuredQuestion | null> {
    const client = this.getClaudeClient();
    if (!client) return null;
    
    // Get the original question details
    const originalQuestion = getQuestionById(lastResponse.questionId);
    if (!originalQuestion) return null;
    
    // Check if this is a red flag symptom
    const isRedFlag = RED_FLAG_SYMPTOMS.includes(lastResponse.questionId);
    
    const prompt = `
    The client just reported: "${originalQuestion.text}" with severity ${lastResponse.value}/3.
    ${isRedFlag ? 'This is a RED FLAG symptom requiring careful follow-up.' : ''}
    
    Generate ONE brief follow-up question to understand the practical impact or circumstances.
    Focus on symptom details, not lifestyle or behavior.
    
    Good follow-up types:
    - "When does this [symptom] occur?" (timing/triggers)
    - "What makes this [symptom] better or worse?" (modulating factors)
    - "How long have you had this [symptom]?" (duration)
    - "Does this [symptom] affect your ability to drive/work?" (functional impact)
    - "On a scale of 1-10, how much does this interfere with daily life?" (severity)
    
    Keep it brief and focused on the symptom experience.
    
    Return as JSON:
    {
      "questionText": "your follow-up question",
      "responseType": "multiple_choice",
      "options": [
        {"value": 0, "label": "option 1"},
        {"value": 1, "label": "option 2"},
        {"value": 2, "label": "option 3"},
        {"value": 3, "label": "option 4"}
      ]
    }
    `;
    
    try {
      const response = await client.analyzePractitionerReport(
        prompt,
        "Generate a focused symptom follow-up question"
      );
      
      const parsed = JSON.parse(response);
      
      return {
        id: `${lastResponse.questionId}_followup_${Date.now()}`,
        section: originalQuestion.category || 'general',
        questionText: parsed.questionText,
        responseType: parsed.responseType,
        options: parsed.options,
        isFollowUp: true,
        parentQuestionId: lastResponse.questionId,
        aiContext: isRedFlag ? 'Red flag symptom follow-up' : 'Symptom detail follow-up'
      };
    } catch (error) {
      console.error('Error generating follow-up question:', error);
      return null;
    }
  }
  
  private convertToStructuredQuestion(
    question: SymptomQuestion,
    section: string
  ): StructuredQuestion {
    return {
      id: question.id,
      section: section,
      questionText: question.text,
      responseType: question.type,
      options: question.options,
      aiContext: question.aiContext,
      truckDriverContext: question.truckDriverContext
    };
  }
  
  // Get initial question for a section
  async getInitialQuestion(section: string): Promise<StructuredQuestion> {
    const priorityQuestions = SECTION_PRIORITY_QUESTIONS[section] || [];
    
    if (priorityQuestions.length > 0) {
      const firstQuestion = getQuestionById(priorityQuestions[0]);
      if (firstQuestion) {
        return this.convertToStructuredQuestion(firstQuestion, section);
      }
    }
    
    // Fallback to first question in section
    const sectionQuestions = getQuestionsByCategory(section);
    if (sectionQuestions.length > 0) {
      return this.convertToStructuredQuestion(sectionQuestions[0], section);
    }
    
    // Ultimate fallback
    return {
      id: 'fallback_general',
      section: section,
      questionText: 'Do you have any other symptoms in this area?',
      responseType: 'binary',
      options: [
        { value: 0, label: 'No' },
        { value: 1, label: 'Yes' }
      ]
    };
  }
  
  // Validate that a question is symptom-focused
  validateQuestionIsSymptomFocused(questionText: string): boolean {
    const behaviorKeywords = [
      'how often do you',
      'how many times',
      'what time do you',
      'where do you',
      'do you usually',
      'your daily',
      'your routine'
    ];
    
    const symptomKeywords = [
      'do you experience',
      'do you feel',
      'rate your',
      'how severe',
      'do you have',
      'do you get',
      'are you experiencing'
    ];
    
    const textLower = questionText.toLowerCase();
    
    const hasBehaviorKeywords = behaviorKeywords.some(keyword => textLower.includes(keyword));
    const hasSymptomKeywords = symptomKeywords.some(keyword => textLower.includes(keyword));
    
    // Should have symptom keywords and avoid behavior keywords
    return hasSymptomKeywords && !hasBehaviorKeywords;
  }
}

// Export singleton instance
export const symptomAISelector = new SymptomFocusedAI();