import ClaudeClient from '@/lib/claude-client';
import { StructuredQuestion, ResponseOption } from '@/components/assessment/StructuredQuestion';
import { DetectedPattern } from '@/lib/assessment/pattern-matcher';

export interface Response {
  questionId: string;
  value: number | string;
  timestamp: Date;
}

export class AIQuestionSelector {
  private claudeClient: ClaudeClient | null = null;
  private truckDriverContext: boolean = true;
  
  constructor() {
    // Don't initialize Claude client in constructor
    // We'll do it lazily when needed
  }
  
  private getClaudeClient(): ClaudeClient | null {
    if (!this.claudeClient && typeof process !== 'undefined' && process.env?.ANTHROPIC_API_KEY) {
      try {
        this.claudeClient = ClaudeClient.getInstance();
      } catch (error) {
        console.error('Failed to initialize Claude client:', error);
        return null;
      }
    }
    return this.claudeClient;
  }
  
  async selectNextQuestion(
    currentResponses: Response[], 
    detectedPatterns: DetectedPattern[],
    currentSection: string
  ): Promise<StructuredQuestion | null> {
    
    // Get list of already asked question IDs
    const askedQuestionIds = currentResponses.map(r => r.questionId);
    
    const prompt = `
    You are Kevin Rutherford, FNTP specializing in truck driver health.
    
    Current assessment section: ${currentSection}
    Responses so far: ${JSON.stringify(currentResponses, null, 2)}
    Detected patterns: ${JSON.stringify(detectedPatterns, null, 2)}
    
    IMPORTANT: These questions have already been asked and MUST NOT be repeated:
    ${askedQuestionIds.join(', ')}
    
    Based on the responses and patterns, determine the next most important question to ask.
    
    Consider:
    1. What symptoms need follow-up based on severity?
    2. What patterns are emerging that need confirmation?
    3. What truck driver-specific factors should be explored?
    4. What related symptoms often occur together?
    5. DO NOT repeat any question that has already been asked
    
    Return a JSON object with:
    {
      "id": "unique_question_id",
      "section": "${currentSection}",
      "questionText": "The question to ask",
      "responseType": "scale|multiple_choice|binary|frequency",
      "options": [array of options based on responseType],
      "aiContext": "Optional explanation of why this question is important",
      "truckDriverContext": "Optional truck driver specific context",
      "reasoning": "Your clinical reasoning for asking this question"
    }
    
    For scale type: options should be empty (we'll use standard 0-3 scale)
    For multiple_choice: include 3-5 relevant options with value and label
    For binary: include yes/no options
    For frequency: include frequency options (never, rarely, sometimes, often, always)
    
    Make questions clear, specific, and focused on one symptom/issue at a time.
    Make sure the question ID is unique and different from all previously asked questions.
    `;
    
    try {
      const client = this.getClaudeClient();
      if (!client) {
        // If no Claude client available, return fallback
        return this.getFallbackQuestionForSection(currentSection, askedQuestionIds);
      }
      
      const aiResponse = await client.analyzePractitionerReport(
        prompt,
        "You are an expert FNTP creating structured health assessment questions."
      );
      
      const question = this.parseAIResponse(aiResponse);
      
      // Double-check we're not returning a duplicate
      if (question && askedQuestionIds.includes(question.id)) {
        console.warn('AI returned duplicate question, getting fallback');
        return this.getFallbackQuestionForSection(currentSection, askedQuestionIds);
      }
      
      return question;
    } catch (error) {
      console.error('Error selecting next question:', error);
      return this.getFallbackQuestionForSection(currentSection, askedQuestionIds);
    }
  }
  
  private parseAIResponse(response: string): StructuredQuestion | null {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in AI response');
        return null;
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Check if question is about difficulty/challenge but has scale type
      const questionLower = parsed.questionText.toLowerCase();
      const isDifficultyQuestion = questionLower.includes('challeng') || 
                                  questionLower.includes('difficult') ||
                                  questionLower.includes('how hard') ||
                                  questionLower.includes('struggle');
      
      const isFrequencyQuestion = questionLower.includes('how often') ||
                                 questionLower.includes('how frequently') ||
                                 questionLower.includes('how many times');
      
      const isYesNoQuestion = questionLower.includes('do you') ||
                             questionLower.includes('are you') ||
                             questionLower.includes('have you');
                             
      const isQualityQuestion = (questionLower.includes('quality') || 
                                (questionLower.includes('rate') && questionLower.includes('overall')) ||
                                (questionLower.includes('how is') && questionLower.includes('overall'))) &&
                               (questionLower.includes('sleep') || questionLower.includes('digestion') || 
                                questionLower.includes('energy') || questionLower.includes('health'));
                                
      const isControlQuestion = questionLower.includes('how well') && 
                               (questionLower.includes('control') || questionLower.includes('manage'));
      
      // Auto-correct response type for difficulty questions
      if (isDifficultyQuestion && parsed.responseType === 'scale') {
        parsed.responseType = 'multiple_choice';
        parsed.options = [
          { value: 'not_challenging', label: 'Not challenging', description: 'Easy to manage' },
          { value: 'somewhat_challenging', label: 'Somewhat challenging', description: 'Manageable with effort' },
          { value: 'very_challenging', label: 'Very challenging', description: 'Difficult to maintain' },
          { value: 'extremely_challenging', label: 'Extremely challenging', description: 'Nearly impossible' }
        ];
      }
      
      // Auto-correct for frequency questions
      if (isFrequencyQuestion && parsed.responseType === 'scale') {
        parsed.responseType = 'frequency';
        parsed.options = [
          { value: 'never', label: 'Never' },
          { value: 'rarely', label: 'Rarely' },
          { value: 'sometimes', label: 'Sometimes' },
          { value: 'often', label: 'Often' },
          { value: 'always', label: 'Always' }
        ];
      }
      
      // Auto-correct for yes/no questions
      if (isYesNoQuestion && parsed.responseType === 'scale') {
        parsed.responseType = 'binary';
        parsed.options = [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ];
      }
      
      // Auto-correct for quality rating questions
      if (isQualityQuestion && parsed.responseType === 'scale') {
        parsed.responseType = 'multiple_choice';
        parsed.options = [
          { value: 'poor', label: 'Poor', description: 'Significant issues' },
          { value: 'fair', label: 'Fair', description: 'Some problems' },
          { value: 'good', label: 'Good', description: 'Generally satisfactory' },
          { value: 'excellent', label: 'Excellent', description: 'Very high quality' }
        ];
      }
      
      // Auto-correct for control/ability questions
      if (isControlQuestion && parsed.responseType === 'scale') {
        parsed.responseType = 'multiple_choice';
        parsed.options = [
          { value: 'no_control', label: 'No control', description: 'Cannot adjust at all' },
          { value: 'limited_control', label: 'Limited control', description: 'Some adjustments possible' },
          { value: 'good_control', label: 'Good control', description: 'Can adjust most factors' },
          { value: 'excellent_control', label: 'Excellent control', description: 'Full control over environment' }
        ];
      }
      
      // Check if multiple choice options should include "all of the above"
      if (parsed.responseType === 'multiple_choice' && parsed.options && parsed.options.length > 2) {
        const hasSymptomOptions = parsed.options.some((opt: any) => 
          opt.label && (opt.label.toLowerCase().includes('snoring') || 
                       opt.label.toLowerCase().includes('gasping') ||
                       opt.label.toLowerCase().includes('choking') ||
                       opt.label.toLowerCase().includes('breathing')));
        
        const hasAllOption = parsed.options.some((opt: any) => 
          opt.label && opt.label.toLowerCase().includes('all'));
          
        if (hasSymptomOptions && !hasAllOption) {
          // Add "None of these" at the beginning if not present
          const hasNoneOption = parsed.options.some((opt: any) => 
            opt.label && (opt.label.toLowerCase().includes('none') || 
                         opt.label.toLowerCase().includes('neither')));
                         
          if (!hasNoneOption) {
            parsed.options.unshift({
              value: 'none',
              label: 'None of these',
              description: 'No symptoms present'
            });
          }
          
          // Add "All of the above" at the end
          parsed.options.push({
            value: 'all_above',
            label: 'All of the above',
            description: 'Multiple or all symptoms apply'
          });
        }
      }
      
      // Format options based on response type
      let formattedOptions: ResponseOption[] = [];
      
      switch (parsed.responseType) {
        case 'scale':
          // Scale uses standard 0-3, no custom options needed
          formattedOptions = [];
          break;
          
        case 'multiple_choice':
        case 'frequency':
          formattedOptions = parsed.options.map((opt: any) => ({
            value: opt.value || opt.label,
            label: opt.label,
            description: opt.description,
            icon: opt.icon
          }));
          break;
          
        case 'binary':
          formattedOptions = [
            { value: 'yes', label: 'Yes', description: parsed.options[0]?.description },
            { value: 'no', label: 'No', description: parsed.options[1]?.description }
          ];
          break;
      }
      
      return {
        id: parsed.id || `q_${Date.now()}`,
        section: parsed.section,
        questionText: parsed.questionText,
        responseType: parsed.responseType,
        options: formattedOptions,
        aiContext: parsed.aiContext,
        truckDriverContext: parsed.truckDriverContext
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return null;
    }
  }
  
  private getFallbackQuestion(section: string): StructuredQuestion {
    // Fallback questions for each section
    const fallbackQuestions: Record<string, StructuredQuestion> = {
      energy: {
        id: 'energy_baseline',
        section: 'energy',
        questionText: 'How would you rate your overall energy level?',
        responseType: 'scale',
        options: [],
        truckDriverContext: 'Consider your energy throughout a typical driving shift'
      },
      digestive: {
        id: 'digestive_comfort',
        section: 'digestive',
        questionText: 'How often do you experience digestive discomfort?',
        responseType: 'frequency',
        options: [
          { value: 'never', label: 'Never' },
          { value: 'rarely', label: 'Rarely (1-2 times/month)' },
          { value: 'sometimes', label: 'Sometimes (weekly)' },
          { value: 'often', label: 'Often (several times/week)' },
          { value: 'always', label: 'Daily' }
        ]
      },
      sleep: {
        id: 'sleep_quality',
        section: 'sleep',
        questionText: 'How would you rate your sleep quality?',
        responseType: 'scale',
        options: [],
        truckDriverContext: 'Consider both home sleep and sleeper cab rest'
      }
    };
    
    return fallbackQuestions[section] || fallbackQuestions.energy;
  }
  
  private getFallbackQuestionForSection(section: string, askedQuestionIds: string[]): StructuredQuestion | null {
    // Multiple fallback questions for each section to avoid duplicates
    const fallbackQuestionSets: Record<string, StructuredQuestion[]> = {
      energy: [
        {
          id: 'energy_baseline',
          section: 'energy',
          questionText: 'How would you rate your overall energy level?',
          responseType: 'scale',
          options: [],
          truckDriverContext: 'Consider your energy throughout a typical driving shift'
        },
        {
          id: 'energy_crashes',
          section: 'energy',
          questionText: 'Do you experience energy crashes during the day?',
          responseType: 'binary',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'energy_morning',
          section: 'energy',
          questionText: 'How is your energy when you first wake up?',
          responseType: 'scale',
          options: [],
          truckDriverContext: 'Before coffee or stimulants'
        },
        {
          id: 'energy_pattern',
          section: 'energy',
          questionText: 'When is your energy typically lowest?',
          responseType: 'multiple_choice',
          options: [
            { value: 'morning', label: 'Morning', description: 'First few hours after waking' },
            { value: 'afternoon', label: 'Afternoon', description: '2-4 PM' },
            { value: 'evening', label: 'Evening', description: 'After dinner' },
            { value: 'all_day', label: 'All day', description: 'Consistently low' }
          ]
        }
      ],
      digestive: [
        {
          id: 'digestive_comfort',
          section: 'digestive',
          questionText: 'How often do you experience digestive discomfort?',
          responseType: 'frequency',
          options: [
            { value: 'never', label: 'Never' },
            { value: 'rarely', label: 'Rarely (1-2 times/month)' },
            { value: 'sometimes', label: 'Sometimes (weekly)' },
            { value: 'often', label: 'Often (several times/week)' },
            { value: 'always', label: 'Daily' }
          ]
        },
        {
          id: 'digestive_bloating',
          section: 'digestive',
          questionText: 'Do you experience bloating after meals?',
          responseType: 'scale',
          options: []
        },
        {
          id: 'digestive_bowel',
          section: 'digestive',
          questionText: 'How regular are your bowel movements?',
          responseType: 'multiple_choice',
          options: [
            { value: 'daily', label: 'Daily', description: 'Once per day' },
            { value: 'multiple_daily', label: 'Multiple times daily', description: '2-3 times' },
            { value: 'every_other', label: 'Every other day' },
            { value: 'irregular', label: 'Irregular', description: 'No pattern' }
          ]
        }
      ],
      sleep: [
        {
          id: 'sleep_quality',
          section: 'sleep',
          questionText: 'How would you rate your sleep quality?',
          responseType: 'scale',
          options: [],
          truckDriverContext: 'Consider both home sleep and sleeper cab rest'
        },
        {
          id: 'sleep_difficulty',
          section: 'sleep',
          questionText: 'Do you have trouble falling asleep?',
          responseType: 'binary',
          options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
          ]
        },
        {
          id: 'sleep_waking',
          section: 'sleep',
          questionText: 'How often do you wake up during the night?',
          responseType: 'frequency',
          options: [
            { value: 'never', label: 'Never' },
            { value: 'rarely', label: 'Rarely (1-2 times)' },
            { value: 'sometimes', label: 'Sometimes (3-4 times)' },
            { value: 'often', label: 'Often (5+ times)' },
            { value: 'always', label: 'Constantly' }
          ]
        }
      ]
    };
    
    const sectionQuestions = fallbackQuestionSets[section] || fallbackQuestionSets.energy;
    
    // Find a question that hasn't been asked yet
    for (const question of sectionQuestions) {
      if (!askedQuestionIds.includes(question.id)) {
        return question;
      }
    }
    
    // If all fallback questions have been asked, return null to end section
    console.log(`All fallback questions for section ${section} have been asked`);
    return null;
  }
  
  async getInitialQuestion(section: string): Promise<StructuredQuestion> {
    // Predefined initial questions for each section
    const initialQuestions: Record<string, StructuredQuestion> = {
      energy: {
        id: 'energy_compared',
        section: 'energy',
        questionText: 'How is your energy compared to 2 years ago?',
        responseType: 'multiple_choice',
        options: [
          { value: 'better', label: 'Better', description: 'More energy than before' },
          { value: 'same', label: 'Same', description: 'About the same' },
          { value: 'worse', label: 'Worse', description: 'Noticeably less energy' },
          { value: 'much_worse', label: 'Much Worse', description: 'Dramatically less energy' }
        ],
        aiContext: 'Establishing an energy baseline helps identify if fatigue is a recent development or chronic issue'
      },
      digestive: {
        id: 'digestive_overall',
        section: 'digestive',
        questionText: 'How is your digestion overall?',
        responseType: 'multiple_choice',
        options: [
          { value: 'poor', label: 'Poor', description: 'Significant issues' },
          { value: 'fair', label: 'Fair', description: 'Some problems' },
          { value: 'good', label: 'Good', description: 'Generally good' },
          { value: 'excellent', label: 'Excellent', description: 'Very good' }
        ],
        truckDriverContext: 'Consider issues like irregular meal times, truck stop food, and limited bathroom access',
        aiContext: 'Digestive health significantly impacts energy, mood, and nutrient absorption'
      },
      sleep: {
        id: 'sleep_hours',
        section: 'sleep',
        questionText: 'How many hours of sleep do you typically get?',
        responseType: 'multiple_choice',
        options: [
          { value: 'less_4', label: 'Less than 4 hours', icon: '😴' },
          { value: '4_6', label: '4-6 hours', icon: '😔' },
          { value: '6_8', label: '6-8 hours', icon: '😊' },
          { value: 'more_8', label: 'More than 8 hours', icon: '😄' }
        ],
        truckDriverContext: 'Include both home sleep and sleeper cab rest'
      }
    };
    
    return initialQuestions[section] || initialQuestions.energy;
  }
}