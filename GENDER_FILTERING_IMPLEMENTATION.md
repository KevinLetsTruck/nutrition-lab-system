# Gender Filtering Implementation

## Overview
Fixed the gender filtering logic to ensure that users only see questions appropriate for their gender. Male users will no longer see female-specific questions (menstrual, pregnancy, menopause) and vice versa.

## The Problem
- Male users were being shown questions like "For women: Are your menstrual cycles regular?"
- The gender filtering was only implemented in some code paths, not all
- The fallback algorithm didn't have gender filtering

## The Solution

### 1. Added `genderSpecific` Property
Added a new property to the `AssessmentQuestion` type:
```typescript
genderSpecific?: 'male' | 'female'; // Only show to specific gender
```

### 2. Marked Female-Specific Questions
Added `genderSpecific: "female"` to these questions:
- **SCR049**: "For women: Are your menstrual cycles regular?"
- **COM001**: "For women: How regular are your menstrual cycles?"
- **COM023**: "For women: Are you in perimenopause or menopause?"
- **COM078**: "Do you have irregular menstrual cycles? (if applicable)"

### 3. Enhanced Gender Filtering Logic
Updated both the main AI engine and fallback algorithm to:
1. First check the `genderSpecific` property
2. Then check for gender-specific keywords in the question text
3. Filter out inappropriate questions before selection

### 4. Added Comprehensive Logging
Added console logging to track gender filtering decisions:
```
Filtering questions for gender: male
Filtering out female-specific question for male user: SCR049 - For women: Are your menstrual cycles regular?
Gender filtering: 75 → 71 questions
```

## Implementation Details

### AI Engine Updates (`lib/ai/assessment-ai.ts`)
- Added gender filtering to `getNextQuestionWithAI` function
- Added gender filtering to `fallbackQuestionSelection` function
- Both functions now check `genderSpecific` property first
- Fallback function now receives `clientInfo` parameter

### Question Updates
- Modified questions in `screening-questions-additional.ts`
- Modified questions in `communication-questions.ts`
- Modified questions in `communication-questions-additional.ts`

## Testing
Created scripts to verify the implementation:
- `scripts/check-client-gender.js` - Checks which clients answered gender-inappropriate questions
- `scripts/verify-gender-specific.js` - Verifies questions have correct genderSpecific property

## Result
Male users will no longer see:
- Menstrual cycle questions
- Pregnancy-related questions
- Menopause questions
- Any question starting with "For women:"

Female users will no longer see:
- Erectile dysfunction questions
- Prostate-related questions
- Any question starting with "For men:"
