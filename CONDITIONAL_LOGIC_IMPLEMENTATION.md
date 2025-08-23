# Conditional Logic Implementation

## Overview

Implemented conditional logic in the assessment system to skip irrelevant questions based on previous answers. This creates a more personalized and efficient assessment experience.

## Example: DOT Medical Certification

The first implementation focuses on truck driver-specific questions:

### Question Flow

1. **SCR067**: "Are you a commercial driver requiring DOT medical certification?"
   - If "Yes" → Continue to ask DOT-related questions
   - If "No" → Skip all DOT-related questions (SCR068, SCR069, SCR070)
   - If "Unsure" → Continue to ask DOT-related questions

### Skipped Questions When "No"

- **SCR068**: "How many hours do you typically drive per day?"
- **SCR069**: "Do you snore or have you been told you stop breathing during sleep?"
- **SCR070**: "How often do you eat at truck stops or fast food?"

## Technical Implementation

### 1. Type Definition

Added `ConditionalLogic` interface to `lib/assessment/types.ts`:

```typescript
export interface ConditionalLogic {
  condition: string | number; // The response value that triggers this logic
  action: "skip" | "trigger" | "require";
  skipQuestions?: string[]; // Question IDs to skip
  triggerQuestions?: string[]; // Question IDs to trigger
  requiredQuestions?: string[]; // Question IDs that become required
}
```

### 2. Question Configuration

Added conditional logic to SCR067:

```typescript
conditionalLogic: [
  {
    condition: "no",
    action: "skip",
    skipQuestions: ["SCR068", "SCR069", "SCR070"],
  },
],
```

### 3. AI Engine Update

Updated `lib/ai/assessment-ai.ts` to filter questions based on conditional logic:

- Checks all previous responses for conditional logic rules
- Removes questions from the available pool if they should be skipped
- Works alongside existing gender-based filtering

## Benefits

1. **Improved User Experience**: Users don't answer irrelevant questions
2. **Faster Assessments**: Fewer questions to answer overall
3. **More Accurate**: Questions are contextually appropriate
4. **Flexible System**: Easy to add more conditional logic rules

## Future Extensions

This system can be extended for:

- Skip pregnancy questions if male
- Skip alcohol questions if non-drinker
- Skip supplement follow-ups if no supplements taken
- Trigger deeper questions based on severity of symptoms
