/**
 * AI Service Type Definitions
 */

// Provider Types
export type AIProviderType = 'anthropic' | 'openai' | 'mock';

// AI Options for completion requests
export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  model?: string;
  systemPrompt?: string;
  stream?: boolean;
  metadata?: Record<string, any>;
}

// AI Response structure
export interface AIResponse {
  content: string;
  provider: AIProviderType;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
  latency?: number;
  error?: string;
}

// Health Analysis specific types
export interface HealthAnalysis {
  summary: string;
  findings: Finding[];
  recommendations: Recommendation[];
  riskFactors: RiskFactor[];
  confidence: number;
  metadata?: Record<string, any>;
}

export interface Finding {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  value?: string | number;
  reference?: string;
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high';
  category: string;
  description: string;
  timeframe?: string;
  resources?: string[];
}

export interface RiskFactor {
  name: string;
  level: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  mitigationStrategies?: string[];
}

// Provider Interface
export interface AIProvider {
  name: AIProviderType;
  isHealthy(): Promise<boolean>;
  complete(prompt: string, options?: AIOptions): Promise<AIResponse>;
  analyzeHealth(data: any): Promise<HealthAnalysis>;
}

// Cache Entry
export interface CacheEntry {
  key: string;
  value: any;
  expires: number;
  metadata?: Record<string, any>;
}

// Configuration Types
export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface AIServiceConfig {
  providers: {
    anthropic?: ProviderConfig;
    openai?: ProviderConfig;
  };
  cache: {
    ttl: number; // in milliseconds
    maxSize?: number;
  };
  fallbackProvider: AIProviderType;
  debug?: boolean;
}

// Error Types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: AIProviderType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}