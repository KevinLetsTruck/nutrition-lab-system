import Anthropic from '@anthropic-ai/sdk'
import { BaseAIService, AICompletionOptions, AICompletionResponse, AIServiceConfig } from './base-ai-service'

export class AnthropicService extends BaseAIService {
  private client: Anthropic

  constructor(config: AIServiceConfig) {
    super(config, 'Anthropic')
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeout || 60000,
    })
  }

  async createCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
    return this.withRetry(async () => {
      const model = options.model || 'claude-3-5-sonnet-20241022'
      
      // Convert messages to Anthropic format
      const systemMessage = options.messages.find(m => m.role === 'system')?.content || ''
      const messages = options.messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })) as Anthropic.MessageParam[]

      const response = await this.client.messages.create({
        model,
        messages,
        system: systemMessage,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.3,
      })

      // Extract text content
      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n')

      return {
        content,
        model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens
        }
      }
    })
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 10
      })
      return response.content.length > 0
    } catch (error) {
      console.error('[Anthropic] Health check failed:', error)
      return false
    }
  }

  estimateCost(tokens: number, model: string = 'claude-3-5-sonnet-20241022'): number {
    // Pricing per 1M tokens (as of Oct 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 }
    }

    const modelPricing = pricing[model] || pricing['claude-3-5-sonnet-20241022']
    // Assume 70% input, 30% output for estimation
    const inputTokens = tokens * 0.7
    const outputTokens = tokens * 0.3
    
    return (inputTokens * modelPricing.input + outputTokens * modelPricing.output) / 1_000_000
  }
}
