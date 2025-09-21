# AI Performance Settings for Assessment

## Current Optimizations (Implemented)

### 1. **Faster AI Model**
- Switched from Claude 3.5 Sonnet to Claude 3 Haiku
- **Speed improvement**: 5-10x faster (from 7-11s to 1-2s expected)
- Maintains good clinical decision quality

### 2. **Smart AI Usage**
- AI only activates at key decision points:
  - Every 10 questions
  - When high severity symptoms detected (4-5 on scale)
  - When multiple concerning patterns emerge
- Other questions use fast linear progression

### 3. **Response Caching**
- AI decisions are cached to avoid repeated API calls
- Same patterns get instant responses

### 4. **Optimized Prompts**
- Reduced prompt size by 80%
- Focused on essential clinical data only
- Faster processing and response generation

### 5. **Database Query Optimization**
- Only fetch last 20 responses instead of all
- Reduces database load and query time

## Expected Performance

- **AI-powered questions**: 1-2 seconds (down from 7-11s)
- **Linear questions**: < 500ms
- **Overall experience**: 70-80% faster

## Disable AI for Maximum Speed

To completely disable AI and use linear progression only:

1. Remove your `ANTHROPIC_API_KEY` from `.env`
2. OR set `DISABLE_ASSESSMENT_AI=true` in `.env`

This gives instant responses but loses intelligent question selection.

## Monitor Performance

Watch your server logs for timing information:
```
AI selected question: SCR012 - Reasoning: ... (1523ms)
```

## Future Optimizations

1. **Precompute common paths** - Cache entire question sequences
2. **Background processing** - Load next question while user answers
3. **Batch decisions** - Get next 3-5 questions at once
4. **Progressive enhancement** - Show question immediately, update with AI decision
