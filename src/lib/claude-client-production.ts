import { getAIService } from '@/lib/ai'

// Production-ready Claude client that uses the AI service framework
class ClaudeClientProduction {
  private aiService = getAIService()
  
  constructor() {
    console.log('[CLAUDE-PROD] Using AI Service framework with automatic fallback')
  }

  
  static create(): ClaudeClientProduction {
    return new ClaudeClientProduction()
  }
  
  hasValidClient(): boolean {
    // Check if AI service has providers available
    const status = this.aiService.getProviderStatus()
    return Object.values(status).some(provider => provider.available && provider.healthy)
  }
  
  getApiKeyStatus(): { found: boolean; method: string; partial: string } {
    // Check if Anthropic is configured in the AI service
    const status = this.aiService.getProviderStatus()
    const anthropicAvailable = status.anthropic?.available || false
    
    return {
      found: anthropicAvailable,
      method: anthropicAvailable ? 'ai-service' : 'none',
      partial: anthropicAvailable ? 'Configured in AI Service' : ''
    }
  }
  
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.aiService.complete('Reply with just OK', {
        maxTokens: 10,
        provider: 'anthropic',
        useCache: false
      })
      
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Unknown error'
      }
    }
  }
  
  async analyzePractitionerReport(prompt: string, systemPrompt: string): Promise<string> {
    try {
      const response = await this.aiService.complete(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 4000,
        provider: 'anthropic',
        useCache: false
      })
      
      return response.content
    } catch (error) {
      console.error('[CLAUDE-PROD] Analysis failed:', error)
      throw error
    }
  }
}

export default ClaudeClientProduction