# Railway PostgreSQL Setup Guide

## Overview

This guide covers the complete setup and optimization of PostgreSQL on Railway for the Nutrition Lab System.

## Connection String Configuration

Railway PostgreSQL requires specific connection parameters for optimal performance:

```
postgresql://[user]:[password]@[host]:[port]/[database]?sslmode=require&pgbouncer=true&connection_limit=10&pool_timeout=30&connect_timeout=30&statement_timeout=30000
```

### Required Parameters

- `sslmode=require` - Railway requires SSL connections
- `pgbouncer=true` - Enable connection pooling
- `connection_limit=10` - Railway's recommended limit
- `pool_timeout=30` - Connection pool timeout in seconds
- `connect_timeout=30` - Connection timeout in seconds
- `statement_timeout=30000` - Statement timeout in milliseconds (30s)

## Environment Variables

Set these in Railway's Variables tab:

```bash
DATABASE_URL=postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway?sslmode=require&pgbouncer=true&connection_limit=10&pool_timeout=30
DIRECT_URL=postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway?sslmode=require
```

## Prisma Configuration

Our Prisma client (`src/lib/prisma.ts`) includes:

1. **Automatic URL optimization** - Adds missing connection parameters
2. **Retry logic** - Handles transient connection failures
3. **Connection pooling** - Manages connections efficiently
4. **Health monitoring** - Tracks connection status

## Testing Connection

### 1. Local Testing

```bash
# Test connection from local machine
npm run test:db-connection

# Or directly
node scripts/test-railway-connection.js
```

### 2. Railway Shell Testing

```bash
# In Railway shell
railway shell

# Test with psql
psql $DATABASE_URL -c "SELECT 1;"

# Test with Prisma
npx prisma db push --skip-generate
```

### 3. API Health Check

```bash
# Basic health check
curl https://your-app.railway.app/api/db-health

# Full connection test
curl https://your-app.railway.app/api/db-health?action=full-test

# Check for connection leaks
curl https://your-app.railway.app/api/db-health?action=leak-check
```

## Common Issues and Solutions

### 1. "Tenant or user not found"

**Cause**: DATABASE_URL not available during build
**Solution**: Add to railway.toml:

```toml
[build.env]
DATABASE_URL = { variable = "DATABASE_URL" }
DIRECT_URL = { variable = "DIRECT_URL" }
```

### 2. Connection Timeouts

**Cause**: Cold starts or network issues
**Solution**: Our Prisma client includes automatic retry logic with exponential backoff

### 3. Too Many Connections

**Cause**: Connection leaks or improper pooling
**Solution**: 
- Use singleton pattern (already implemented)
- Set `connection_limit=10`
- Monitor with `/api/db-health?action=leak-check`

### 4. SSL Connection Required

**Cause**: Railway requires SSL
**Solution**: Always include `sslmode=require` in connection string

## Performance Optimization

### 1. Connection Pooling

- Railway recommends max 10 connections
- Our setup uses pgbouncer for efficient pooling
- Connections are reused across requests

### 2. Query Performance

- Use indexes for frequently queried fields
- Limit result sets with `take` parameter
- Use `select` to fetch only needed fields

### 3. Cold Start Mitigation

- Prisma client warms up on first use
- Health checks keep connections alive
- Retry logic handles initial failures

## Monitoring

### Database Health Middleware

Automatically monitors database health on all requests:

- Checks connection every 30 seconds
- Returns 503 status if unhealthy
- Logs connection issues
- Tracks consecutive failures

### Manual Health Checks

```typescript
// Check database health
const health = await checkDatabaseHealth()

// Get connection status
const status = enhancedPrisma.getConnectionStatus()

// Force reconnection
await prisma.$disconnect()
await prisma.$connect()
```

## Migration Management

### Development

```bash
# Create migration
npx prisma migrate dev --name your_migration_name

# Reset database
npx prisma migrate reset
```

### Production (Railway)

```bash
# Run migrations
railway run npx prisma migrate deploy

# Or in Railway shell
railway shell
npx prisma migrate deploy
```

## Troubleshooting Commands

```bash
# Check current schema
npx prisma db pull

# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Generate client
npx prisma generate
```

## Best Practices

1. **Always use transactions** for related operations
2. **Handle errors gracefully** with proper logging
3. **Use connection pooling** (already configured)
4. **Monitor health regularly** via API endpoints
5. **Test locally first** before deploying
6. **Keep migrations small** and reversible

## Security

1. Never commit DATABASE_URL to git
2. Use Railway's environment variables
3. Rotate credentials periodically
4. Monitor for suspicious queries
5. Use prepared statements (Prisma does this automatically)

## Support

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Prisma Docs: https://www.prisma.io/docs
