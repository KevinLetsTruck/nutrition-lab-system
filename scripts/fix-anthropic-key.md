# Quick Fix: Anthropic API Key

## The Problem
Your Anthropic API key in Vercel has the wrong format:
- ❌ Current: `skantapi03_5HPkngrG...` (underscores)
- ✅ Should be: `sk-ant-api03-5HPkngrG...` (dashes)

## Quick Fix Steps

1. **Log into Vercel**
   ```
   https://vercel.com/dashboard
   ```

2. **Navigate to Environment Variables**
   - Select your project
   - Go to Settings → Environment Variables

3. **Edit ANTHROPIC_API_KEY**
   - Find the ANTHROPIC_API_KEY variable
   - Click Edit (pencil icon)
   - Replace the value with one of these options:
   
   **Option A - Fix the format:**
   ```
   sk-ant-api03-5HPkngrG[rest-of-your-key]
   ```
   
   **Option B - Use the working key:**
   ```
   sk-ant-api03-GP_ATdQ[rest-of-the-working-key]
   ```

4. **Save and Redeploy**
   - Click Save
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

## Verify the Fix

Check the logs for successful Claude API calls:
- No more "Invalid API key format" errors
- Analysis features working properly

## Remember
- Anthropic keys MUST start with `sk-ant-api03-`
- Use dashes (-), not underscores (_)
- Copy keys directly from Anthropic console