/**
 * Anthropic (Claude) Provider Implementation
 * Optimized for Kevin Rutherford's FNTP Practice
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

interface HealthCheckCache {
  result: boolean;
  timestamp: number;
}

interface FNTPHealthAnalysis extends HealthAnalysis {
  rootCauses: Array<{
    issue: string;
    description: string;
    evidence: string[];
    functionalApproach: string;
  }>;
  truckDriverSpecific: Array<{
    concern: string;
    impact: string;
    solutions: string[];
  }>;
  priority: Array<{
    order: number;
    intervention: string;
    timeframe: string;
    expectedOutcome: string;
  }>;
}

export class AnthropicProvider implements AIProvider {
  name: AIProviderType = 'anthropic';
  private client: Anthropic | null = null;
  private config: ReturnType<typeof getProviderConfig>;
  private healthCheckCache: HealthCheckCache | null = null;
  private readonly HEALTH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.config = getProviderConfig('anthropic');
    // Lazy loading - don't initialize client in constructor
  }

  private async getClient(): Promise<Anthropic> {
    if (this.client) {
      return this.client;
    }

    if (!this.config.apiKey) {
      throw new AIServiceError(
        'Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.',
        'API_KEY_MISSING',
        'anthropic'
      );
    }

    try {
      this.client = new Anthropic({
        apiKey: this.config.apiKey,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries,
      });
      console.log('[AnthropicProvider] Client initialized successfully');
      return this.client;
    } catch (error) {
      throw new AIServiceError(
        `Failed to initialize Anthropic client: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CLIENT_INITIALIZATION_FAILED',
        'anthropic',
        error instanceof Error ? error : undefined
      );
    }
  }

  async isHealthy(): Promise<boolean> {
    // Check cache first
    if (this.healthCheckCache && 
        Date.now() - this.healthCheckCache.timestamp < this.HEALTH_CACHE_TTL) {
      return this.healthCheckCache.result;
    }

    const startTime = Date.now();
    let result = false;

    try {
      const client = await this.getClient();
      
      // Make a minimal API call to check health
      const response = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });

      result = !!response.content;
      console.log(`[AnthropicProvider] Health check completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      console.error('[AnthropicProvider] Health check failed:', error);
      result = false;
    }

    // Cache the result
    this.healthCheckCache = {
      result,
      timestamp: Date.now()
    };

    return result;
  }

  async complete(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      const client = await this.getClient();
      const model = options?.model || this.config.defaultModel || 'claude-3-5-sonnet-20241022';
      
      const messages: Anthropic.MessageParam[] = [
        { role: 'user', content: prompt }
      ];

      // Add system prompt if provided
      const systemPrompt = options?.systemPrompt;

      const response = await client.messages.create({
        model,
        max_tokens: options?.maxTokens || 4096,
        temperature: options?.temperature || 0.7,
        top_p: options?.topP || 1,
        messages,
        ...(systemPrompt && { system: systemPrompt }),
      });

      const content = response.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as Anthropic.TextBlock).text)
        .join('\n');

      const latency = Date.now() - startTime;

      return {
        content,
        provider: 'anthropic',
        model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        latency,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorCode = this.getErrorCode(error);
      
      throw new AIServiceError(
        `Anthropic completion failed: ${errorMessage}`,
        errorCode,
        'anthropic',
        error instanceof Error ? error : undefined
      );
    }
  }

  private getErrorCode(error: any): string {
    if (error?.status === 401) return 'AUTHENTICATION_ERROR';
    if (error?.status === 429) return 'RATE_LIMIT_ERROR';
    if (error?.status === 500) return 'SERVER_ERROR';
    if (error?.code === 'ECONNREFUSED') return 'CONNECTION_ERROR';
    if (error?.code === 'ETIMEDOUT') return 'TIMEOUT_ERROR';
    return 'COMPLETION_FAILED';
  }

  async analyzeHealth(data: any): Promise<HealthAnalysis> {
    const startTime = Date.now();
    
    // FNTP-specific system prompt for Kevin Rutherford's practice
    const systemPrompt = `You are an expert Functional Nutritional Therapy Practitioner (FNTP) working in Kevin Rutherford's practice, specializing in functional medicine approaches for truck drivers and their unique health challenges.

Your analysis should focus on:
1. Identifying root causes using functional medicine principles
2. Addressing truck driver-specific health concerns (sedentary lifestyle, irregular schedules, limited food options, sleep disruption)
3. Providing practical, implementable solutions that work on the road
4. Prioritizing interventions based on impact and feasibility

Always consider the "Functional Medicine Matrix" - looking at lifestyle factors, nutrition, stress, movement, sleep, relationships, and purpose.

Format your response as a JSON object with the following structure:
{
  "summary": "Brief overview of health status",
  "findings": [array of findings with category, description, severity, value, reference],
  "rootCauses": [array of root cause objects with issue, description, evidence, functionalApproach],
  "recommendations": [array of recommendations with priority, category, description, timeframe],
  "truckDriverSpecific": [array of truck driver concerns with concern, impact, solutions],
  "priority": [array of prioritized interventions with order, intervention, timeframe, expectedOutcome],
  "riskFactors": [array of risk factors with name, level, description, mitigationStrategies],
  "confidence": number (0-100)
}`;

    try {
      const prompt = this.formatFNTPHealthDataPrompt(data);
      
      const response = await this.complete(prompt, {
        systemPrompt,
        maxTokens: 8192,
        temperature: 0.3, // Lower temperature for consistent structured output
        model: 'claude-3-5-sonnet-20241022', // Use the most capable model for health analysis
      });

      // Track analysis time
      const analysisTime = Date.now() - startTime;
      console.log(`[AnthropicProvider] Health analysis completed in ${analysisTime}ms`);

      // Parse the response into structured health analysis
      return this.parseFNTPHealthAnalysis(response.content, analysisTime);
    } catch (error) {
      throw new AIServiceError(
        `FNTP health analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'HEALTH_ANALYSIS_FAILED',
        'anthropic',
        error instanceof Error ? error : undefined
      );
    }
  }

  private formatFNTPHealthDataPrompt(data: any): string {
    let prompt = `Analyze the following health data for a functional medicine assessment:\n\n`;

    // Patient demographics if available
    if (data.demographics) {
      prompt += `=== PATIENT DEMOGRAPHICS ===\n`;
      prompt += `Age: ${data.demographics.age || 'Not specified'}\n`;
      prompt += `Gender: ${data.demographics.gender || 'Not specified'}\n`;
      prompt += `Occupation: ${data.demographics.occupation || 'Truck Driver'}\n`;
      prompt += `Years Driving: ${data.demographics.yearsDriving || 'Not specified'}\n\n`;
    }

    // Lab results with functional ranges
    if (data.labResults) {
      prompt += `=== LAB RESULTS ===\n`;
      prompt += `Note: Please evaluate using functional medicine optimal ranges, not just standard ranges.\n`;
      prompt += `${JSON.stringify(data.labResults, null, 2)}\n\n`;
    }

    // Symptoms and health concerns
    if (data.symptoms) {
      prompt += `=== SYMPTOMS & CONCERNS ===\n`;
      prompt += `${JSON.stringify(data.symptoms, null, 2)}\n\n`;
    }

    // Current medications and supplements
    if (data.medications) {
      prompt += `=== MEDICATIONS & SUPPLEMENTS ===\n`;
      prompt += `${JSON.stringify(data.medications, null, 2)}\n\n`;
    }

    // Lifestyle factors crucial for truck drivers
    if (data.lifestyle) {
      prompt += `=== LIFESTYLE FACTORS ===\n`;
      prompt += `Diet Quality: ${data.lifestyle.diet || 'Not specified'}\n`;
      prompt += `Exercise: ${data.lifestyle.exercise || 'Limited due to driving'}\n`;
      prompt += `Sleep: ${data.lifestyle.sleep || 'Irregular'}\n`;
      prompt += `Stress Level: ${data.lifestyle.stress || 'Not specified'}\n`;
      prompt += `Smoking: ${data.lifestyle.smoking || 'Not specified'}\n`;
      prompt += `Alcohol: ${data.lifestyle.alcohol || 'Not specified'}\n`;
      prompt += `Hydration: ${data.lifestyle.hydration || 'Not specified'}\n\n`;
    }

    // Truck driver specific factors
    if (data.truckingFactors) {
      prompt += `=== TRUCKING-SPECIFIC FACTORS ===\n`;
      prompt += `Average hours driving per day: ${data.truckingFactors.hoursPerDay || 'Not specified'}\n`;
      prompt += `Route type: ${data.truckingFactors.routeType || 'Not specified'}\n`;
      prompt += `Home time frequency: ${data.truckingFactors.homeTime || 'Not specified'}\n`;
      prompt += `Access to healthy food: ${data.truckingFactors.foodAccess || 'Limited'}\n`;
      prompt += `Exercise opportunities: ${data.truckingFactors.exerciseAccess || 'Limited'}\n\n`;
    }

    // Goals and priorities
    if (data.goals) {
      prompt += `=== HEALTH GOALS ===\n`;
      prompt += `${JSON.stringify(data.goals, null, 2)}\n\n`;
    }

    prompt += `Please provide a comprehensive functional medicine analysis focusing on root causes and practical solutions for a truck driver's lifestyle. Return your analysis as a properly formatted JSON object.`;

    return prompt;
  }

  private parseFNTPHealthAnalysis(content: string, responseTime: number): HealthAnalysis {
    try {
      // First try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure all required fields are present
        return {
          summary: parsed.summary || 'Health analysis completed',
          findings: this.validateFindings(parsed.findings || []),
          recommendations: this.validateRecommendations(parsed.recommendations || []),
          riskFactors: this.validateRiskFactors(parsed.riskFactors || []),
          confidence: parsed.confidence || 85,
          metadata: {
            provider: 'anthropic',
            timestamp: new Date().toISOString(),
            responseTime,
            rootCauses: parsed.rootCauses || [],
            truckDriverSpecific: parsed.truckDriverSpecific || [],
            priority: parsed.priority || [],
            analysisType: 'FNTP'
          }
        };
      }
    } catch (error) {
      console.warn('[AnthropicProvider] Failed to parse JSON response, falling back to text parsing', error);
    }

    // Fallback text parsing if JSON extraction fails
    return this.fallbackTextParsing(content, responseTime);
  }

  private validateFindings(findings: any[]): Finding[] {
    return findings.map(f => ({
      category: f.category || 'General',
      description: f.description || '',
      severity: this.validateSeverity(f.severity),
      value: f.value,
      reference: f.reference
    }));
  }

  private validateRecommendations(recommendations: any[]): Recommendation[] {
    return recommendations.map(r => ({
      priority: this.validatePriority(r.priority),
      category: r.category || 'General',
      description: r.description || '',
      timeframe: r.timeframe,
      resources: r.resources || []
    }));
  }

  private validateRiskFactors(riskFactors: any[]): RiskFactor[] {
    return riskFactors.map(rf => ({
      name: rf.name || 'Unknown',
      level: this.validateRiskLevel(rf.level),
      description: rf.description || '',
      mitigationStrategies: rf.mitigationStrategies || []
    }));
  }

  private validateSeverity(severity: any): 'low' | 'medium' | 'high' {
    const s = String(severity).toLowerCase();
    if (s === 'high') return 'high';
    if (s === 'medium') return 'medium';
    return 'low';
  }

  private validatePriority(priority: any): 'low' | 'medium' | 'high' {
    const p = String(priority).toLowerCase();
    if (p === 'high') return 'high';
    if (p === 'medium') return 'medium';
    return 'low';
  }

  private validateRiskLevel(level: any): 'low' | 'moderate' | 'high' | 'critical' {
    const l = String(level).toLowerCase();
    if (l === 'critical') return 'critical';
    if (l === 'high') return 'high';
    if (l === 'moderate') return 'moderate';
    return 'low';
  }

  private fallbackTextParsing(content: string, responseTime: number): HealthAnalysis {
    // Basic text parsing as last resort
    const lines = content.split('\n').filter(line => line.trim());
    const summary = lines[0] || 'Health analysis completed';
    
    const findings: Finding[] = [];
    const recommendations: Recommendation[] = [];
    const riskFactors: RiskFactor[] = [];

    // Simple heuristic parsing
    let currentSection = '';
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('finding') || lowerLine.includes('result')) {
        currentSection = 'findings';
      } else if (lowerLine.includes('recommend')) {
        currentSection = 'recommendations';
      } else if (lowerLine.includes('risk')) {
        currentSection = 'risks';
      } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
        const content = line.replace(/^[-•]\s*/, '').trim();
        
        if (currentSection === 'findings') {
          findings.push({
            category: 'General',
            description: content,
            severity: 'medium'
          });
        } else if (currentSection === 'recommendations') {
          recommendations.push({
            priority: 'medium',
            category: 'General',
            description: content
          });
        } else if (currentSection === 'risks') {
          riskFactors.push({
            name: content.split(':')[0] || content,
            level: 'moderate',
            description: content
          });
        }
      }
    }

    return {
      summary,
      findings,
      recommendations,
      riskFactors,
      confidence: 70, // Lower confidence for fallback parsing
      metadata: {
        provider: 'anthropic',
        timestamp: new Date().toISOString(),
        responseTime,
        parsingMethod: 'fallback',
        analysisType: 'FNTP'
      }
    };
  }
}