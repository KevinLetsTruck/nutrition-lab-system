# CRITICAL FIX: Anthropic API Key Format Issue

## 🚨 IMMEDIATE ACTION REQUIRED

### The Problem
The Anthropic API key in Vercel environment variables has the **WRONG FORMAT**:
- **Current (WRONG):** `skantapi03_5HPkngrG...` ❌
- **Should be:** `sk-ant-api03-5HPkngrG...` ✅

The underscores (`_`) must be replaced with dashes (`-`)!

## Fix Instructions

### Option 1: Fix the Existing Key Format
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find `ANTHROPIC_API_KEY`
3. Edit the value to add the missing dashes:
   - Change: `skantapi03_5HPkngrG...`
   - To: `sk-ant-api03-5HPkngrG...`

### Option 2: Use the Working Key
Replace the entire value with the verified working key:
```
sk-ant-api03-GP_ATdQ...
```
(Use the full key that was successfully tested)

### Option 3: Generate a New Key
1. Go to https://console.anthropic.com/settings/keys
2. Generate a new API key
3. Copy the ENTIRE key (including `sk-ant-api03-` prefix)
4. Update in Vercel

## After Updating

1. **Redeploy the Application:**
   - Go to Vercel Dashboard → Deployments
   - Click "Redeploy" on the latest deployment
   - Or push any small change to trigger a new deployment

2. **Verify the Fix:**
   - Check the logs for successful Claude API calls
   - Test the analysis feature

## Key Format Requirements

✅ **CORRECT Format:**
```
sk-ant-api03-[long-string-of-characters]
```

❌ **INCORRECT Formats:**
```
skantapi03_[long-string]     # Missing dashes
sk_ant_api03_[long-string]    # Wrong separator
[long-string]                 # Missing prefix
```

## Why This Matters

Anthropic's API authentication strictly validates the key format:
- Must start with `sk-ant-api03-`
- Dashes are REQUIRED, not optional
- Underscores will cause authentication failure

## Error Symptoms

If you see these errors, it's likely a key format issue:
- "Invalid API key format"
- "Authentication failed"
- 401 Unauthorized responses from Claude API

## Prevention

When setting API keys in environment variables:
1. Always copy the ENTIRE key from Anthropic console
2. Never modify the key format
3. Verify the key starts with `sk-ant-api03-`
4. Test the key before deploying to production