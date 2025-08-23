# Redundant Questions Fixed

## Issue Identified

The assessment was stuck repeatedly asking the same energy question (SCR001) and had duplicate questions across modules.

## Fixes Applied

### 1. Removed Duplicate Energy Question

- **SCR001** (SCREENING): "How would you rate your overall energy level throughout the day?"
- **ENE001** (ENERGY): Same exact question - REMOVED
- Kept the screening version as energy is a fundamental baseline metric

### 2. Fixed Question Selection Loop

- Enhanced `fallbackQuestionSelection` to double-check that questions haven't been answered
- Added loop detection to clear cache if same question is selected repeatedly
- Added tracking of last selected question ID to prevent repeats

### 3. Cache Management Improvements

- Cache now detects when it's returning the same question multiple times
- Automatically clears cache when a loop is detected
- Logs warning when repeated selection is detected

## Technical Changes

1. **lib/assessment/questions/energy-questions.ts**

   - Removed ENE001 (duplicate energy question)
   - Module now starts with ENE002

2. **lib/ai/assessment-ai.ts**
   - Added `lastSelectedQuestionId` tracking
   - Enhanced cache logic to detect and break loops
   - Improved `fallbackQuestionSelection` to filter already-answered questions
   - Updated severity threshold from 7 to 4 (for 5-point scale)

## Benefits

- No more duplicate energy questions
- Assessment won't get stuck on the same question
- Better user experience with no redundant questions
- More robust fallback logic when AI isn't used
