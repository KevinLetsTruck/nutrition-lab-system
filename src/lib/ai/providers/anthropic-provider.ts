/**
 * Anthropic (Claude) Provider Implementation
 */

import Anthropic from '@anthropic-ai/sdk';
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

export class AnthropicProvider implements AIProvider {
  name: AIProviderType = 'anthropic';
  private client: Anthropic | null = null;
  private config: ReturnType<typeof getProviderConfig>;

  constructor() {
    this.config = getProviderConfig('anthropic');
    this.initializeClient();
  }

  private initializeClient(): void {
    if (!this.config.apiKey) {
      console.warn('[AnthropicProvider] No API key provided, provider will not be functional');
      return;
    }

    try {
      this.client = new Anthropic({
        apiKey: this.config.apiKey,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries,
      });
    } catch (error) {
      console.error('[AnthropicProvider] Failed to initialize client:', error);
    }
  }

  async isHealthy(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Make a minimal API call to check health
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });

      return !!response.content;
    } catch (error) {
      console.error('[AnthropicProvider] Health check failed:', error);
      return false;
    }
  }

  async complete(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const startTime = Date.now();

    if (!this.client) {
      throw new AIServiceError(
        'Anthropic client not initialized',
        'CLIENT_NOT_INITIALIZED',
        'anthropic'
      );
    }

    try {
      const model = options?.model || this.config.defaultModel || 'claude-3-5-sonnet-20241022';
      
      const messages: Anthropic.MessageParam[] = [
        { role: 'user', content: prompt }
      ];

      // Add system prompt if provided
      const systemPrompt = options?.systemPrompt;

      const response = await this.client.messages.create({
        model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 1,
        messages,
        ...(systemPrompt && { system: systemPrompt }),
      });

      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      return {
        content,
        provider: 'anthropic',
        model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        latency: Date.now() - startTime,
      };
    } catch (error) {
      throw new AIServiceError(
        `Anthropic completion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COMPLETION_FAILED',
        'anthropic',
        error instanceof Error ? error : undefined
      );
    }
  }

  async analyzeHealth(data: any): Promise<HealthAnalysis> {
    const systemPrompt = healthAnalysisPrompts.system;
    
    // Format the data into a prompt
    const prompt = this.formatHealthDataPrompt(data);

    try {
      const response = await this.complete(prompt, {
        systemPrompt,
        maxTokens: 8192,
        temperature: 0.3, // Lower temperature for more consistent analysis
      });

      // Parse the response into structured health analysis
      return this.parseHealthAnalysis(response.content);
    } catch (error) {
      throw new AIServiceError(
        'Health analysis failed',
        'ANALYSIS_FAILED',
        'anthropic',
        error instanceof Error ? error : undefined
      );
    }
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

    prompt += `Please provide:
1. A comprehensive summary of the health status
2. Key findings categorized by body system
3. Risk factors with severity levels
4. Prioritized recommendations for improvement
5. Your confidence level in this analysis (0-100%)

Format your response as a structured analysis with clear sections.`;

    return prompt;
  }

  private parseHealthAnalysis(content: string): HealthAnalysis {
    // This is a simplified parser - in production, you'd want more robust parsing
    // or ask Claude to return JSON directly
    
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    const riskFactors: RiskFactor[] = [];
    
    // Extract summary (first paragraph)
    const summaryMatch = content.match(/^(.+?)(?=\n\n)/s);
    const summary = summaryMatch ? summaryMatch[1] : content.substring(0, 200);

    // Extract findings
    const findingsSection = content.match(/findings?:?\s*\n([\s\S]+?)(?=\n\n|recommendations?:|risk factors?:|$)/i);
    if (findingsSection) {
      const findingLines = findingsSection[1].split('\n').filter(line => line.trim());
      findingLines.forEach(line => {
        const severity = line.toLowerCase().includes('high') ? 'high' : 
                        line.toLowerCase().includes('medium') ? 'medium' : 'low';
        findings.push({
          category: 'General',
          description: line.replace(/^[-•*]\s*/, '').trim(),
          severity,
        });
      });
    }

    // Extract recommendations
    const recsSection = content.match(/recommendations?:?\s*\n([\s\S]+?)(?=\n\n|risk factors?:|confidence:|$)/i);
    if (recsSection) {
      const recLines = recsSection[1].split('\n').filter(line => line.trim());
      recLines.forEach((line, index) => {
        recommendations.push({
          priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
          category: 'General',
          description: line.replace(/^[-•*]\s*/, '').trim(),
        });
      });
    }

    // Extract confidence
    const confidenceMatch = content.match(/confidence:?\s*(\d+)%?/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 75;

    return {
      summary,
      findings,
      recommendations,
      riskFactors,
      confidence,
      metadata: {
        provider: 'anthropic',
        timestamp: new Date().toISOString(),
      },
    };
  }
}