# AI Assessment Engine

## Overview

The AI Assessment Engine uses Claude (Anthropic's AI) to create an intelligent, adaptive health assessment system. It dynamically selects questions based on previous responses, identifies health patterns, and generates comprehensive analysis.

## Key Features

### 1. Adaptive Question Selection

- AI analyzes previous responses to select the most clinically relevant next question
- Avoids redundancy by not asking questions already implied by previous answers
- Prioritizes questions that reveal the most about the client's health
- Special focus on seed oil exposure when inflammatory patterns emerge

### 2. Intelligent Module Activation

- Analyzes screening responses to determine which body systems need investigation
- Skips irrelevant modules to reduce assessment burden
- Activates modules based on symptom clustering
- Considers seed oil exposure impact on multiple systems

### 3. Comprehensive Health Scoring

- Overall health score (0-100) with weighted categories
- Individual node scores for each functional medicine system
- Seed oil assessment with exposure, damage, and recovery metrics
- Risk stratification (LOW/MODERATE/HIGH/CRITICAL)
- Identifies hidden patterns and subclinical issues

### 4. Lab Test Recommendations

- Suggests essential, recommended, and optional lab tests
- Provides clinical reasoning for each recommendation
- Predicts expected findings based on symptoms
- Includes specialized seed oil damage markers when relevant

## Architecture

```
/lib/ai/
├── assessment-ai.ts      # Core AI service with Claude integration
├── prompts.ts           # Reusable prompt templates
└── README.md           # This file

/lib/assessment/
├── assessment-service.ts # Main orchestration service
├── types.ts            # TypeScript types
├── modules.ts          # Module definitions
└── questions/          # Question bank
```

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```bash
ANTHROPIC_API_KEY=your-claude-api-key-here
```

### 2. Install Dependencies

The Anthropic SDK is already included in package.json:

```bash
npm install
```

### 3. Database Setup

Ensure your Prisma schema includes the required models:

- ClientAssessment
- ClientResponse
- AssessmentAnalysis
- AssessmentTemplate

## Usage

### Starting an Assessment

```typescript
import { assessmentService } from "@/lib/assessment/assessment-service";

// Start assessment for a client
const assessmentId = await assessmentService.startAssessment(clientId);
```

### Getting Next Question

```typescript
// AI will select the most relevant question
const question = await assessmentService.getNextQuestion(assessmentId);
```

### Saving Responses

```typescript
await assessmentService.saveResponse(assessmentId, questionId, {
  value: 3,
  text: "Often experience fatigue",
  confidence: 0.8,
});
```

### Completing Assessment

```typescript
// Triggers AI analysis and scoring
await assessmentService.completeAssessment(assessmentId);
```

## AI Decision Process

### Question Selection Logic

1. **Context Building**: Analyzes all previous responses
2. **Pattern Recognition**: Identifies emerging health patterns
3. **Clinical Reasoning**: Applies functional medicine principles
4. **Priority Weighting**: Considers urgency and diagnostic value
5. **Fallback Safety**: Always returns a valid question

### Module Activation Criteria

The AI considers:

- **Symptom Clusters**: Multiple related symptoms
- **Seed Oil Impact**: High exposure activates ENERGY and DEFENSE_REPAIR
- **Red Flags**: Urgent symptoms requiring investigation
- **Efficiency**: Skip modules with no relevant symptoms

### Scoring Algorithm

1. **Overall Score** (0-100):

   - Energy/Fatigue: 25%
   - Digestive Function: 20%
   - Inflammation/Immune: 20%
   - Hormonal Balance: 15%
   - Detox Capacity: 10%
   - Structural: 10%

2. **Node Scores**: Individual system health (0-100 each)

3. **Seed Oil Assessment**:
   - Exposure Level (0-10)
   - Damage Indicators (0-10)
   - Recovery Potential (0-10)
   - Priority Level

## Red Flag Detection

The system automatically flags high-risk responses:

```typescript
// Example red flags
'SCR001': { threshold: 2, message: 'Severe fatigue reported' }
'SCR_SO01': { threshold: 4, message: 'Daily fried food consumption' }
```

## Testing

Run the test script:

```bash
npx tsx scripts/test-assessment-ai.ts
```

This will test:

1. AI question selection
2. Module activation analysis
3. Prompt template loading

## Best Practices

1. **Error Handling**: AI has built-in fallbacks for all operations
2. **Audit Trail**: All AI decisions are logged with reasoning
3. **Temperature Settings**: Lower (0.3) for clinical consistency
4. **Token Limits**: Optimized for comprehensive yet efficient analysis
5. **Response Parsing**: Robust JSON extraction from AI responses

## Troubleshooting

### Common Issues

1. **No API Key**: Set ANTHROPIC_API_KEY in environment
2. **Rate Limits**: Implement retry logic for production
3. **Database Errors**: Ensure Prisma client is generated
4. **Type Errors**: Run `npm run check-types`

### Debug Mode

Enable detailed logging:

```typescript
console.log("AI Context:", await assessment.aiContext);
console.log("AI Reasoning:", analysis.aiSummary);
```

## Future Enhancements

1. **Multi-language Support**: Translate questions dynamically
2. **Voice Integration**: Convert responses to speech
3. **Real-time Collaboration**: Practitioner can guide AI
4. **Learning System**: Improve based on outcomes
5. **Integration APIs**: Connect with lab systems

## Security Considerations

1. **API Key**: Never expose in client code
2. **PHI Protection**: AI prompts sanitize personal data
3. **Audit Logging**: Track all AI decisions
4. **Rate Limiting**: Prevent abuse
5. **Fallback Logic**: System works without AI if needed
