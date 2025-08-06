/**
 * AI Service Singleton Export
 * 
 * Provides a global instance of the AI service for use throughout the application
 */

import { AIService } from './ai-service';
import { AIServiceConfig } from './types';
import { env } from '@/lib/config/env';

// Create singleton instance
let aiServiceInstance: AIService | null = null;

/**
 * Get or create the AI service instance
 */
export function getAIService(config?: Partial<AIServiceConfig>): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService(config);
  }
  return aiServiceInstance;
}

/**
 * Reset the AI service instance (useful for testing)
 */
export function resetAIService(): void {
  if (aiServiceInstance) {
    aiServiceInstance.destroy();
    aiServiceInstance = null;
  }
}

// Export the singleton instance
export const aiService = getAIService();

// Re-export types and utilities
export * from './types';
export { AIService } from './ai-service';
export { CacheManager } from './cache-manager';
export { defaultConfig, healthAnalysisPrompts } from './config';

// Re-export providers for direct use if needed
export { AnthropicProvider } from './providers/anthropic-provider';
export { OpenAIProvider } from './providers/openai-provider';
export { MockProvider } from './providers/mock-provider';

// Utility functions
export async function analyzeLabResults(labResults: any): Promise<import('./types').HealthAnalysis> {
  return aiService.analyzeHealth({ labResults });
}

export async function analyzeSymptoms(symptoms: any): Promise<import('./types').HealthAnalysis> {
  return aiService.analyzeHealth({ symptoms });
}

export async function generateHealthReport(
  data: {
    labResults?: any;
    symptoms?: any;
    medications?: any;
    lifestyle?: any;
  }
): Promise<import('./types').HealthAnalysis> {
  return aiService.analyzeHealth(data);
}

// Development utilities
if (env.get('NODE_ENV') === 'development') {
  // Expose service to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__aiService = aiService;
  }
}