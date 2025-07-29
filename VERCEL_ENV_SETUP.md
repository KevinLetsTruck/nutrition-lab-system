# Vercel Environment Variables Setup Guide

## Required Environment Variables

You must set these environment variables in your Vercel dashboard:

### 1. Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Claude AI Configuration
```bash
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Migration Secret (Optional but recommended)
```bash
MIGRATION_SECRET=your-secret-migration-key
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel Dashboard
2. Select your project (nutrition-lab-system)
3. Navigate to "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add each variable:
   - Name: Enter the variable name exactly as shown above
   - Value: Enter your actual values
   - Environment: Select "Production", "Preview", and "Development"
   - Click "Save"

## Verify Environment Variables

After setting up, verify they're working:

1. **Check deployment logs**: Look for any missing environment variable errors
2. **Use the test endpoint**: Visit `https://your-app.vercel.app/api/test-storage`
3. **Check function logs**: In Vercel dashboard → Functions tab → View logs

## Common Issues and Solutions

### Issue 1: "Unknown error" or 400 errors
- **Cause**: Missing SUPABASE_SERVICE_ROLE_KEY
- **Solution**: Ensure the service role key is set correctly (not the anon key)

### Issue 2: "Failed to retrieve file from storage"
- **Cause**: Files in database don't exist in storage
- **Solution**: Run the production migration check:
  ```bash
  MIGRATION_SECRET=your-secret node scripts/check-production-files.js
  ```

### Issue 3: "Unauthorized" errors
- **Cause**: Missing or incorrect API keys
- **Solution**: Double-check all keys are copied correctly without extra spaces

### Issue 4: Storage policies blocking access
- **Cause**: Supabase Storage RLS policies not configured
- **Solution**: Add policies in Supabase Dashboard:
  ```sql
  -- For each bucket (lab-files, cgm-images, etc.)
  CREATE POLICY "Service role full access" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'lab-files');
  ```

## Testing Your Setup

1. **Test storage access**:
   ```bash
   curl https://your-app.vercel.app/api/test-storage
   ```

2. **Test health endpoint**:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Check production files** (after deploying):
   ```bash
   MIGRATION_SECRET=your-secret node scripts/check-production-files.js
   ```

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Latest code deployed (check commit hash)
- [ ] Storage buckets exist in Supabase
- [ ] Service role key has proper permissions
- [ ] Test endpoints return successful responses
- [ ] No 400/500 errors in Vercel function logs

## Need Help?

1. Check Vercel function logs for detailed errors
2. Run `node scripts/production-check.js` for comprehensive testing
3. Verify all files exist in Supabase Storage using the dashboard 