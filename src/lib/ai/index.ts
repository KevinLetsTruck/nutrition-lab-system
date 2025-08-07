/**
 * AI Service Singleton Export
 * 
 * Provides a global instance of the AI service for use throughout the application.
 * Uses lazy initialization to create the instance only when first requested.
 */

import { AIService } from './ai-service';
import { AIServiceConfig } from './types';
import { env } from '@/lib/config/env';

// Singleton instance - initialized only when first requested
let aiServiceInstance: AIService | null = null;

// Track if instance has been configured
let isConfigured = false;

/**
 * Get or create the AI service instance (Singleton Pattern)
 * 
 * This function ensures only one instance of AIService exists across the entire application.
 * The instance is created lazily on first access, preventing unnecessary resource allocation.
 * 
 * @param config - Optional configuration for the AI service (only used on first call)
 * @returns The singleton AIService instance
 * 
 * @example
 * ```typescript
 * // First call - creates the instance with config
 * const ai = getAIService({ debug: true });
 * 
 * // Subsequent calls - returns the same instance (config ignored)
 * const sameAi = getAIService();
 * ```
 */
export function getAIService(config?: Partial<AIServiceConfig>): AIService {
  // Lazy initialization - create instance only when first requested
  if (!aiServiceInstance) {
    console.log('[AI Service] Creating singleton instance...');
    
    // Build configuration from environment if not provided
    const finalConfig: Partial<AIServiceConfig> = config || {
      providers: {
        anthropic: {
          apiKey: env.get('ANTHROPIC_API_KEY') || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
        },
        openai: {
          apiKey: env.get('OPENAI_API_KEY'),
        }
      },
      debug: env.get('NODE_ENV') === 'development',
    };
    
    aiServiceInstance = new AIService(finalConfig);
    isConfigured = true;
    
    console.log('[AI Service] Singleton instance created successfully');
  } else if (config && !isConfigured) {
    console.warn('[AI Service] Instance already exists. Configuration ignored. Use resetAIService() to reconfigure.');
  }
  
  return aiServiceInstance;
}

/**
 * Reset the AI service instance (useful for testing or reconfiguration)
 * 
 * This destroys the current instance and allows a new one to be created
 * with different configuration on the next getAIService() call.
 */
export async function resetAIService(): Promise<void> {
  if (aiServiceInstance) {
    console.log('[AI Service] Resetting singleton instance...');
    await aiServiceInstance.destroy();
    aiServiceInstance = null;
    isConfigured = false;
  }
}

// Re-export types and utilities
export * from './types';
export { AIService } from './ai-service';
export { CacheManager } from './cache-manager';
export { defaultConfig, healthAnalysisPrompts } from './config';

// Re-export providers for direct use if needed
export { AnthropicProvider } from './providers/anthropic-provider';
export { OpenAIProvider } from './providers/openai-provider';
export { MockProvider } from './providers/mock-provider';

// Export environment check utilities
export { 
  checkAIEnvironment, 
  checkAndLogAIEnvironment, 
  getConfiguredProviders,
  maskApiKey,
  type AIEnvironmentStatus 
} from './env-check';

// Utility functions that use the lazy-loaded singleton
export async function analyzeLabResults(labResults: any): Promise<import('./types').HealthAnalysis> {
  const ai = getAIService();
  return ai.analyzeHealth({ labResults });
}

export async function analyzeSymptoms(symptoms: any): Promise<import('./types').HealthAnalysis> {
  const ai = getAIService();
  return ai.analyzeHealth({ symptoms });
}

export async function generateHealthReport(
  data: {
    labResults?: any;
    symptoms?: any;
    medications?: any;
    lifestyle?: any;
  }
): Promise<import('./types').HealthAnalysis> {
  const ai = getAIService();
  return ai.analyzeHealth(data);
}

// Development utilities
if (env.get('NODE_ENV') === 'development') {
  // Expose getAIService to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).__getAIService = getAIService;
    (window as any).__resetAIService = resetAIService;
  }
}