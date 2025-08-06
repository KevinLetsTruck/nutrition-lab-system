import Anthropic from '@anthropic-ai/sdk'

// Production-ready Claude client that tries multiple methods to get the API key
class ClaudeClientProduction {
  private client: Anthropic | null = null
  private apiKey: string | null = null
  
  constructor() {
    // Try multiple ways to get the API key
    this.apiKey = this.findApiKey()
    
    if (this.apiKey) {
      try {
        this.client = new Anthropic({ 
          apiKey: this.apiKey,
          defaultHeaders: {
            'anthropic-version': '2023-06-01'
          }
        })
        console.log('[CLAUDE-PROD] Client initialized successfully')
      } catch (error) {
        console.error('[CLAUDE-PROD] Failed to initialize client:', error)
        this.client = null
      }
    } else {
      console.error('[CLAUDE-PROD] No API key found after trying all methods')
    }
  }
  
  private findApiKey(): string | null {
    console.log('[CLAUDE-PROD] Attempting to find API key...')
    
    // Method 1: Standard environment variable
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('[CLAUDE-PROD] Found key via process.env.ANTHROPIC_API_KEY')
      return process.env.ANTHROPIC_API_KEY
    }
    
    // Method 2: Try with NEXT_PUBLIC prefix (shouldn't be needed but just in case)
    if (process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      console.log('[CLAUDE-PROD] Found key via process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY')
      return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
    }
    
    // Method 3: Check all env vars for anything containing the key
    const allEnvVars = Object.entries(process.env)
    for (const [key, value] of allEnvVars) {
      if (key.toUpperCase().includes('ANTHROPIC') && value?.startsWith('sk-ant-')) {
        console.log(`[CLAUDE-PROD] Found key via ${key}`)
        return value
      }
    }
    
    // Method 4: Try dynamic import (for edge cases)
    try {
      const dynamicKey = eval('process.env.ANTHROPIC_API_KEY')
      if (dynamicKey) {
        console.log('[CLAUDE-PROD] Found key via dynamic eval')
        return dynamicKey
      }
    } catch (e) {
      // Ignore eval errors
    }
    
    console.log('[CLAUDE-PROD] No API key found. Available env vars:', 
      Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY')).join(', ')
    )
    
    return null
  }
  
  static create(): ClaudeClientProduction {
    return new ClaudeClientProduction()
  }
  
  hasValidClient(): boolean {
    return this.client !== null
  }
  
  getApiKeyStatus(): { found: boolean; method: string; partial: string } {
    if (!this.apiKey) {
      return { found: false, method: 'none', partial: '' }
    }
    
    return {
      found: true,
      method: 'environment',
      partial: this.apiKey.substring(0, 10) + '...'
    }
  }
  
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'No client initialized - API key not found' }
    }
    
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Reply with just OK'
        }]
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
    if (!this.client) {
      throw new Error('Claude client not initialized - API key not found')
    }
    
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
    
    return response.content[0].type === 'text' ? response.content[0].text : ''
  }
}

export default ClaudeClientProduction