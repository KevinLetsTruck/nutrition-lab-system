/**
 * AI Service Configuration
 */

import { AIServiceConfig } from './types';
import { env } from '@/lib/config/env';

// Default configuration
export const defaultConfig: AIServiceConfig = {
  providers: {
    anthropic: {
      apiKey: env.get('ANTHROPIC_API_KEY'),
      baseUrl: 'https://api.anthropic.com',
      defaultModel: 'claude-3-5-sonnet-20241022',
      timeout: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 1000, // 1 second
    },
    openai: {
      apiKey: env.get('OPENAI_API_KEY'),
      baseUrl: 'https://api.openai.com/v1',
      defaultModel: 'gpt-4-turbo-preview',
      timeout: 30000, // 30 seconds
      maxRetries: 3,
      retryDelay: 1000, // 1 second
    }
  },
  cache: {
    ttl: 3600000, // 1 hour in milliseconds
    maxSize: 100, // Maximum number of cached entries
  },
  fallbackProvider: 'mock',
  debug: env.get('NODE_ENV') !== 'production',
};

// Model configurations
export const modelConfigs = {
  anthropic: {
    'claude-3-5-sonnet-20241022': {
      maxTokens: 8192,
      contextWindow: 200000,
    },
    'claude-3-haiku-20240307': {
      maxTokens: 4096,
      contextWindow: 200000,
    },
  },
  openai: {
    'gpt-4-turbo-preview': {
      maxTokens: 4096,
      contextWindow: 128000,
    },
    'gpt-3.5-turbo': {
      maxTokens: 4096,
      contextWindow: 16385,
    },
  },
};

// Health analysis prompts
export const healthAnalysisPrompts = {
  system: `You are an expert health data analyst specializing in functional medicine and nutritional biochemistry. 
Your role is to analyze health data, lab results, and patient information to provide comprehensive health insights.
You should identify patterns, risk factors, and provide evidence-based recommendations.
Always maintain a professional, empathetic tone and clearly indicate the confidence level of your analysis.`,
  
  labAnalysis: `Analyze the following lab results and provide:
1. A summary of key findings
2. Identification of any values outside optimal ranges
3. Potential health implications
4. Recommended follow-up actions or additional tests
5. Lifestyle and nutritional recommendations

Lab Data:
{labData}

Patient Context:
{patientContext}`,

  nutritionalAssessment: `Analyze the nutritional assessment data and provide:
1. Overall nutritional status summary
2. Identified deficiencies or imbalances
3. Dietary patterns and their health implications
4. Specific supplement recommendations with dosages
5. Dietary modifications and meal planning suggestions

Assessment Data:
{assessmentData}

Health Goals:
{healthGoals}`,
};

// Retry configuration
export const retryConfig = {
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000], // Exponential backoff
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'rate_limit_exceeded',
    'server_error',
  ],
};

// Export helper to get provider config
export function getProviderConfig(provider: 'anthropic' | 'openai'): Required<import('./types').ProviderConfig> {
  const config = defaultConfig.providers[provider];
  if (!config) {
    throw new Error(`Provider ${provider} not configured`);
  }
  
  return {
    apiKey: config.apiKey || '',
    baseUrl: config.baseUrl || '',
    defaultModel: config.defaultModel || '',
    timeout: config.timeout || 30000,
    maxRetries: config.maxRetries || 3,
    retryDelay: config.retryDelay || 1000,
  };
}