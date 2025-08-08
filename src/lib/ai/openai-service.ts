import OpenAI from 'openai'
import { BaseAIService, AICompletionOptions, AICompletionResponse, AIServiceConfig } from './base-ai-service'

export class OpenAIService extends BaseAIService {
  private client: OpenAI

  constructor(config: AIServiceConfig) {
    super(config, 'OpenAI')
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 60000,
    })
  }

  async createCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
    return this.withRetry(async () => {
      const model = options.model || 'gpt-4-turbo-preview'
      
      const response = await this.client.chat.completions.create({
        model,
        messages: options.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 4096,
      })

      const content = response.choices[0]?.message?.content || ''
      
      return {
        content,
        model,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens
        } : undefined
      }
    })
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      })
      return response.choices.length > 0
    } catch (error) {
      console.error('[OpenAI] Health check failed:', error)
      return false
    }
  }

  estimateCost(tokens: number, model: string = 'gpt-4-turbo-preview'): number {
    // Pricing per 1M tokens (as of Oct 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4-turbo-preview': { input: 10.00, output: 30.00 },
      'gpt-4': { input: 30.00, output: 60.00 },
      'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
      'gpt-3.5-turbo-16k': { input: 3.00, output: 4.00 }
    }

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview']
    // Assume 70% input, 30% output for estimation
    const inputTokens = tokens * 0.7
    const outputTokens = tokens * 0.3
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1_000_000
  }
}
