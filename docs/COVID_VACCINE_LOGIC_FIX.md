# COVID and Vaccine Conditional Logic Fix

## Problem
The assessment was asking about COVID symptoms and vaccine reactions without first confirming if the user had COVID or received vaccines. This created illogical question flows and wasted time.

## Root Causes
1. **Module Mismatch**: Gateway questions were assigned to wrong modules
2. **Missing Gateway Questions**: No COVID status question in NEUROLOGICAL module
3. **Lack of Prioritization**: AI wasn't prioritizing gateway questions
4. **Incomplete Conditional Logic**: Gateway questions didn't skip all dependent questions

## Solution Implemented

### 1. Fixed Module Assignment
- Changed `NEURO017_VAX_STATUS` from "SCREENING" to "NEUROLOGICAL" module
- Ensures it's available when neurological questions are being selected

### 2. Added COVID Status Gateway
- Created `NEURO016_COVID_STATUS` in NEUROLOGICAL module
- Asks "Have you had COVID-19?" before any COVID symptom questions
- Skips `NEURO016` and `NEURO017` if answer is "no" or "unsure"

### 3. Enhanced Conditional Logic
- `SPEC004` (COVID history) now skips ALL COVID-related questions across modules:
  - NEUROLOGICAL: NEURO016, NEURO017
  - RESPIRATORY: RESP019, RESP020
  - CARDIOVASCULAR: CARDIO020
  - IMMUNE: IMMUNE028, IMMUNE029
  - SPECIAL_TOPICS: SPEC005, SPEC006, SPEC007

- `SPEC008` (vaccine status) now skips vaccine-related questions:
  - SPECIAL_TOPICS: SPEC009, SPEC010
  - NEUROLOGICAL: NEURO018

### 4. AI Prioritization
- Both Claude AI and fallback logic now prioritize gateway questions
- Gateway questions (those with conditionalLogic) are always selected first
- Ensures proper question flow and prevents illogical sequences

### 5. Question Ordering
- Gateway questions are physically reordered within modules
- COVID status comes before COVID symptoms
- Vaccine status comes before vaccine reactions

## Result
- Users are only asked about COVID symptoms if they've had COVID
- Users are only asked about vaccine reactions if they've been vaccinated
- Shorter, more logical assessments
- No more repeated fixes needed

## Key Files Modified
- `lib/ai/assessment-ai.ts` - Added gateway question prioritization
- Database question bank - Fixed module assignments and added conditional logic
