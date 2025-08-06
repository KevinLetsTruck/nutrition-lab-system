/**
 * OpenAI Provider Implementation
 */

import OpenAI from 'openai';
import { 
  AIProvider, 
  AIProviderType, 
  AIOptions, 
  AIResponse, 
  HealthAnalysis,
  AIServiceError,
  Finding,
  Recommendation,
  RiskFactor
} from '../types';
import { getProviderConfig, healthAnalysisPrompts } from '../config';

export class OpenAIProvider implements AIProvider {
  name: AIProviderType = 'openai';
  private client: OpenAI | null = null;
  private config: ReturnType<typeof getProviderConfig>;

  constructor() {
    this.config = getProviderConfig('openai');
    this.initializeClient();
  }

  private initializeClient(): void {
    if (!this.config.apiKey) {
      console.warn('[OpenAIProvider] No API key provided, provider will not be functional');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries,
      });
    } catch (error) {
      console.error('[OpenAIProvider] Failed to initialize client:', error);
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Make a minimal API call to check health
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10,
      });

      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('[OpenAIProvider] Health check failed:', error);
      return false;
    }
  }

  async complete(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const startTime = Date.now();

    if (!this.client) {
      throw new AIServiceError(
        'OpenAI client not initialized',
        'CLIENT_NOT_INITIALIZED',
        'openai'
      );
    }

    try {
      const model = options?.model || this.config.defaultModel || 'gpt-4-turbo-preview';
      
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

      // Add system prompt if provided
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }

      messages.push({ role: 'user', content: prompt });

      const response = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 1,
        stream: false,
      });

      const content = response.choices[0]?.message?.content || '';
      const usage = response.usage;

      return {
        content,
        provider: 'openai',
        model,
        usage: usage ? {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
        } : undefined,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      throw new AIServiceError(
        `OpenAI completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPLETION_FAILED',
        'openai',
        error instanceof Error ? error : undefined
      );
    }
  }

  async analyzeHealth(data: any): Promise<HealthAnalysis> {
    const systemPrompt = healthAnalysisPrompts.system;
    
    // Format the data into a prompt
    const prompt = this.formatHealthDataPrompt(data);

    try {
      // Use function calling for structured output
      const response = await this.completeWithFunctions(prompt, systemPrompt);
      
      // Parse the response into structured health analysis
      return this.parseHealthAnalysis(response);
    } catch (error) {
      throw new AIServiceError(
        'Health analysis failed',
        'ANALYSIS_FAILED',
        'openai',
        error instanceof Error ? error : undefined
      );
    }
  }

  private async completeWithFunctions(prompt: string, systemPrompt: string): Promise<any> {
    if (!this.client) {
      throw new AIServiceError('OpenAI client not initialized', 'CLIENT_NOT_INITIALIZED', 'openai');
    }

    const functions: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [{
      name: 'provide_health_analysis',
      description: 'Provide a structured health analysis',
      parameters: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Comprehensive health status summary' },
          findings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                description: { type: 'string' },
                severity: { type: 'string', enum: ['low', 'medium', 'high'] },
                value: { type: 'string' },
                reference: { type: 'string' }
              },
              required: ['category', 'description', 'severity']
            }
          },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                category: { type: 'string' },
                description: { type: 'string' },
                timeframe: { type: 'string' }
              },
              required: ['priority', 'category', 'description']
            }
          },
          riskFactors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                level: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
                description: { type: 'string' }
              },
              required: ['name', 'level', 'description']
            }
          },
          confidence: { type: 'number', minimum: 0, maximum: 100 }
        },
        required: ['summary', 'findings', 'recommendations', 'riskFactors', 'confidence']
      }
    }];

    const response = await this.client.chat.completions.create({
      model: this.config.defaultModel || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      functions,
      function_call: { name: 'provide_health_analysis' },
      temperature: 0.3,
    });

    const functionCall = response.choices[0]?.message?.function_call;
    if (functionCall?.arguments) {
      return JSON.parse(functionCall.arguments);
    }

    throw new Error('No function call in response');
  }

  private formatHealthDataPrompt(data: any): string {
    let prompt = `Please analyze the following health data and provide a comprehensive assessment:\n\n`;

    // Handle different data types
    if (data.labResults) {
      prompt += `Lab Results:\n${JSON.stringify(data.labResults, null, 2)}\n\n`;
    }

    if (data.symptoms) {
      prompt += `Reported Symptoms:\n${JSON.stringify(data.symptoms, null, 2)}\n\n`;
    }

    if (data.medications) {
      prompt += `Current Medications:\n${JSON.stringify(data.medications, null, 2)}\n\n`;
    }

    if (data.lifestyle) {
      prompt += `Lifestyle Factors:\n${JSON.stringify(data.lifestyle, null, 2)}\n\n`;
    }

    prompt += `Use the provide_health_analysis function to structure your response.`;

    return prompt;
  }

  private parseHealthAnalysis(data: any): HealthAnalysis {
    // If we got structured data from function calling, use it directly
    if (data.summary && data.findings && data.recommendations) {
      return {
        summary: data.summary,
        findings: data.findings,
        recommendations: data.recommendations,
        riskFactors: data.riskFactors || [],
        confidence: data.confidence || 75,
        metadata: {
          provider: 'openai',
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Fallback parsing if needed
    return {
      summary: 'Unable to parse health analysis',
      findings: [],
      recommendations: [],
      riskFactors: [],
      confidence: 0,
      metadata: {
        provider: 'openai',
        timestamp: new Date().toISOString(),
        error: 'Parsing failed',
      },
    };
  }
}