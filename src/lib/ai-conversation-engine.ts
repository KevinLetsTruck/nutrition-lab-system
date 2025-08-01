import { createClient } from '@supabase/supabase-js';
import { ClaudeClient } from './claude-client';
import { HEALTH_ASSESSMENT_PROMPTS } from './ai-prompts/health-assessment';
import { PatternRecognitionEngine } from './pattern-recognition';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface AIResponse {
  content: string;
  section: string;
  messageType: 'chat' | 'validation' | 'pattern_recognition' | 'clarification';
  metadata?: any;
}

export interface ValidationSummary {
  section: string;
  symptoms: Array<{
    name: string;
    severity: number;
    duration?: string;
    frequency?: string;
  }>;
  patterns: string[];
  truckDriverFactors: string[];
  confidence: number;
}

export interface PatternAnalysis {
  patterns: Array<{
    name: string;
    confidence: number;
    symptoms: string[];
    rootCauses: string[];
  }>;
  recommendations: string[];
}

export interface FinalAnalysis {
  summary: string;
  topConcerns: string[];
  rootCauseAnalysis: any;
  prioritizedRecommendations: string[];
  truckDriverSpecificFactors: string[];
}

export class AIConversationEngine {
  private claudeClient: ClaudeClient;
  private currentConversation: any = null;
  
  constructor() {
    this.claudeClient = new ClaudeClient();
  }

  async startConversation(clientId: string): Promise<string> {
    try {
      // Create new conversation record
      const { data: conversation, error } = await supabase
        .from('ai_conversations')
        .insert({
          client_id: clientId,
          conversation_type: 'health_assessment',
          status: 'in_progress',
          current_section: 'introduction'
        })
        .select()
        .single();

      if (error) throw error;

      this.currentConversation = conversation;
      
      // Store initial system message
      await this.storeMessage(
        conversation.id,
        'ai',
        HEALTH_ASSESSMENT_PROMPTS.system,
        'introduction',
        'system'
      );

      return conversation.id;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  }

  async processClientResponse(
    conversationId: string,
    response: string
  ): Promise<AIResponse> {
    try {
      // Store client message
      await this.storeMessage(conversationId, 'client', response);

      // Get conversation history
      const history = await this.getConversationHistory(conversationId);
      
      // Get current section
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('current_section')
        .eq('id', conversationId)
        .single();

      const currentSection = conversation?.current_section || 'introduction';

      // Generate AI response
      const aiResponse = await this.generateAIResponse(
        history,
        response,
        currentSection
      );

      // Store AI response
      await this.storeMessage(
        conversationId,
        'ai',
        aiResponse.content,
        aiResponse.section,
        aiResponse.messageType
      );

      // Analyze for patterns in real-time
      if (currentSection !== 'introduction') {
        await this.analyzePatterns(conversationId, currentSection);
      }

      // Update conversation section if needed
      if (aiResponse.section !== currentSection) {
        await supabase
          .from('ai_conversations')
          .update({ current_section: aiResponse.section })
          .eq('id', conversationId);
      }

      return aiResponse;
    } catch (error) {
      console.error('Failed to process response:', error);
      throw error;
    }
  }

  async validateSection(
    conversationId: string,
    section: string
  ): Promise<ValidationSummary> {
    try {
      // Get all messages for this section
      const { data: messages } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('section', section)
        .order('timestamp', { ascending: true });

      // Use Claude to analyze and validate
      const validationPrompt = `
        Analyze the following conversation section about ${section} health.
        Extract and validate:
        1. All symptoms mentioned with severity (1-10)
        2. Duration and frequency of symptoms
        3. Patterns that emerge
        4. Truck driver specific factors
        
        Messages:
        ${messages?.map(m => `${m.role}: ${m.content}`).join('\n')}
      `;

      const validation = await this.claudeClient.analyze(validationPrompt, {
        model: 'claude-3-opus-20240229',
        system: HEALTH_ASSESSMENT_PROMPTS.validation
      });

      // Parse and structure the validation
      return this.parseValidationResponse(validation.response);
    } catch (error) {
      console.error('Failed to validate section:', error);
      throw error;
    }
  }

  async generatePatternAnalysis(
    conversationId: string
  ): Promise<PatternAnalysis> {
    try {
      // Get all conversation data
      const { data: messages } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      // Get any existing analysis
      const { data: existingAnalysis } = await supabase
        .from('conversation_analysis')
        .select('*')
        .eq('conversation_id', conversationId);

      // Generate comprehensive pattern analysis
      const analysisPrompt = `
        Analyze this health assessment conversation for functional medicine patterns.
        Look for:
        1. Root cause patterns (gut dysbiosis, HPA axis dysfunction, etc.)
        2. Symptom clusters that indicate specific conditions
        3. Truck driver lifestyle factors affecting health
        4. Underreporting indicators
        
        Full conversation:
        ${messages?.map(m => `${m.role}: ${m.content}`).join('\n')}
      `;

      const analysis = await this.claudeClient.analyze(analysisPrompt, {
        model: 'claude-3-opus-20240229',
        system: HEALTH_ASSESSMENT_PROMPTS.patternRecognition
      });

      return this.parsePatternAnalysis(analysis.response);
    } catch (error) {
      console.error('Failed to generate pattern analysis:', error);
      throw error;
    }
  }

  async completeConversation(
    conversationId: string
  ): Promise<FinalAnalysis> {
    try {
      // Mark conversation as complete
      await supabase
        .from('ai_conversations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Generate final analysis
      const patternAnalysis = await this.generatePatternAnalysis(conversationId);
      
      // Store final analysis
      await supabase
        .from('conversation_analysis')
        .insert({
          conversation_id: conversationId,
          section: 'final',
          patterns_detected: patternAnalysis.patterns,
          recommendations: patternAnalysis.recommendations
        });

      return {
        summary: 'Comprehensive health assessment completed',
        topConcerns: patternAnalysis.patterns.map(p => p.name),
        rootCauseAnalysis: patternAnalysis.patterns,
        prioritizedRecommendations: patternAnalysis.recommendations,
        truckDriverSpecificFactors: []
      };
    } catch (error) {
      console.error('Failed to complete conversation:', error);
      throw error;
    }
  }

  async pauseConversation(conversationId: string, isPaused: boolean) {
    await supabase
      .from('ai_conversations')
      .update({ status: isPaused ? 'paused' : 'in_progress' })
      .eq('id', conversationId);
  }

  async moveToNextSection(conversationId: string): Promise<AIResponse> {
    const sections = [
      'introduction',
      'digestive',
      'reproductive',
      'neurological',
      'cardiovascular',
      'respiratory',
      'musculoskeletal',
      'endocrine',
      'immune',
      'mental_emotional',
      'lifestyle',
      'summary'
    ];

    const { data: conversation } = await supabase
      .from('ai_conversations')
      .select('current_section')
      .eq('id', conversationId)
      .single();

    const currentIndex = sections.indexOf(conversation?.current_section || 'introduction');
    const nextSection = sections[currentIndex + 1] || 'summary';

    const transitionMessage = this.getTransitionMessage(nextSection);

    await this.storeMessage(
      conversationId,
      'ai',
      transitionMessage,
      nextSection,
      'chat'
    );

    await supabase
      .from('ai_conversations')
      .update({ current_section: nextSection })
      .eq('id', conversationId);

    return {
      content: transitionMessage,
      section: nextSection,
      messageType: 'chat'
    };
  }

  // Private helper methods
  private async storeMessage(
    conversationId: string,
    role: 'ai' | 'client',
    content: string,
    section?: string,
    messageType?: string
  ) {
    await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
        section,
        message_type: messageType || 'chat'
      });
  }

  private async getConversationHistory(conversationId: string) {
    const { data: messages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    return messages || [];
  }

  private async generateAIResponse(
    history: any[],
    clientResponse: string,
    currentSection: string
  ): Promise<AIResponse> {
    const sectionPrompt = HEALTH_ASSESSMENT_PROMPTS.sectionPrompts[currentSection] || '';
    
    const conversationContext = history
      .filter(m => m.role !== 'system')
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    const prompt = `
      Current section: ${currentSection}
      ${sectionPrompt}
      
      Conversation so far:
      ${conversationContext}
      
      Client just said: ${clientResponse}
      
      Respond naturally, asking follow-up questions to gather comprehensive information.
      Be empathetic and understanding, especially for truck drivers' unique challenges.
    `;

    const response = await this.claudeClient.analyze(prompt, {
      model: 'claude-3-opus-20240229',
      system: HEALTH_ASSESSMENT_PROMPTS.system
    });

    // Determine if we should validate or continue
    const shouldValidate = this.checkIfSectionComplete(history, currentSection);

    return {
      content: response.response,
      section: currentSection,
      messageType: shouldValidate ? 'validation' : 'chat'
    };
  }

  private async analyzePatterns(conversationId: string, section: string) {
    // Use the dedicated pattern recognition engine
    const patternEngine = new PatternRecognitionEngine(conversationId);
    const analysis = await patternEngine.analyzeConversation();
    
    // Store the comprehensive analysis results
    await supabase
      .from('conversation_analysis')
      .upsert({
        conversation_id: conversationId,
        section,
        patterns_detected: analysis.patterns,
        confidence_scores: analysis.patterns.reduce((acc, pattern) => ({
          ...acc,
          [pattern.id]: pattern.confidence
        }), {}),
        truck_driver_factors: analysis.patterns.flatMap(p => p.truckDriverFactors || []),
        updated_at: new Date().toISOString()
      });
    
    // If urgent concerns are detected, flag them
    if (analysis.urgentConcerns.length > 0) {
      await supabase
        .from('ai_conversations')
        .update({ 
          metadata: { urgent_concerns: analysis.urgentConcerns }
        })
        .eq('id', conversationId);
    }
  }

  private parseValidationResponse(response: string): ValidationSummary {
    // Parse Claude's response into structured validation
    // This would need more sophisticated parsing in production
    return {
      section: '',
      symptoms: [],
      patterns: [],
      truckDriverFactors: [],
      confidence: 0.85
    };
  }

  private parsePatternAnalysis(response: string): PatternAnalysis {
    // Parse Claude's pattern analysis
    // This would need more sophisticated parsing in production
    return {
      patterns: [],
      recommendations: []
    };
  }

  private checkIfSectionComplete(history: any[], section: string): boolean {
    // Logic to determine if we've gathered enough info for this section
    const sectionMessages = history.filter(m => m.section === section && m.role === 'client');
    return sectionMessages.length >= 5; // Simple heuristic
  }

  private getTransitionMessage(nextSection: string): string {
    const transitions: Record<string, string> = {
      digestive: "Great! Now let's talk about your digestive health. How has your digestion been? Any issues with bloating, gas, or changes in bowel habits?",
      reproductive: "Thank you for sharing. Now I'd like to ask about your reproductive health. For privacy, remember you can share as much or as little as you're comfortable with.",
      neurological: "Let's move on to discuss any neurological symptoms. This includes headaches, dizziness, numbness, or cognitive concerns like brain fog or memory issues.",
      cardiovascular: "Now let's talk about your heart health. Have you experienced any chest pain, palpitations, or shortness of breath?",
      respiratory: "How about your breathing and respiratory health? Any issues with congestion, coughing, or breathing difficulties?",
      musculoskeletal: "Let's discuss any muscle or joint issues. As a truck driver, this is especially important. Any pain, stiffness, or mobility concerns?",
      endocrine: "Now I'd like to ask about symptoms that might relate to your hormones and metabolism. Things like energy levels, temperature regulation, or unexplained weight changes.",
      immune: "How has your immune system been? Do you get sick often, have allergies, or any autoimmune concerns?",
      mental_emotional: "Mental health is just as important as physical health. How have you been feeling emotionally? Any stress, anxiety, or mood changes?",
      lifestyle: "Finally, let's talk about your lifestyle. Tell me about your sleep, exercise, stress levels, and any substances you use.",
      summary: "Thank you for sharing all of this information. Let me summarize what I've learned and identify the key patterns I'm seeing..."
    };

    return transitions[nextSection] || "Let's continue with the next section.";
  }
}