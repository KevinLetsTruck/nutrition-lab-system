# Claude AI API Setup Instructions

## Quick Start

To enable Claude AI for intelligent assessment question selection, you need to add your Anthropic API key to the project.

### Step 1: Get Your API Key
1. Sign up or log in at [console.anthropic.com](https://console.anthropic.com)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-ant-api03-`)

### Step 2: Add to Your Environment
Add the following line to your `.env.local` file:

```
ANTHROPIC_API_KEY="sk-ant-api03-your-actual-key-here"
```

### Step 3: Verify Setup
Run the test to confirm Claude AI is working:

```bash
npm run test:claude
```

If successful, you'll see Claude analyze a test scenario and select the most relevant question.

## What Claude AI Does

When enabled, Claude AI:
- Analyzes user responses in real-time
- Identifies symptom patterns and severity
- Selects the most diagnostically valuable next question
- Skips redundant questions intelligently
- Saves users 30-50% of assessment time

## Example Decision

**User Context:**
- Severe fatigue (8/10)
- Brain fog
- Daily fried food consumption

**Claude's Decision:**
- **Selected**: "Do you crash after meals?"
- **Reasoning**: High fatigue + daily fried foods suggests metabolic dysfunction
- **Skipped**: Basic sleep questions (already know severity is high)
- **Result**: 2 questions saved

## Cost Estimate
- **Per Question**: ~$0.003
- **Per Assessment**: ~$0.30-0.50
- **Monthly (1000 assessments)**: ~$300-500

## Fallback Protection
If Claude API is unavailable:
- System automatically uses fallback algorithm
- Assessment continues without interruption
- Still saves some questions based on severity

## Security Note
- Never commit your API key to version control
- Keep `.env.local` in your `.gitignore`
- Rotate keys periodically for security
