import { BaseAIService, AICompletionOptions, AICompletionResponse } from './base-ai-service'
import { AnthropicService } from './anthropic-service'
import { OpenAIService } from './openai-service'
import { MockAIService } from './mock-service'

export interface AIServiceManagerConfig {
  primaryProvider?: 'anthropic' | 'openai'
  anthropicApiKey?: string
  openaiApiKey?: string
  enableMock?: boolean
  enableFallback?: boolean
  cacheEnabled?: boolean
  cacheTTL?: number
}

interface CacheEntry {
  response: AICompletionResponse
  timestamp: number
  ttl: number
}

export class AIServiceManager {
  private services: Map<string, BaseAIService> = new Map()
  private primaryService?: BaseAIService
  private config: AIServiceManagerConfig
  private cache: Map<string, CacheEntry> = new Map()
  private healthStatus: Map<string, boolean> = new Map()
  private totalCost: number = 0

  constructor(config: AIServiceManagerConfig) {
    this.config = config

    // Initialize services based on available API keys
    if (config.anthropicApiKey) {
      const anthropic = new AnthropicService({ apiKey: config.anthropicApiKey })
      this.services.set('anthropic', anthropic)
      if (config.primaryProvider === 'anthropic' || !config.primaryProvider) {
        this.primaryService = anthropic
      }
    }

    if (config.openaiApiKey) {
      const openai = new OpenAIService({ apiKey: config.openaiApiKey })
      this.services.set('openai', openai)
      if (config.primaryProvider === 'openai') {
        this.primaryService = openai
      }
    }

    if (config.enableMock || (!config.anthropicApiKey && !config.openaiApiKey)) {
      const mock = new MockAIService({ apiKey: 'mock-key' })
      this.services.set('mock', mock)
      if (!this.primaryService) {
        this.primaryService = mock
      }
    }

    // Start health monitoring
    this.startHealthMonitoring()
  }

  async createCompletion(options: AICompletionOptions): Promise<AICompletionResponse> {
    // Check cache first
    if (this.config.cacheEnabled) {
      const cacheKey = this.getCacheKey(options)
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        console.log('[AI Manager] Returning cached response')
        return cached
      }
    }

    // Try primary service first
    if (this.primaryService && this.isServiceHealthy(this.primaryService)) {
      try {
        const response = await this.primaryService.createCompletion(options)
        this.trackUsage(response, this.primaryService)
        this.cacheResponse(options, response)
        return response
      } catch (error) {
        console.error('[AI Manager] Primary service failed:', error)
        this.markServiceUnhealthy(this.primaryService)
      }
    }

    // Fallback to other services
    if (this.config.enableFallback !== false) {
      for (const [name, service] of this.services) {
        if (service !== this.primaryService && this.isServiceHealthy(service)) {
          try {
            console.log(`[AI Manager] Falling back to ${name}`)
            const response = await service.createCompletion(options)
            this.trackUsage(response, service)
            this.cacheResponse(options, response)
            return response
          } catch (error) {
            console.error(`[AI Manager] Fallback service ${name} failed:`, error)
            this.markServiceUnhealthy(service)
          }
        }
      }
    }

    throw new Error('All AI services failed')
  }

  async analyzeLabResults(labData: any, options?: Partial<AICompletionOptions>): Promise<string> {
    const systemPrompt = `You are an expert functional medicine practitioner specializing in lab analysis for truck drivers. 
Analyze the provided lab results and provide:
1. Clinical interpretation of each marker
2. Pattern identification (metabolic, hormonal, nutritional, inflammatory)
3. Truck driver specific considerations
4. Root cause analysis
5. Prioritized recommendations`

    const userPrompt = `Please analyze these lab results:
${JSON.stringify(labData, null, 2)}`

    const response = await this.createCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 4096,
      ...options
    })

    return response.content
  }

  async generateProtocol(analysis: any, clientInfo: any, options?: Partial<AICompletionOptions>): Promise<string> {
    const systemPrompt = `You are creating a personalized health protocol for a truck driver based on lab analysis.
Include:
1. Supplement recommendations with specific brands, doses, and timing
2. Dietary modifications compatible with life on the road
3. Lifestyle interventions that can be done in/around a truck
4. Implementation timeline and priorities
5. Monitoring plan and success metrics`

    const userPrompt = `Create a protocol based on:
Client Info: ${JSON.stringify(clientInfo, null, 2)}
Analysis: ${JSON.stringify(analysis, null, 2)}`

    const response = await this.createCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      maxTokens: 4096,
      ...options
    })

    return response.content
  }

  private getCacheKey(options: AICompletionOptions): string {
    return JSON.stringify({
      messages: options.messages,
      temperature: options.temperature,
      model: options.model
    })
  }

  private getFromCache(key: string): AICompletionResponse | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.response
  }

  private cacheResponse(options: AICompletionOptions, response: AICompletionResponse): void {
    if (!this.config.cacheEnabled) return

    const key = this.getCacheKey(options)
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
      ttl: this.config.cacheTTL || 3600000 // 1 hour default
    })

    // Limit cache size
    if (this.cache.size > 100) {
      const oldest = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0]
      if (oldest) {
        this.cache.delete(oldest[0])
      }
    }
  }

  private trackUsage(response: AICompletionResponse, service: BaseAIService): void {
    if (response.usage) {
      const cost = service.estimateCost(response.usage.totalTokens, response.model)
      this.totalCost += cost
      console.log(`[AI Manager] Usage: ${response.usage.totalTokens} tokens, cost: $${cost.toFixed(4)}`)
    }
  }

  private isServiceHealthy(service: BaseAIService): boolean {
    const serviceName = this.getServiceName(service)
    return this.healthStatus.get(serviceName) !== false
  }

  private markServiceUnhealthy(service: BaseAIService): void {
    const serviceName = this.getServiceName(service)
    this.healthStatus.set(serviceName, false)
    
    // Schedule health check retry
    setTimeout(() => {
      this.checkServiceHealth(serviceName, service)
    }, 60000) // Retry after 1 minute
  }

  private getServiceName(service: BaseAIService): string {
    for (const [name, s] of this.services) {
      if (s === service) return name
    }
    return 'unknown'
  }

  private startHealthMonitoring(): void {
    // Initial health check
    for (const [name, service] of this.services) {
      this.checkServiceHealth(name, service)
    }

    // Periodic health checks
    setInterval(() => {
      for (const [name, service] of this.services) {
        this.checkServiceHealth(name, service)
      }
    }, 300000) // Every 5 minutes
  }

  private async checkServiceHealth(name: string, service: BaseAIService): Promise<void> {
    try {
      const healthy = await service.isHealthy()
      this.healthStatus.set(name, healthy)
      if (healthy) {
        console.log(`[AI Manager] ${name} service is healthy`)
      } else {
        console.warn(`[AI Manager] ${name} service is unhealthy`)
      }
    } catch (error) {
      console.error(`[AI Manager] Health check failed for ${name}:`, error)
      this.healthStatus.set(name, false)
    }
  }

  getHealthStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {}
    for (const [name, healthy] of this.healthStatus) {
      status[name] = healthy
    }
    return status
  }

  getTotalCost(): number {
    return this.totalCost
  }

  getCacheStats(): { size: number; hitRate: number } {
    // This would need more sophisticated tracking for accurate hit rate
    return {
      size: this.cache.size,
      hitRate: 0 // Placeholder
    }
  }
}
