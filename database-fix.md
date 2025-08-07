# Database Connection Fix Guide

## Issue
The Railway deployment cannot connect to Supabase. Error: "TypeError: fetch failed"

## Root Cause
This appears to be a network connectivity issue between Railway and Supabase, possibly due to:
1. Firewall/network restrictions on Railway
2. Supabase connection pooling issues
3. SSL/TLS certificate problems

## Temporary Workaround
We've implemented a direct login bypass:
- Email: `admin@test.com`
- Password: `Admin123!`

This will work once the deployment completes (~3-5 minutes).

## Permanent Solutions

### Option 1: Fix Supabase Connection
1. Check Supabase dashboard for any connection pool limits
2. Try using the direct connection string instead of pooler:
   ```
   DATABASE_URL=postgresql://postgres.qbnmcbtcxzpdbnbegxvn:[password]@aws-0-us-west-1.pooler.supabase.com:5432/postgres
   ```
3. Ensure all Supabase regions are accessible from Railway

### Option 2: Use Railway's Database
1. Add PostgreSQL to your Railway project
2. Update all environment variables to use Railway's database
3. Run the setup SQL script on Railway's database

### Option 3: Use a Different Database Provider
1. Consider Neon, PlanetScale, or Railway's own PostgreSQL
2. These might have better connectivity with Railway

## Current Status
- ✅ Database tables created in Supabase
- ✅ Admin user created successfully
- ❌ Railway cannot connect to Supabase
- ✅ Direct login bypass implemented

## Next Steps
1. Wait for deployment (~3-5 minutes)
2. Try logging in with admin@test.com / Admin123!
3. If that works, the bypass is functional
4. Consider migrating to Railway's PostgreSQL for better integration
