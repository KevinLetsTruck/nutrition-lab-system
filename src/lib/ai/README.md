# AI Service Framework

A robust, provider-agnostic AI service framework with intelligent fallback, caching, and monitoring capabilities designed for the Nutrition Lab System.

## 🚀 Quick Start

### Basic Usage

```typescript
import { getAIService } from '@/lib/ai';

// Get the singleton AI service instance
const aiService = getAIService();

// Simple completion
const response = await aiService.complete('What are the benefits of vitamin D?');
console.log(response.content);

// With specific provider
const response = await aiService.complete('Analyze this symptom pattern', {
  provider: 'anthropic',  // or 'openai', 'mock'
  temperature: 0.3,       // Lower = more focused
  maxTokens: 500
});
```

### Health Analysis (FNTP Specific)

```typescript
// Analyze lab results
const labData = {
  cholesterol: 220,
  hdl: 45,
  ldl: 155,
  triglycerides: 180,
  glucose: 105
};

const analysis = await aiService.analyzeHealth(labData);
console.log(analysis.findings);     // Health findings
console.log(analysis.recommendations); // Nutrition recommendations
console.log(analysis.confidence);   // Confidence score
```

### Common FNTP Use Cases

```typescript
// 1. Analyze comprehensive lab panel
const comprehensiveAnalysis = await aiService.complete(`
  Analyze these lab results for nutritional deficiencies:
  - Vitamin D: 18 ng/mL
  - B12: 180 pg/mL
  - Ferritin: 12 ng/mL
  - TSH: 4.5 mIU/L
  
  Provide functional nutrition recommendations.
`, {
  temperature: 0.2,  // More precise for medical data
  useCache: true     // Cache for repeated queries
});

// 2. Generate meal plan based on conditions
const mealPlan = await aiService.complete(`
  Create a 3-day meal plan for a client with:
  - Hypothyroidism
  - Iron deficiency
  - Gluten sensitivity
  
  Include foods rich in selenium, iron, and B vitamins.
`, {
  maxTokens: 1000,
  provider: 'anthropic'  // Claude is good for detailed plans
});

// 3. Supplement protocol generation
const supplementProtocol = await aiService.complete(`
  Based on these symptoms and labs:
  - Chronic fatigue
  - Hair loss
  - Cold intolerance
  - Ferritin: 15 ng/mL
  - TSH: 5.2 mIU/L
  
  Suggest evidence-based supplement protocol with dosing.
`, {
  temperature: 0.1,  // Very focused for dosing
  useCache: false    // Always fresh for medical advice
});
```

## ⚙️ Configuration Options

### Environment Variables

```bash
# AI Provider Keys (at least one required)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Caching (optional)
REDIS_URL=redis://localhost:6379  # Enables persistent caching

# Debug Mode
AI_DEBUG=true  # Enables detailed logging
```

### Service Configuration

```typescript
import { getAIService, AIServiceConfig } from '@/lib/ai';

const config: Partial<AIServiceConfig> = {
  // Provider configuration
  providers: {
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-sonnet-20240229',  // or claude-3-opus for complex tasks
      maxTokens: 4096
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
      maxTokens: 4096
    }
  },
  
  // Caching configuration
  cache: {
    enabled: true,
    ttl: 3600000,  // 1 hour default
  },
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    retryableErrors: ['rate_limit', 'timeout', 'network_error']
  },
  
  // Enable debug logging
  debug: process.env.NODE_ENV === 'development'
};

// Apply custom configuration
const aiService = getAIService(config);
```

## 🔌 Adding New Providers

### 1. Create Provider Class

```typescript
// lib/ai/providers/new-provider.ts
import { AIProvider, AIResponse, AIOptions } from '../types';

export class NewProvider implements AIProvider {
  name: AIProviderType = 'new-provider';
  private client: any;
  
  constructor(config: { apiKey: string }) {
    this.client = new SomeAIClient({ apiKey: config.apiKey });
  }
  
  async isHealthy(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
  
  async complete(prompt: string, options?: AIOptions): Promise<AIResponse> {
    const response = await this.client.complete({
      prompt,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1000
    });
    
    return {
      content: response.text,
      provider: this.name,
      model: response.model,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.total_tokens
      }
    };
  }
  
  async analyzeHealth(data: any, options?: AIOptions): Promise<HealthAnalysis> {
    // Implement health-specific analysis
    const prompt = this.formatHealthPrompt(data);
    const response = await this.complete(prompt, options);
    return this.parseHealthResponse(response.content);
  }
}
```

### 2. Register Provider

```typescript
// lib/ai/ai-service.ts - in initializeProviders()
if (config.providers.newProvider?.apiKey) {
  this.providers.set('new-provider', new NewProvider({
    apiKey: config.providers.newProvider.apiKey
  }));
}
```

## 📊 Monitoring and Metrics

### Real-time Health Check

```typescript
// Check all providers health
const healthStatus = await aiService.healthCheck();
console.log(healthStatus);
// {
//   anthropic: { healthy: true, lastCheck: Date, responseTime: 245 },
//   openai: { healthy: false, lastCheck: Date, error: 'API key invalid' },
//   mock: { healthy: true, lastCheck: Date, responseTime: 0 }
// }
```

### Service Metrics

```typescript
// Get comprehensive metrics
const metrics = aiService.getMetrics();
console.log(metrics);
// {
//   totalRequests: 1250,
//   successfulRequests: 1230,
//   failedRequests: 20,
//   cacheHits: 450,
//   successRate: '98.40%',
//   cacheHitRate: '36.00%',
//   averageLatency: 1842,
//   averageLatencyMs: 1842,
//   providerUsage: {
//     anthropic: 780,
//     openai: 450,
//     mock: 20
//   },
//   uptime: '2h 34m 12s'
// }
```

### API Health Endpoint

```bash
# Monitor AI service health
curl http://localhost:3000/api/ai/health | jq '.'

# Response includes:
# - Provider health status
# - Current metrics
# - Cache statistics
# - Overall system status
```

### Setting Up Alerts

```typescript
// Example: Alert on high failure rate
setInterval(async () => {
  const metrics = aiService.getMetrics();
  const failureRate = (metrics.failedRequests / metrics.totalRequests) * 100;
  
  if (failureRate > 5) {
    console.error(`⚠️ High AI failure rate: ${failureRate.toFixed(2)}%`);
    // Send alert to monitoring service
  }
}, 60000); // Check every minute
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "All AI providers failed"

```typescript
// Check provider status
const status = aiService.getProviderStatus();
console.log(status);

// Common causes:
// - Invalid API keys
// - Rate limiting
// - Network issues

// Solution: Ensure at least one provider is configured
if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
  console.error('No AI providers configured!');
}
```

#### 2. High Latency

```typescript
// Enable debug mode to see timing
const aiService = getAIService({ debug: true });

// Check cache hit rate
const metrics = aiService.getMetrics();
if (parseFloat(metrics.cacheHitRate) < 20) {
  console.log('Low cache hit rate - consider longer TTL');
}
```

#### 3. Rate Limiting

```typescript
// Implement request throttling
const queue = [];
const MAX_CONCURRENT = 5;

async function throttledRequest(prompt: string) {
  while (queue.length >= MAX_CONCURRENT) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const promise = aiService.complete(prompt);
  queue.push(promise);
  
  try {
    return await promise;
  } finally {
    queue.splice(queue.indexOf(promise), 1);
  }
}
```

#### 4. Cache Not Working

```bash
# Check Redis connection
redis-cli ping

# Verify environment variable
echo $REDIS_URL

# Test cache directly
npx tsx scripts/test-redis-cache.ts
```

## 💰 Cost Optimization Tips

### 1. Enable Caching

```typescript
// Always use cache for repeated queries
const response = await aiService.complete(prompt, {
  useCache: true  // Default, but be explicit
});

// Set appropriate TTL for different content types
await aiService.complete(prompt, {
  useCache: true,
  cacheTTL: 24 * 60 * 60 * 1000  // 24 hours for stable content
});
```

### 2. Use Appropriate Models

```typescript
// Use cheaper models for simple tasks
const summary = await aiService.complete('Summarize this text', {
  provider: 'openai',
  model: 'gpt-3.5-turbo',  // Cheaper than GPT-4
  maxTokens: 200
});

// Use powerful models only when needed
const complexAnalysis = await aiService.complete('Complex medical analysis...', {
  provider: 'anthropic',
  model: 'claude-3-opus-20240229',  // Most capable but expensive
  temperature: 0.1
});
```

### 3. Implement Prompt Optimization

```typescript
// Bad: Verbose prompt
const bad = await aiService.complete(`
  I would like you to analyze these lab results and provide 
  a comprehensive analysis with detailed explanations...
  [500 words of instructions]
`);

// Good: Concise prompt
const good = await aiService.complete(`
  Analyze these labs for nutritional deficiencies:
  - Vitamin D: 18 ng/mL
  - B12: 180 pg/mL
  
  Format: Finding | Recommendation
`);
```

### 4. Batch Similar Requests

```typescript
// Instead of multiple calls
const results = [];
for (const client of clients) {
  results.push(await aiService.analyzeHealth(client.labs));
}

// Batch into single call
const batchPrompt = clients.map((c, i) => 
  `Client ${i + 1}:\n${JSON.stringify(c.labs)}`
).join('\n\n');

const batchAnalysis = await aiService.complete(
  `Analyze these ${clients.length} client lab panels:\n${batchPrompt}`
);
```

### 5. Monitor Usage

```typescript
// Track costs by provider
const metrics = aiService.getMetrics();
const costs = {
  anthropic: metrics.providerUsage.anthropic * 0.015,  // ~$0.015/1K tokens
  openai: metrics.providerUsage.openai * 0.03,         // ~$0.03/1K tokens
};

console.log('Estimated costs:', costs);
```

### 6. Use Mock Provider for Development

```typescript
// Force mock provider in development
const aiService = getAIService({
  providers: process.env.NODE_ENV === 'development' 
    ? { mock: {} }
    : { anthropic: { apiKey: process.env.ANTHROPIC_API_KEY } }
});
```

## 🏥 FNTP-Specific Best Practices

### 1. Medical Data Handling

```typescript
// Always use low temperature for medical analysis
const analysis = await aiService.complete(medicalPrompt, {
  temperature: 0.1,  // High precision
  useCache: false    // Fresh analysis for medical data
});
```

### 2. Client Privacy

```typescript
// Anonymize data before sending
const sanitized = {
  ...labData,
  clientId: 'REDACTED',
  name: 'REDACTED'
};

const analysis = await aiService.analyzeHealth(sanitized);
```

### 3. Structured Outputs

```typescript
// Request structured format for parsing
const prompt = `
Analyze these symptoms and return JSON:
{
  "primary_concerns": [],
  "nutritional_deficiencies": [],
  "supplement_recommendations": [],
  "dietary_changes": []
}

Symptoms: ${symptoms}
`;

const response = await aiService.complete(prompt);
const structured = JSON.parse(response.content);
```

## 📚 Additional Resources

- [AI Provider Comparison](./providers/README.md)
- [Cache Manager Documentation](./REDIS_CACHING.md)
- [API Endpoints Guide](../../docs/AI_ANALYZE_ENDPOINT.md)
- [Health Monitoring](../../docs/AI_HEALTH_MONITORING.md)

## 🤝 Contributing

When adding new features:
1. Update types in `types.ts`
2. Add provider tests in `__tests__`
3. Update this README
4. Add cost estimates for new providers