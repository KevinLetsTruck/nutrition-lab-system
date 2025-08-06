/**
 * AI Service Orchestrator
 * Manages multiple AI providers with fallback and caching
 */

import { 
  AIProvider, 
  AIProviderType, 
  AIOptions, 
  AIResponse, 
  HealthAnalysis,
  AIServiceError,
  AIServiceConfig
} from './types';
import { defaultConfig, retryConfig } from './config';
import { CacheManager } from './cache-manager';
import { AnthropicProvider } from './providers/anthropic-provider';
import { OpenAIProvider } from './providers/openai-provider';
import { MockProvider } from './providers/mock-provider';

export class AIService {
  private providers: Map<AIProviderType, AIProvider>;
  private cache: CacheManager;
  private config: AIServiceConfig;
  private providerHealth: Map<AIProviderType, { healthy: boolean; lastCheck: number }>;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.providers = new Map();
    this.cache = new CacheManager(this.config.cache.ttl, this.config.cache.maxSize);
    this.providerHealth = new Map();

    // Initialize providers
    this.initializeProviders();

    // Start health monitoring
    this.startHealthMonitoring();
  }

  private initializeProviders(): void {
    // Initialize Anthropic provider
    if (this.config.providers.anthropic?.apiKey) {
      this.providers.set('anthropic', new AnthropicProvider());
    }

    // Initialize OpenAI provider
    if (this.config.providers.openai?.apiKey) {
      this.providers.set('openai', new OpenAIProvider());
    }

    // Always initialize mock provider as fallback
    this.providers.set('mock', new MockProvider());

    if (this.config.debug) {
      console.log('[AIService] Initialized providers:', Array.from(this.providers.keys()));
    }
  }

  private startHealthMonitoring(): void {
    // Initial health check
    this.checkAllProvidersHealth();

    // Schedule periodic health checks every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.checkAllProvidersHealth();
    }, 5 * 60 * 1000);
  }

  private async checkAllProvidersHealth(): Promise<void> {
    for (const [type, provider] of this.providers) {
      try {
        const healthy = await provider.isHealthy();
        this.providerHealth.set(type, {
          healthy,
          lastCheck: Date.now(),
        });
        
        if (this.config.debug) {
          console.log(`[AIService] Provider ${type} health: ${healthy ? 'OK' : 'FAILED'}`);
        }
      } catch (error) {
        this.providerHealth.set(type, {
          healthy: false,
          lastCheck: Date.now(),
        });
        console.error(`[AIService] Health check failed for ${type}:`, error);
      }
    }
  }

  /**
   * Get a healthy provider, with preference order
   */
  private async getHealthyProvider(preferred?: AIProviderType): Promise<AIProvider> {
    // Check preferred provider first
    if (preferred && this.isProviderHealthy(preferred)) {
      const provider = this.providers.get(preferred);
      if (provider) return provider;
    }

    // Try providers in order of preference
    const providerOrder: AIProviderType[] = ['anthropic', 'openai', 'mock'];
    
    for (const type of providerOrder) {
      if (this.isProviderHealthy(type)) {
        const provider = this.providers.get(type);
        if (provider) return provider;
      }
    }

    // If all else fails, return mock provider
    const mockProvider = this.providers.get('mock');
    if (mockProvider) return mockProvider;

    throw new AIServiceError('No healthy providers available', 'NO_PROVIDERS_AVAILABLE');
  }

  private isProviderHealthy(type: AIProviderType): boolean {
    const health = this.providerHealth.get(type);
    
    // If no health check has been done, assume healthy
    if (!health) return true;
    
    // Consider stale if last check was more than 10 minutes ago
    const isStale = Date.now() - health.lastCheck > 10 * 60 * 1000;
    
    return health.healthy && !isStale;
  }

  /**
   * Complete a prompt with automatic provider selection and fallback
   */
  async complete(
    prompt: string, 
    options?: AIOptions & { provider?: AIProviderType; useCache?: boolean }
  ): Promise<AIResponse> {
    const useCache = options?.useCache !== false; // Default to true
    
    // Check cache if enabled
    if (useCache) {
      const cacheKey = this.cache.generateKey(prompt, options);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        if (this.config.debug) {
          console.log('[AIService] Cache hit for prompt');
        }
        return { ...cached, cached: true };
      }
    }

    // Get a healthy provider
    const provider = await this.getHealthyProvider(options?.provider);
    
    if (this.config.debug) {
      console.log(`[AIService] Using provider: ${provider.name}`);
    }

    // Attempt completion with retry logic
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await provider.complete(prompt, options);
        
        // Cache successful response
        if (useCache) {
          const cacheKey = this.cache.generateKey(prompt, options);
          this.cache.set(cacheKey, response);
        }
        
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (this.config.debug) {
          console.error(`[AIService] Attempt ${attempt + 1} failed:`, error);
        }

        // Check if error is retryable
        const isRetryable = error instanceof AIServiceError && 
          retryConfig.retryableErrors.some(code => error.message.includes(code));
        
        if (!isRetryable || attempt === retryConfig.maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        await this.delay(retryConfig.retryDelays[attempt] || 1000);
      }
    }

    // If all retries failed, try fallback provider
    if (provider.name !== 'mock') {
      if (this.config.debug) {
        console.log('[AIService] Falling back to mock provider');
      }
      
      const mockProvider = this.providers.get('mock');
      if (mockProvider) {
        try {
          return await mockProvider.complete(prompt, options);
        } catch (error) {
          // Even mock failed
        }
      }
    }

    throw new AIServiceError(
      `All providers failed: ${lastError?.message}`,
      'ALL_PROVIDERS_FAILED',
      undefined,
      lastError
    );
  }

  /**
   * Analyze health data with automatic provider selection
   */
  async analyzeHealth(
    data: any,
    options?: { provider?: AIProviderType; useCache?: boolean }
  ): Promise<HealthAnalysis> {
    const useCache = options?.useCache !== false;
    
    // Generate cache key for health data
    if (useCache) {
      const cacheKey = this.cache.generateKey('health_analysis', { data });
      const cached = this.cache.get(cacheKey);
      if (cached) {
        if (this.config.debug) {
          console.log('[AIService] Cache hit for health analysis');
        }
        return cached;
      }
    }

    // Get a healthy provider
    const provider = await this.getHealthyProvider(options?.provider);
    
    try {
      const analysis = await provider.analyzeHealth(data);
      
      // Cache successful analysis
      if (useCache) {
        const cacheKey = this.cache.generateKey('health_analysis', { data });
        this.cache.set(cacheKey, analysis, 2 * 60 * 60 * 1000); // Cache for 2 hours
      }
      
      return analysis;
    } catch (error) {
      // Try fallback if primary provider failed
      if (provider.name !== 'mock') {
        const mockProvider = this.providers.get('mock');
        if (mockProvider) {
          return await mockProvider.analyzeHealth(data);
        }
      }
      
      throw error;
    }
  }

  /**
   * Get current provider health status
   */
  getProviderStatus(): Record<string, { available: boolean; healthy: boolean; lastCheck?: Date }> {
    const status: Record<string, { available: boolean; healthy: boolean; lastCheck?: Date }> = {};
    
    for (const [type, provider] of this.providers) {
      const health = this.providerHealth.get(type);
      status[type] = {
        available: true,
        healthy: health?.healthy || false,
        lastCheck: health ? new Date(health.lastCheck) : undefined,
      };
    }
    
    return status;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.cache.clear();
    this.providers.clear();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}