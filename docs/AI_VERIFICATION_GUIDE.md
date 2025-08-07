# AI Framework Verification Guide

This guide explains how to verify that the AI framework is working correctly, both locally and after deployment.

## Available Verification Scripts

### 1. Framework Verification (`ai:verify`)

Tests the AI framework components directly:

```bash
npm run ai:verify
# or
npx tsx scripts/verify-ai-framework.ts
```

**What it tests:**
- Provider connections
- Cache functionality (set/get/clear)
- Fallback mechanisms
- Response times
- Health analysis capability
- Metrics collection
- Cache backend (Redis vs in-memory)

**When to use:**
- After initial setup
- When changing AI configuration
- To debug provider issues

### 2. Deployment Verification (`ai:verify:deployment`)

Tests the deployed AI service via API endpoints:

```bash
npm run ai:verify:deployment
# or
npx tsx scripts/verify-ai-deployment.ts

# For production deployment
API_URL=https://your-app.com npm run ai:verify:deployment
```

**What it tests:**
- Health endpoint availability
- Basic completion requests
- Cache functionality via API
- Health analysis endpoint
- Provider fallback behavior
- Concurrent request handling
- Error handling

**When to use:**
- After deployment to staging/production
- During CI/CD pipeline
- To verify live system health

## Understanding Test Results

### Successful Verification

```
🏁 Overall Status:
   ✅ ALL SYSTEMS OPERATIONAL
   The AI framework is ready for production use.
```

All core components are working correctly.

### Partial Success

```
🏁 Overall Status:
   ⚠️  PARTIALLY OPERATIONAL
   Some features may be limited. Check failed tests above.
```

The system works but some features are unavailable (e.g., no Redis).

### Critical Issues

```
🏁 Overall Status:
   ❌ CRITICAL ISSUES DETECTED
   The AI framework has significant problems.
```

Major components are failing - check configuration.

## Common Issues and Solutions

### No AI Providers Available

**Symptom:**
```
⚠️  No healthy AI providers detected
```

**Solution:**
1. Check environment variables:
   ```bash
   echo $ANTHROPIC_API_KEY
   echo $OPENAI_API_KEY
   ```

2. Ensure keys are valid and start with correct prefix:
   - Anthropic: `sk-ant-...`
   - OpenAI: `sk-...`

### Cache Not Persisting

**Symptom:**
```
ℹ️  Using in-memory cache (Redis not configured)
```

**Solution:**
1. Set Redis URL:
   ```bash
   export REDIS_URL=redis://localhost:6379
   ```

2. Ensure Redis is running:
   ```bash
   redis-cli ping
   ```

### Slow Response Times

**Symptom:**
```
⚠️  Slow providers detected: anthropic
```

**Solution:**
1. Check network connectivity
2. Verify API rate limits aren't exceeded
3. Consider using cache more aggressively

### Health Analysis Failing

**Symptom:**
```
❌ Health Analysis
   Invalid health analysis response
```

**Solution:**
1. Check API endpoint is correctly configured
2. Verify the request format matches expected structure
3. Check logs for detailed error messages

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Verify AI Deployment
  run: |
    API_URL=${{ secrets.PRODUCTION_URL }} npm run ai:verify:deployment
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Railway Deployment

```bash
# In Railway deployment script
railway run npm run ai:verify:deployment
```

### Vercel Post-Deploy

Add to `vercel.json`:
```json
{
  "functions": {
    "api/ai/health.ts": {
      "maxDuration": 10
    }
  },
  "github": {
    "silent": true,
    "autoJobCancelation": false
  }
}
```

## Monitoring Recommendations

### Regular Health Checks

Set up monitoring to check the health endpoint:

```bash
# Cron job example
*/5 * * * * curl -f https://your-app.com/api/ai/health || alert-team
```

### Metrics Tracking

Use the cost tracker to monitor usage:

```bash
npm run ai:costs
```

### Performance Baselines

Expected performance metrics:
- Health check: < 1s
- Cached response: < 100ms
- Basic completion: < 3s
- Health analysis: < 5s
- Concurrent handling: 5+ requests

## Troubleshooting Checklist

1. **Environment Variables Set?**
   - [ ] ANTHROPIC_API_KEY
   - [ ] OPENAI_API_KEY (optional)
   - [ ] REDIS_URL (optional)

2. **Services Running?**
   - [ ] Next.js server
   - [ ] Redis (if configured)
   - [ ] Network connectivity

3. **API Keys Valid?**
   - [ ] Correct format
   - [ ] Not expired
   - [ ] Sufficient credits

4. **Logs Clean?**
   - [ ] No error messages
   - [ ] No rate limit warnings
   - [ ] No connection timeouts

## Quick Verification Commands

```bash
# Full system check
npm run ai:verify && npm run ai:verify:deployment

# Check specific provider
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "provider": "anthropic"}'

# Check cache
curl http://localhost:3000/api/ai/health | jq '.cache'

# Force cache clear
curl -X POST http://localhost:3000/api/ai/cache/clear
```