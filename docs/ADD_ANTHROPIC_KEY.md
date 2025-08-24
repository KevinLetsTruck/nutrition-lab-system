# Setting up Claude AI for Assessment Analysis

To enable real AI-powered health assessment analysis, you need to add your Anthropic API key.

## Steps:

1. **Get your API key from Anthropic:**
   - Go to https://console.anthropic.com/
   - Create an account or log in
   - Navigate to API Keys
   - Create a new API key

2. **Add to your .env.local file:**
   ```bash
   # Add this line to your .env.local file
   ANTHROPIC_API_KEY=your-actual-api-key-here
   ```

3. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

## What This Enables:

- **Real AI Analysis**: Claude will analyze all assessment responses
- **Body System Scoring**: Accurate scoring for each health system
- **Personalized Recommendations**: Specific lab tests and protocols
- **Pattern Recognition**: Identifies health patterns and root causes
- **Seed Oil Assessment**: Detailed analysis of seed oil damage
- **Protocol Priorities**: Determines urgent vs. maintenance protocols

## Testing:

Once configured, the AI analysis will automatically run when:
1. A client completes an assessment
2. An admin views assessment details
3. You manually trigger analysis for existing assessments

The system has a fallback mechanism, so it will still work without the API key (using mock data), but real AI analysis provides much more valuable insights.
