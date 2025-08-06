# AI Service Framework

A robust, multi-provider AI service framework with automatic fallback, caching, and health monitoring.

## Features

- **Multiple AI Providers**: Support for Anthropic (Claude), OpenAI, and Mock providers
- **Automatic Fallback**: Seamlessly switches to available providers when one fails
- **Response Caching**: Built-in caching with configurable TTL
- **Health Monitoring**: Automatic health checks for all providers
- **Retry Logic**: Configurable retry with exponential backoff
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Health Analysis**: Specialized methods for analyzing health and lab data

## Installation

The AI service is already integrated into the project. To use it:

```typescript
import { aiService } from '@/lib/ai';
```

## Configuration

The service is configured through environment variables:

- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `OPENAI_API_KEY`: Your OpenAI API key

Default configuration can be found in `config.ts`.

## Basic Usage

### Simple Text Completion

```typescript
const response = await aiService.complete('Your prompt here');
console.log(response.content);
```

### With Options

```typescript
const response = await aiService.complete('Your prompt', {
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: 'You are a helpful assistant.',
});
```

### Health Analysis

```typescript
const analysis = await aiService.analyzeHealth({
  labResults: { /* lab data */ },
  symptoms: { /* symptoms data */ },
  medications: [ /* medications */ ],
  lifestyle: { /* lifestyle factors */ }
});

console.log(analysis.summary);
console.log(analysis.findings);
console.log(analysis.recommendations);
```

## Provider Management

### Check Provider Status

```typescript
const status = aiService.getProviderStatus();
// Returns: { anthropic: { available: true, healthy: true, lastCheck: Date }, ... }
```

### Force Specific Provider

```typescript
const response = await aiService.complete('prompt', {
  provider: 'openai' // or 'anthropic', 'mock'
});
```

## Caching

Caching is enabled by default. To disable for a specific request:

```typescript
const response = await aiService.complete('prompt', {
  useCache: false
});
```

### Cache Management

```typescript
// Get cache statistics
const stats = aiService.getCacheStats();

// Clear cache
aiService.clearCache();
```

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const response = await aiService.complete('prompt');
} catch (error) {
  if (error instanceof AIServiceError) {
    console.error('AI Service Error:', error.code, error.message);
    console.error('Provider:', error.provider);
  }
}
```

## Health Analysis Features

### Analyze Lab Results

```typescript
import { analyzeLabResults } from '@/lib/ai';

const analysis = await analyzeLabResults({
  cbc: { hemoglobin: { value: 14.5, unit: 'g/dL' } },
  metabolic: { glucose: { value: 95, unit: 'mg/dL' } }
});
```

### Generate Comprehensive Report

```typescript
import { generateHealthReport } from '@/lib/ai';

const report = await generateHealthReport({
  labResults: { /* ... */ },
  symptoms: { /* ... */ },
  medications: [ /* ... */ ],
  lifestyle: { /* ... */ }
});
```

## Advanced Features

### Custom Provider Configuration

```typescript
import { AIService } from '@/lib/ai';

const customService = new AIService({
  providers: {
    anthropic: {
      apiKey: 'your-key',
      defaultModel: 'claude-3-haiku-20240307',
      timeout: 60000,
    }
  },
  cache: {
    ttl: 7200000, // 2 hours
    maxSize: 200
  },
  fallbackProvider: 'mock',
  debug: true
});
```

### Direct Provider Access

```typescript
import { AnthropicProvider } from '@/lib/ai';

const provider = new AnthropicProvider();
const response = await provider.complete('prompt');
```

## Architecture

```
lib/ai/
├── config.ts           # Configuration and constants
├── types.ts            # TypeScript interfaces
├── cache-manager.ts    # Caching implementation
├── ai-service.ts       # Main orchestrator
├── providers/
│   ├── anthropic-provider.ts
│   ├── openai-provider.ts
│   └── mock-provider.ts
└── index.ts           # Singleton export
```

## Testing

The framework includes a mock provider for testing:

```typescript
// In tests, use the mock provider
const response = await aiService.complete('test prompt', {
  provider: 'mock'
});
```

## Best Practices

1. **Use Caching**: Enable caching for repeated queries to reduce API costs
2. **Handle Errors**: Always wrap AI calls in try-catch blocks
3. **Monitor Health**: Check provider status before critical operations
4. **Set Appropriate Models**: Use smaller models for simple tasks
5. **Configure Timeouts**: Adjust timeouts based on your use case

## Troubleshooting

### Provider Not Available

If a provider is not available, check:
1. Environment variables are set correctly
2. API keys are valid
3. Provider health status

### High Latency

1. Check provider health status
2. Consider using a different provider
3. Enable caching for repeated queries
4. Reduce max tokens if appropriate

### Cache Issues

1. Clear cache if stale data is suspected
2. Check cache statistics for debugging
3. Adjust TTL based on your needs