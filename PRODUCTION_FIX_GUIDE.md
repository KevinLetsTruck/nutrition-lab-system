# Production Fix Guide

## Current Issue
Your production system has lab reports in the database with file paths that don't exist in Supabase Storage, causing 400/500 errors when trying to analyze them.

## Quick Fix Steps

### 1. Set Environment Variables in Vercel
Go to your Vercel dashboard and add:
```
MIGRATION_SECRET = temp-secret-123
```
(You can use any secret value you want)

### 2. Wait for Deployment
After adding the environment variable, Vercel will automatically redeploy. Wait 1-2 minutes.

### 3. Run Production File Check
```bash
MIGRATION_SECRET=temp-secret-123 node scripts/check-production-files.js
```

This script will:
- Connect to your production database
- Check all lab reports
- Verify if their files exist in storage
- **Automatically mark missing files as "failed"**
- Stop them from causing 400 errors

### 4. Verify the Fix
```bash
node scripts/production-check.js
```

## What the Migration Does

The `/api/production-migrate` endpoint will:

1. **Find Problem Reports**:
   - Reports with local file paths (`/Users/...`)
   - Reports with missing files in storage

2. **Fix Them**:
   - Mark as "failed" with explanation
   - Prevent them from causing errors
   - Allow valid reports to work normally

## Expected Results

Before migration:
- ❌ 400/500 errors when analyzing certain reports
- ❌ "Failed to retrieve file from storage" errors

After migration:
- ✅ Invalid reports marked as "failed"
- ✅ Valid reports analyze successfully
- ✅ No more 400 errors from missing files

## Manual Alternative

If you can't run the scripts, you can manually check in Supabase:

1. Go to Supabase Dashboard → Table Editor → lab_reports
2. Look for reports with status "pending" or "processing"
3. Check their file_path values
4. If the path starts with `/Users/` or the file doesn't exist in Storage:
   - Update status to "failed"
   - Add note: "File missing from storage"

## Testing After Fix

Test that analysis works for valid files:
```bash
curl -X POST https://nutrition-lab-system.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"labReportId": "ae1e8ebc-2bc9-4d11-a459-614d299e8dd2"}'
```

This should return a successful analysis (this file exists in storage). 