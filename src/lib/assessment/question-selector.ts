import ClaudeClient from '@/lib/claude-client';
import { StructuredQuestion, ResponseOption } from '@/components/assessment/StructuredQuestion';
import { DetectedPattern } from '@/lib/assessment/pattern-matcher';

export interface Response {
  questionId: string;
  value: number | string;
  timestamp: Date;
}

export class AIQuestionSelector {
  private claudeClient: ClaudeClient;
  private truckDriverContext: boolean = true;
  
  constructor() {
    this.claudeClient = ClaudeClient.getInstance();
  }
  
  async selectNextQuestion(
    currentResponses: Response[], 
    detectedPatterns: DetectedPattern[],
    currentSection: string
  ): Promise<StructuredQuestion | null> {
    
    const prompt = `
    You are Kevin Rutherford, FNTP specializing in truck driver health.
    
    Current assessment section: ${currentSection}
    Responses so far: ${JSON.stringify(currentResponses, null, 2)}
    Detected patterns: ${JSON.stringify(detectedPatterns, null, 2)}
    
    Based on the responses and patterns, determine the next most important question to ask.
    
    Consider:
    1. What symptoms need follow-up based on severity?
    2. What patterns are emerging that need confirmation?
    3. What truck driver-specific factors should be explored?
    4. What related symptoms often occur together?
    
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
    `;
    
    try {
      const aiResponse = await this.claudeClient.analyzePractitionerReport(
        prompt,
        "You are an expert FNTP creating structured health assessment questions."
      );
      
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('Error selecting next question:', error);
      return this.getFallbackQuestion(currentSection);
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
        responseType: 'scale',
        options: [],
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