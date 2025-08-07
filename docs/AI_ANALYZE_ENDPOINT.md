# AI-Enhanced Analyze Endpoint

## Overview
The `/api/analyze` endpoint now supports AI-powered analysis using our unified AI service framework with intelligent provider fallback and caching.

## Endpoint
```
POST /api/analyze
```

## Request Types

### 1. Health Analysis
Analyze health data using AI to provide findings, recommendations, and risk factors.

```json
{
  "type": "health",
  "data": {
    // Any health-related data
    "vitals": { ... },
    "symptoms": [ ... ],
    "medications": [ ... ],
    "labResults": { ... }
  },
  "provider": "anthropic", // Optional: preferred provider
  "useCache": true // Optional: defaults to true
}
```

**Response:**
```json
{
  "success": true,
  "type": "health",
  "analysis": {
    "summary": "Overall health assessment",
    "findings": [
      {
        "category": "string",
        "description": "string",
        "severity": "low | medium | high",
        "value": "string | number",
        "reference": "string"
      }
    ],
    "recommendations": [
      {
        "priority": "low | medium | high",
        "category": "string",
        "description": "string",
        "timeframe": "string",
        "resources": []
      }
    ],
    "riskFactors": [
      {
        "name": "string",
        "level": "low | moderate | high | critical",
        "description": "string",
        "mitigationStrategies": []
      }
    ],
    "confidence": 85,
    "metadata": { ... }
  },
  "processingTime": 1234,
  "cached": false
}
```

### 2. General AI Prompt
Send any prompt to the AI for completion.

```json
{
  "prompt": "Your question or prompt here",
  "provider": "anthropic", // Optional: preferred provider
  "useCache": true, // Optional: defaults to true
  "temperature": 0.7, // Optional
  "maxTokens": 500, // Optional
  "systemPrompt": "Optional system context"
}
```

**Response:**
```json
{
  "success": true,
  "type": "completion",
  "response": {
    "content": "AI response content",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "cached": false,
    "usage": {
      "promptTokens": 100,
      "completionTokens": 200,
      "totalTokens": 300
    },
    "latency": 1234
  },
  "processingTime": 1250
}
```

### 3. File-Based Lab Report Analysis (Existing)
The endpoint maintains backward compatibility for file-based lab report analysis.

## Features

### 🚀 Provider Fallback
- Automatically tries providers in order: Anthropic → OpenAI → Mock
- Ensures service availability even if primary provider fails
- Transparent to the client - always returns a response

### 💾 Intelligent Caching
- Enabled by default (set `useCache: false` to disable)
- Caches identical requests to improve performance
- Cached responses return instantly (0ms processing time)
- Cache hit indicator in response

### 🛡️ Error Handling
- Returns 503 status if all AI providers fail
- Detailed error messages for debugging
- Graceful degradation to mock provider

### 📊 Performance Tracking
- Processing time included in all responses
- Provider usage tracked in metrics
- Latency information for monitoring

## Error Responses

### Service Unavailable (503)
When all AI providers are down:
```json
{
  "error": "AI service unavailable",
  "message": "All AI providers are currently unavailable. Please try again later.",
  "details": "All providers failed: [error details]",
  "type": "SERVICE_UNAVAILABLE"
}
```

### General Error (500)
For other processing errors:
```json
{
  "error": "AI analysis failed",
  "message": "An error occurred during analysis. Please check your input and try again.",
  "details": "[specific error message]",
  "processingTime": 1234
}
```

## Usage Examples

### Health Analysis
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "type": "health",
    "data": {
      "vitals": {
        "bloodPressure": { "systolic": 120, "diastolic": 80 },
        "heartRate": 72
      }
    }
  }'
```

### General Prompt
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the benefits of omega-3 fatty acids?",
    "maxTokens": 300
  }'
```

### Disable Caching
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Current time-sensitive information",
    "useCache": false
  }'
```

## Benefits

1. **Unified Interface**: Single endpoint for all AI analysis needs
2. **High Availability**: Automatic fallback ensures service continuity
3. **Performance**: Caching reduces latency for repeated queries
4. **Flexibility**: Supports both structured health analysis and free-form prompts
5. **Monitoring**: Built-in metrics and health tracking
6. **Cost Efficient**: Caching reduces API calls to paid providers