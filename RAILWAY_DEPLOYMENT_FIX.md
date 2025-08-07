# Railway Deployment Fix Guide

## Current Issue
The deployment is failing with: `FATAL: Tenant or user not found`

This indicates that the database connection is not properly configured in Railway.

## Required Actions

### 1. Set Up Railway PostgreSQL Database

If you haven't already created a PostgreSQL database in Railway:

1. Go to your Railway project dashboard
2. Click "New Service" → "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL instance and generate connection credentials

### 2. Configure Environment Variables in Railway

You need to add these environment variables in your Railway project:

#### Required Database Variables:

```bash
# Get these from your Railway PostgreSQL service
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require&connection_limit=10&pool_timeout=30

DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@containers-us-west-XXX.railway.app:5432/railway?sslmode=require
```

**How to get these values:**
1. Click on your PostgreSQL service in Railway
2. Go to the "Variables" tab
3. Copy the `DATABASE_URL` value
4. Add the connection pool settings to DATABASE_URL: `?sslmode=require&connection_limit=10&pool_timeout=30`
5. Create DIRECT_URL by copying the same URL but only with `?sslmode=require`

#### Other Required Variables (keep existing values):

```bash
# Anthropic API Key (keep your existing value)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx...

# Supabase (keep your existing values if still using for auth)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Verify Database Schema

Once the environment variables are set, the deployment should work. However, you may need to run migrations:

1. After successful deployment, you can run migrations via Railway's command interface:
   ```bash
   npx prisma migrate deploy
   ```

2. Or use the existing migration scripts in the database/migrations folder

### 4. Important Notes

- **Connection Limit**: Railway recommends max 10 connections, hence `connection_limit=10`
- **SSL Mode**: Railway requires SSL, hence `sslmode=require`
- **Pool Timeout**: 30 seconds is recommended for connection pooling
- **Direct URL**: Used for migrations, doesn't use connection pooling

## Troubleshooting

If deployment still fails:

1. **Check Railway Logs**: Look for specific error messages
2. **Verify PostgreSQL Service**: Ensure it's running in Railway
3. **Test Connection Locally**: Use the connection string to test from your local machine
4. **Check Prisma Schema**: Ensure it's compatible with your database

## Next Steps After Fix

1. Monitor the deployment in Railway dashboard
2. Check the health endpoint: `https://your-app.up.railway.app/api/health-check`
3. Verify database connectivity: `https://your-app.up.railway.app/api/db-health`
