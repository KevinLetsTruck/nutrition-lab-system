import { AIServiceManager, AIServiceManagerConfig } from './ai-service-manager'

let aiServiceManager: AIServiceManager | null = null

export function getAIServiceManager(): AIServiceManager {
  if (!aiServiceManager) {
    const config: AIServiceManagerConfig = {
      primaryProvider: process.env.AI_PRIMARY_PROVIDER as 'anthropic' | 'openai' || 'anthropic',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      enableMock: process.env.NODE_ENV === 'development' && !process.env.ANTHROPIC_API_KEY,
      enableFallback: true,
      cacheEnabled: process.env.AI_CACHE_ENABLED === 'true',
      cacheTTL: parseInt(process.env.AI_CACHE_TTL || '3600000')
    }

    aiServiceManager = new AIServiceManager(config)
  }

  return aiServiceManager
}

// Export types and classes for external use
export type { AIMessage, AICompletionOptions, AICompletionResponse } from './base-ai-service'
export { AIServiceManager } from './ai-service-manager'
export { BaseAIService } from './base-ai-service'