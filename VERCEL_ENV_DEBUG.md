# 🔍 Debugging ANTHROPIC_API_KEY in Vercel

## The Issue
The ANTHROPIC_API_KEY is set in Vercel Dashboard but the app keeps falling back to mock analysis.

## Diagnostic Steps

### 1. Check Environment Diagnostics
Visit: `https://nutrition-lab-system-lets-truck.vercel.app/api/diagnose-env`

This will show:
- Which runtime is being used
- All variations of how the key might be stored
- Whether it's a build-time vs runtime issue

### 2. Test Node.js Runtime
Visit: `https://nutrition-lab-system-lets-truck.vercel.app/api/test-node-runtime`

This endpoint:
- Forces Node.js runtime (instead of Edge)
- Tries to actually use the API key
- Shows if it's a runtime-specific issue

### 3. Common Issues & Solutions

#### Issue: Key added after deployment
**Solution**: Redeploy from Vercel Dashboard
- Go to Vercel Dashboard → Your Project
- Click "Redeploy" on the latest deployment
- Select "Redeploy with existing Build Cache" = NO

#### Issue: Key has extra spaces or special characters
**Solution**: Check in Vercel Dashboard
- Settings → Environment Variables
- Click on ANTHROPIC_API_KEY
- Ensure no leading/trailing spaces
- Should start with `sk-ant-`

#### Issue: Wrong environment selected
**Solution**: Check environment scope
- In Vercel Environment Variables
- Ensure the key is available for "Production"
- Not just "Preview" or "Development"

#### Issue: Edge Runtime limitations
**Solution**: We've now forced Node.js runtime
- The analyze route now uses `export const runtime = 'nodejs'`
- This ensures all env vars are available

## Quick Checklist

1. ✓ Is ANTHROPIC_API_KEY in Vercel Dashboard?
2. ✓ Is it scoped to "Production" environment?
3. ✓ Does it start with `sk-ant-`?
4. ✓ No extra spaces or quotes?
5. ✓ Have you redeployed after adding the key?

## Test After Deployment

Once deployed (2-3 minutes), test in this order:

1. **Check diagnostics**: `/api/diagnose-env`
2. **Test runtime**: `/api/test-node-runtime`
3. **Try analysis**: Click "Run Comprehensive Report"

The analysis should now show **✅ AI Analysis** instead of **⚠️ Mock Analysis**.