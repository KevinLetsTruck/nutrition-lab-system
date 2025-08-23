# Duplicate Question Fix

## Issue
Users were seeing the same assessment questions multiple times. For example, question SCR033 (about food sensitivities) was being shown repeatedly despite being already answered.

## Root Cause
The API endpoint `/api/assessment/[id]/next-question` was only fetching the last 20 responses for performance optimization. When users answered more than 20 questions, the AI context didn't include all previously answered questions, causing it to select questions that had already been answered earlier in the assessment.

## Solution

### 1. Fetch All Responses
Changed the API to fetch ALL responses instead of just the last 20:
```typescript
// Before
const recentResponses = await prisma.clientResponse.findMany({
  where: { assessmentId },
  orderBy: { answeredAt: "desc" },
  take: 20, // Only get last 20 responses for performance
});

// After
const allResponses = await prisma.clientResponse.findMany({
  where: { assessmentId },
  orderBy: { answeredAt: "desc" },
});
```

### 2. Add Duplicate Detection
Added a safety check after AI selection to ensure the selected question hasn't been answered:
```typescript
if (answeredIds.has(nextQuestion.id)) {
  console.error(`WARNING: AI selected already answered question ${nextQuestion.id}!`);
  // Fallback to linear selection
  nextQuestion = null;
}
```

### 3. Enhanced Cache Validation
Updated the AI cache to check for already answered questions before returning cached decisions.

## Verification
Created `scripts/check-duplicate-responses.js` to verify:
- No duplicate responses are stored in the database ✅
- The issue was in question selection, not response storage ✅

## Result
The assessment will no longer show duplicate questions. If the AI attempts to select a duplicate, it will:
1. Log a warning
2. Clear the cache
3. Fallback to linear question selection

## Performance Consideration
Fetching all responses instead of just 20 may have a small performance impact for assessments with many questions. However, correctness (avoiding duplicates) is more important than the minor performance gain.
