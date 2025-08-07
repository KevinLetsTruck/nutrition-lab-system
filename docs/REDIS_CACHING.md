# Redis Caching for AI Service

The AI Service now supports both Redis (persistent) and in-memory caching. Redis provides cache persistence across server restarts and can be shared across multiple instances.

## Configuration

### Environment Variables

To enable Redis caching, set one of these environment variables:

```bash
# Option 1: Standard Redis URL
REDIS_URL=redis://localhost:6379

# Option 2: Connection string (alternative name)
REDIS_CONNECTION_STRING=redis://localhost:6379

# For Redis with authentication:
REDIS_URL=redis://:password@hostname:6379

# For Redis with TLS/SSL:
REDIS_URL=rediss://hostname:6380
```

### Automatic Fallback

If no Redis URL is provided, the cache manager automatically falls back to in-memory caching. This ensures the application works in all environments without requiring Redis.

## Features

### 1. **Persistent Caching**
When Redis is configured, AI responses are cached persistently:
- Survives application restarts
- Shared across multiple instances
- Reduces API costs by reusing responses

### 2. **TTL Support**
Both Redis and in-memory caches support Time-To-Live (TTL):
- Default TTL: 1 hour for general responses
- Health analysis: 2 hours
- Custom TTL can be set per cache entry

### 3. **Error Resilience**
The Redis implementation includes:
- Automatic reconnection on connection loss
- Graceful fallback to in-memory if Redis fails
- Non-blocking cache operations (failures don't break the app)

### 4. **Same Interface**
The cache manager maintains the same interface regardless of storage backend:

```typescript
// Works with both Redis and in-memory
const cache = new CacheManager(ttlInMs);

// All methods are async and work identically
await cache.set(key, value, customTtl?);
await cache.get(key);
await cache.has(key);
await cache.delete(key);
await cache.clear();
await cache.size();
await cache.getStats();
```

## Testing

### Check Current Cache Type

To verify which cache type is being used:

```bash
# Run the cache test script
npx tsx scripts/test-redis-cache.ts
```

### API Health Endpoint

The `/api/ai/health` endpoint shows cache statistics including the type:

```bash
curl http://localhost:3000/api/ai/health | jq '.cache'
```

## Production Setup

### Railway

Add Redis to your Railway project:

1. Add Redis service from Railway dashboard
2. Copy the `REDIS_URL` from the Redis service
3. Add it to your app's environment variables

### Vercel

Use Upstash Redis or similar:

1. Create Upstash Redis instance
2. Copy the Redis URL
3. Add as `REDIS_URL` in Vercel environment variables

### Local Development

For local development with Redis:

```bash
# Install Redis locally
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:alpine
```

## Cache Key Patterns

The cache uses MD5 hashing for keys with these prefixes:
- `ai:cache:` - For all AI-related cache entries

This allows easy identification and management of AI cache entries in Redis.

## Monitoring

### Redis CLI

When using Redis, you can monitor cache usage:

```bash
# Connect to Redis
redis-cli

# See all AI cache keys
KEYS ai:cache:*

# Get cache size
DBSIZE

# Monitor real-time commands
MONITOR
```

### Application Logs

The cache manager logs important events:
- Redis connection status
- Fallback to in-memory when Redis fails
- Cache hit rates (when debug mode is enabled)

## Performance Impact

### With Redis
- Initial connection: ~100-500ms
- Cache operations: 1-5ms
- Network latency dependent

### With In-Memory
- No connection overhead
- Cache operations: <1ms
- Limited by available memory

## Best Practices

1. **Set appropriate TTLs** - Balance between freshness and cost savings
2. **Monitor memory usage** - Especially important for in-memory caching
3. **Use Redis in production** - For persistence and scalability
4. **Enable debug logs** - To monitor cache hit rates
5. **Regular cache clearing** - Implement cache invalidation strategies

## Troubleshooting

### Redis Connection Failed

```
[CacheManager] Redis connection error: ECONNREFUSED
[CacheManager] Falling back to in-memory cache
```

**Solution**: Verify Redis is running and the URL is correct.

### High Memory Usage (In-Memory)

**Solution**: Reduce TTL or implement cache size limits.

### Low Cache Hit Rate

**Solution**: Ensure consistent prompt formatting and appropriate TTL values.