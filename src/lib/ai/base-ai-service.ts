export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AICompletionOptions {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  model?: string
}

export interface AICompletionResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIServiceConfig {
  apiKey: string
  maxRetries?: number
  timeout?: number
  baseURL?: string
}

export abstract class BaseAIService {
  protected config: AIServiceConfig
  protected serviceName: string

  constructor(config: AIServiceConfig, serviceName: string) {
    this.config = config
    this.serviceName = serviceName
  }

  abstract createCompletion(options: AICompletionOptions): Promise<AICompletionResponse>
  abstract isHealthy(): Promise<boolean>
  abstract estimateCost(tokens: number, model?: string): number

  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries || 3
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.error(`[${this.serviceName}] Attempt ${attempt + 1} failed:`, error)
        
        if (attempt < maxRetries - 1) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }
}
