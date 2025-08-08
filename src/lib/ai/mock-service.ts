import { BaseAIService, AICompletionOptions, AICompletionResponse, AIServiceConfig } from './base-ai-service'

export class MockAIService extends BaseAIService {
  private simulateDelay: number
  private shouldFail: boolean

  constructor(config: AIServiceConfig & { simulateDelay?: number; shouldFail?: boolean }) {
    super(config, 'Mock')
    this.simulateDelay = config.simulateDelay || 100
    this.shouldFail = config.shouldFail || false
  }

  async createCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.simulateDelay))

    if (this.shouldFail) {
      throw new Error('Mock AI service simulated failure')
    }

    // Generate mock response based on input
    const lastMessage = options.messages[options.messages.length - 1]
    let content = ''

    if (lastMessage?.content.toLowerCase().includes('lab')) {
      content = `Based on the lab results analysis:

Key Findings:
- Glucose levels are slightly elevated (95 mg/dL)
- Vitamin D deficiency detected (22 ng/mL)
- Triglycerides are elevated (180 mg/dL)

Recommendations:
1. Supplement with Vitamin D3 5000 IU daily
2. Reduce refined carbohydrate intake
3. Increase physical activity

This is a mock response for testing purposes.`
    } else if (lastMessage?.content.toLowerCase().includes('health')) {
      content = `Health Assessment Summary:

Overall Health Score: 7.2/10

Areas of Concern:
- Metabolic health needs attention
- Nutritional deficiencies present
- Stress management could be improved

Priority Actions:
1. Schedule follow-up lab work in 3 months
2. Begin supplementation protocol
3. Implement dietary modifications

This is a mock response for testing purposes.`
    } else {
      content = `Mock AI Response: I understand your request about "${lastMessage?.content.substring(0, 50)}...". 

Here's a simulated response that would normally contain detailed analysis and recommendations based on the input provided.

Key Points:
- Point 1: Sample analysis detail
- Point 2: Additional observation
- Point 3: Recommendation

This is a mock response for testing purposes.`
    }

    const tokens = content.split(' ').length * 1.3 // Rough token estimation

    return {
      content,
      model: 'mock-model',
      usage: {
        promptTokens: Math.floor(tokens * 0.7),
        completionTokens: Math.floor(tokens * 0.3),
        totalTokens: Math.floor(tokens)
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 50))
    return !this.shouldFail
  }

  estimateCost(tokens: number): number {
    // Mock cost: $0.01 per 1K tokens
    return tokens * 0.00001
  }
}
