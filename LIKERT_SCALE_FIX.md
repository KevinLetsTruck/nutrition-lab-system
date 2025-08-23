# Likert Scale Question Fix

## Issue
The question "Do you crave sugar or carbohydrates?" (SCR052) was showing incorrect answer options:
- Displayed: "Strongly Disagree" to "Strongly Agree" 
- Expected: Frequency options like "Never" to "Always"

## Root Cause
The question was defined as type `LIKERT_SCALE` with `scaleMin: "Never"` and `scaleMax: "Intense daily cravings"`, but:
1. The assessment UI was only looking for labels in the `options` array
2. It wasn't checking the `scaleMin` and `scaleMax` properties
3. The question type was incorrect - it should have been `FREQUENCY`

## Solution

### 1. Fixed the Assessment UI
Updated the Likert scale rendering to check for `scaleMin` and `scaleMax` properties:
```typescript
const lowLabel = currentQuestion.scaleMin || currentQuestion.options?.[0]?.label || "Strongly Disagree";
const highLabel = currentQuestion.scaleMax || currentQuestion.options?.[1]?.label || "Strongly Agree";
```

### 2. Changed Question Type
Converted SCR052 from `LIKERT_SCALE` to `FREQUENCY` type with proper options:
```typescript
type: "FREQUENCY",
options: [
  { value: "never", label: "Never", score: 0 },
  { value: "rarely", label: "Rarely", score: 1 },
  { value: "sometimes", label: "Sometimes", score: 2 },
  { value: "often", label: "Often", score: 3 },
  { value: "always", label: "Always", score: 4 },
]
```

### 3. Updated Question Interface
Added `scaleMin` and `scaleMax` as optional properties to support custom Likert scale labels in the future.

## Result
- The sugar cravings question now shows appropriate frequency options
- Other Likert scale questions can now use custom labels via `scaleMin`/`scaleMax`
- Better consistency with other frequency-based questions in the assessment
