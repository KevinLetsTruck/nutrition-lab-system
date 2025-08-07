# AI Service Health Monitoring

## Overview
The AI Service Health endpoint provides real-time monitoring of the AI service status, provider health, and performance metrics.

## Endpoint
```
GET /api/ai/health
```

## Response Format

### Successful Response (200 OK)
```json
{
  "status": "operational" | "degraded" | "down",
  "message": "Status description",
  "timestamp": "ISO 8601 timestamp",
  "checkDuration": 123,
  "service": {
    "name": "AI Service",
    "version": "1.0.0",
    "uptime": {
      "milliseconds": 123456,
      "hours": 0.03,
      "startTime": "ISO 8601 timestamp"
    }
  },
  "providers": {
    "total": 2,
    "healthy": 2,
    "details": [
      {
        "name": "anthropic",
        "healthy": true,
        "lastCheck": "ISO 8601 timestamp",
        "responseTime": 555
      }
    ]
  },
  "metrics": {
    "requests": {
      "total": 100,
      "successful": 95,
      "failed": 5,
      "successRate": "95.00%"
    },
    "cache": {
      "hits": 30,
      "hitRate": "30.00%"
    },
    "performance": {
      "averageLatencyMs": 2330,
      "averageLatency": "2.33s"
    },
    "providerUsage": {
      "anthropic": 60,
      "openai": 20,
      "mock": 15
    }
  },
  "alerts": []
}
```

## Status Codes

- **200 OK**: All providers operational
- **207 Multi-Status**: Service degraded (some providers down)
- **503 Service Unavailable**: All providers down
- **500 Internal Server Error**: Health check failed

## Custom Headers

- `X-Health-Status`: Current status (operational/degraded/down/error)
- `Cache-Control`: Always set to `no-cache, no-store, must-revalidate`

## Status Definitions

### Operational
- All configured AI providers are responding
- Service is fully functional

### Degraded
- At least one provider is down
- Service can still handle requests via fallback providers
- Alert generated with affected providers

### Down
- No providers are responding
- Service cannot handle requests
- Critical alert generated

## Alerts

Alerts are included when certain conditions are met:

1. **Provider Failure** (Warning)
   - When some providers are not responding
   - Lists affected providers

2. **High Failure Rate** (Warning)
   - When failure rate exceeds 10%
   - Includes last error message

3. **High Latency** (Warning)
   - When average response time exceeds 5 seconds
   - Includes current average latency

4. **All Providers Down** (Critical)
   - When no providers are operational
   - Suggests checking API keys

## Usage Examples

### Basic Health Check
```bash
curl http://localhost:3000/api/ai/health
```

### Check Status Header Only
```bash
curl -I http://localhost:3000/api/ai/health | grep X-Health-Status
```

### Monitor with Watch
```bash
watch -n 30 'curl -s http://localhost:3000/api/ai/health | jq .status'
```

### Integration with Monitoring Systems

#### Prometheus/Grafana
```bash
# Extract metrics for Prometheus
curl -s http://localhost:3000/api/ai/health | jq '{
  ai_service_up: (if .status == "operational" then 1 else 0 end),
  ai_providers_healthy: .providers.healthy,
  ai_providers_total: .providers.total,
  ai_requests_total: .metrics.requests.total,
  ai_requests_failed: .metrics.requests.failed,
  ai_cache_hit_rate: (.metrics.cache.hitRate | rtrimstr("%") | tonumber),
  ai_average_latency_ms: .metrics.performance.averageLatencyMs
}'
```

#### Uptime Monitoring
Use the endpoint directly with services like:
- Uptime Robot
- Pingdom
- New Relic
- DataDog

Check for `status` field = "operational" and HTTP status 200.

## Best Practices

1. **Poll Frequency**: Check every 30-60 seconds for monitoring
2. **Alerting**: Set up alerts for "degraded" or "down" status
3. **Dashboard**: Display key metrics on operational dashboards
4. **SLA Monitoring**: Track uptime percentage over time
5. **Trend Analysis**: Monitor latency and failure rate trends