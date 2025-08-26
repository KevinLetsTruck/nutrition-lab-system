# Phase 1: Claude Analysis Test Setup

## Prerequisites

1. **Create `.env.local` file in project root** with the following content:

```bash
# Anthropic API Key for Claude AI integration
ANTHROPIC_API_KEY="sk-ant-api03-your-actual-key-here"
```

2. **Get your API key**:
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Sign in or create an account
   - Navigate to API Keys
   - Create a new key
   - Copy the key and replace `sk-ant-api03-your-actual-key-here` in your `.env.local`

## Running the Test

```bash
node scripts/test-claude-analysis.js
```

## What to Expect

The script will:

1. Send mock assessment data to Claude
2. Request a comprehensive functional medicine analysis
3. Display the response
4. Attempt to parse it as JSON

## Success Criteria

Look for:

- Identified health patterns (e.g., HPA axis dysfunction, gut-thyroid connection)
- Specific supplement recommendations with dosing
- Prioritized lab tests
- Phased treatment approach
- Clinical reasoning that makes sense

## Next Steps

- **If successful**: Proceed to Phase 2 (building the actual analysis endpoint)
- **If failed**: Check error messages and API key setup
