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
import { checkAndLogAIEnvironment } from './env-check';

// Metrics interface
interface AIServiceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  providerUsage: Record<AIProviderType, number>;
  averageLatency: number;
  lastError?: string;
  startTime: number;
}

export class AIService {
  private providers: Map<AIProviderType, AIProvider>;
  private cache: CacheManager;
  private config: AIServiceConfig;
  private providerHealth: Map<AIProviderType, { healthy: boolean; lastCheck: number }>;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metrics: AIServiceMetrics;

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.providers = new Map();
    this.cache = new CacheManager(this.config.cache.ttl);
    this.providerHealth = new Map();
    
    // Initialize metrics
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      cacheHits: 0,
      providerUsage: {
        anthropic: 0,
        openai: 0,
        mock: 0
      },
      averageLatency: 0,
      startTime: Date.now()
    };

    // Check environment configuration
    const envStatus = checkAndLogAIEnvironment();
    if (!envStatus.isConfigured && this.config.debug) {
      console.warn('[AIService] No AI providers properly configured - using Mock provider only');
    }

    // Initialize providers
    this.initializeProviders();

    // Start health monitoring
    this.startHealthMonitoring();
    
    if (this.config.debug) {
      console.log('[AIService] Initialized with config:', {
        providers: Object.keys(this.config.providers),
        cacheEnabled: true,
        cacheTTL: this.config.cache.ttl,
        debug: this.config.debug
      });
    }
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
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    if (this.config.debug) {
      console.log('[AIService] Starting completion request', {
        promptLength: prompt.length,
        preferredProvider: options?.provider,
        useCache: options?.useCache !== false,
        requestNumber: this.metrics.totalRequests
      });
    }
    
    const useCache = options?.useCache !== false; // Default to true
    
    // Check cache if enabled
    if (useCache) {
      const cacheKey = this.cache.generateKey(prompt, options);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        this.metrics.successfulRequests++;
        
        if (this.config.debug) {
          console.log('[AIService] Cache hit!', {
            cacheHits: this.metrics.cacheHits,
            cacheHitRate: ((this.metrics.cacheHits / this.metrics.totalRequests) * 100).toFixed(2) + '%'
          });
        }
        return { ...cached, cached: true };
      }
    }

    // Get a healthy provider
    const provider = await this.getHealthyProvider(options?.provider);
    
    if (this.config.debug) {
      console.log(`[AIService] Selected provider: ${provider.name}`, {
        isPreferred: provider.name === options?.provider,
        providerHealth: this.providerHealth.get(provider.name)
      });
    }

    // Attempt completion with retry logic
    let lastError: Error | undefined;
    let successfulProvider: AIProviderType | undefined;
    
    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        if (this.config.debug && attempt > 0) {
          console.log(`[AIService] Retry attempt ${attempt + 1}/${retryConfig.maxRetries + 1}`);
        }
        
        const response = await provider.complete(prompt, options);
        
        // Track successful provider usage
        successfulProvider = provider.name;
        this.metrics.providerUsage[provider.name] = (this.metrics.providerUsage[provider.name] || 0) + 1;
        this.metrics.successfulRequests++;
        
        // Update average latency
        const latency = Date.now() - startTime;
        this.updateAverageLatency(latency);
        
        // Cache successful response
        if (useCache) {
          const cacheKey = this.cache.generateKey(prompt, options);
          await this.cache.set(cacheKey, response);
          
          if (this.config.debug) {
            console.log('[AIService] Response cached for future use');
          }
        }
        
        if (this.config.debug) {
          console.log('[AIService] Completion successful', {
            provider: provider.name,
            latency: `${latency}ms`,
            responseLength: response.content.length,
            usage: response.usage
          });
        }
        
        return { ...response, latency };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (this.config.debug) {
          console.error(`[AIService] Attempt ${attempt + 1} failed:`, {
            provider: provider.name,
            error: lastError.message,
            attempt: attempt + 1
          });
        }

        // Check if error is retryable
        const isRetryable = error instanceof AIServiceError && 
          retryConfig.retryableErrors.some(code => error.message.includes(code));
        
        if (!isRetryable || attempt === retryConfig.maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        const retryDelay = retryConfig.retryDelays[attempt] || 1000;
        if (this.config.debug) {
          console.log(`[AIService] Waiting ${retryDelay}ms before retry...`);
        }
        await this.delay(retryDelay);
      }
    }

    // If all retries failed, try fallback provider
    if (provider.name !== 'mock') {
      if (this.config.debug) {
        console.log('[AIService] Primary provider failed, attempting fallback to mock provider');
      }
      
      const mockProvider = this.providers.get('mock');
      if (mockProvider) {
        try {
          const response = await mockProvider.complete(prompt, options);
          
          // Track mock provider usage
          this.metrics.providerUsage['mock'] = (this.metrics.providerUsage['mock'] || 0) + 1;
          this.metrics.successfulRequests++;
          
          const latency = Date.now() - startTime;
          this.updateAverageLatency(latency);
          
          if (this.config.debug) {
            console.log('[AIService] Fallback to mock provider successful', {
              latency: `${latency}ms`
            });
          }
          
          return { ...response, latency };
        } catch (error) {
          if (this.config.debug) {
            console.error('[AIService] Even mock provider failed:', error);
          }
        }
      }
    }

    // All providers failed
    this.metrics.failedRequests++;
    this.metrics.lastError = lastError?.message;
    
    if (this.config.debug) {
      console.error('[AIService] All providers failed', {
        totalAttempts: retryConfig.maxRetries + 1,
        failedRequests: this.metrics.failedRequests,
        lastError: lastError?.message
      });
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
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    if (this.config.debug) {
      console.log('[AIService] Starting health analysis', {
        dataType: typeof data,
        preferredProvider: options?.provider,
        useCache: options?.useCache !== false
      });
    }
    
    const useCache = options?.useCache !== false;
    
    // Generate cache key for health data
    if (useCache) {
      const cacheKey = this.cache.generateKey('health_analysis', { data });
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.metrics.cacheHits++;
        this.metrics.successfulRequests++;
        
        if (this.config.debug) {
          console.log('[AIService] Cache hit for health analysis', {
            cacheHits: this.metrics.cacheHits,
            cacheHitRate: ((this.metrics.cacheHits / this.metrics.totalRequests) * 100).toFixed(2) + '%'
          });
        }
        return cached;
      }
    }

    // Get a healthy provider
    const provider = await this.getHealthyProvider(options?.provider);
    
    if (this.config.debug) {
      console.log(`[AIService] Using provider for health analysis: ${provider.name}`);
    }
    
    try {
      const analysis = await provider.analyzeHealth(data);
      
      // Track successful provider usage
      this.metrics.providerUsage[provider.name] = (this.metrics.providerUsage[provider.name] || 0) + 1;
      this.metrics.successfulRequests++;
      
      // Update average latency
      const latency = Date.now() - startTime;
      this.updateAverageLatency(latency);
      
      // Cache successful analysis
      if (useCache) {
        const cacheKey = this.cache.generateKey('health_analysis', { data });
        await this.cache.set(cacheKey, analysis, 2 * 60 * 60 * 1000); // Cache for 2 hours
        
        if (this.config.debug) {
          console.log('[AIService] Health analysis cached for 2 hours');
        }
      }
      
      if (this.config.debug) {
        console.log('[AIService] Health analysis successful', {
          provider: provider.name,
          latency: `${latency}ms`,
          confidence: analysis.confidence,
          findingsCount: analysis.findings.length,
          recommendationsCount: analysis.recommendations.length
        });
      }
      
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (this.config.debug) {
        console.error('[AIService] Health analysis failed:', {
          provider: provider.name,
          error: errorMessage
        });
      }
      
      // Try fallback if primary provider failed
      if (provider.name !== 'mock') {
        if (this.config.debug) {
          console.log('[AIService] Attempting fallback to mock provider for health analysis');
        }
        
        const mockProvider = this.providers.get('mock');
        if (mockProvider) {
          try {
            const analysis = await mockProvider.analyzeHealth(data);
            
            // Track mock provider usage
            this.metrics.providerUsage['mock'] = (this.metrics.providerUsage['mock'] || 0) + 1;
            this.metrics.successfulRequests++;
            
            const latency = Date.now() - startTime;
            this.updateAverageLatency(latency);
            
            if (this.config.debug) {
              console.log('[AIService] Fallback health analysis successful', {
                latency: `${latency}ms`
              });
            }
            
            return analysis;
          } catch (fallbackError) {
            if (this.config.debug) {
              console.error('[AIService] Mock provider also failed:', fallbackError);
            }
          }
        }
      }
      
      // All providers failed
      this.metrics.failedRequests++;
      this.metrics.lastError = errorMessage;
      
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
  async getCacheStats() {
    return await this.cache.getStats();
  }

  /**
   * Update average latency metric
   */
  private updateAverageLatency(latency: number): void {
    const currentAvg = this.metrics.averageLatency;
    const successCount = this.metrics.successfulRequests;
    
    // Calculate new average
    this.metrics.averageLatency = ((currentAvg * (successCount - 1)) + latency) / successCount;
  }

  /**
   * Public method to check health of all providers
   */
  async healthCheck(): Promise<Record<AIProviderType, { healthy: boolean; lastCheck: Date; responseTime?: number }>> {
    if (this.config.debug) {
      console.log('[AIService] Running health check on all providers');
    }
    
    const healthStatus: Record<AIProviderType, { healthy: boolean; lastCheck: Date; responseTime?: number }> = {} as any;
    
    for (const [type, provider] of this.providers) {
      const startTime = Date.now();
      
      try {
        const healthy = await provider.isHealthy();
        const responseTime = Date.now() - startTime;
        
        this.providerHealth.set(type, {
          healthy,
          lastCheck: Date.now(),
        });
        
        healthStatus[type] = {
          healthy,
          lastCheck: new Date(),
          responseTime
        };
        
        if (this.config.debug) {
          console.log(`[AIService] Health check for ${type}:`, {
            healthy,
            responseTime: `${responseTime}ms`
          });
        }
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        this.providerHealth.set(type, {
          healthy: false,
          lastCheck: Date.now(),
        });
        
        healthStatus[type] = {
          healthy: false,
          lastCheck: new Date(),
          responseTime
        };
        
        if (this.config.debug) {
          console.error(`[AIService] Health check failed for ${type}:`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: `${responseTime}ms`
          });
        }
      }
    }
    
    return healthStatus;
  }

  /**
   * Get current service metrics
   */
  getMetrics(): AIServiceMetrics & {
    uptime: number;
    successRate: number;
    cacheHitRate: number;
    averageLatencyMs: number;
  } {
    const uptime = Date.now() - this.metrics.startTime;
    const successRate = this.metrics.totalRequests > 0 
      ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 
      : 0;
    const cacheHitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.cacheHits / this.metrics.totalRequests) * 100 
      : 0;
    
    if (this.config.debug) {
      console.log('[AIService] Metrics requested', {
        totalRequests: this.metrics.totalRequests,
        successRate: `${successRate.toFixed(2)}%`,
        cacheHitRate: `${cacheHitRate.toFixed(2)}%`
      });
    }
    
    return {
      ...this.metrics,
      uptime,
      successRate,
      cacheHitRate,
      averageLatencyMs: Math.round(this.metrics.averageLatency)
    };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
    
    if (this.config.debug) {
      console.log('[AIService] Cache cleared');
    }
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    await this.cache.clear();
    if (this.cache.destroy) {
      this.cache.destroy();
    }
    this.providers.clear();
    
    if (this.config.debug) {
      console.log('[AIService] Service destroyed and resources cleaned up');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}