# Question Type Fixes

## Issue
Multiple assessment questions were using `LIKERT_SCALE` type with "Strongly Disagree" to "Strongly Agree" options when they should have been using `YES_NO` or `FREQUENCY` types.

Examples:
- "Are you sensitive to chemicals, perfumes, or smoke?" → Showed Likert scale instead of Yes/No
- "Do you experience digestive symptoms when stressed?" → Showed Likert scale instead of Yes/No
- "Do you crave sugar or carbohydrates?" → Showed Likert scale instead of frequency options

## Root Cause
Questions that start with "Do you...", "Are you...", "Have you..." were incorrectly configured as `LIKERT_SCALE` type when they are fundamentally yes/no questions.

## Solution

### 1. Immediate Fixes
Fixed the following questions from `LIKERT_SCALE` to `YES_NO`:
- SCR057: "Are you sensitive to chemicals, perfumes, or smoke?"
- ASM052: "Do you experience digestive symptoms when stressed?"
- ENE006: "Are you sensitive to cold temperatures?"
- ENE_SO01: "Do you notice energy differences when eating home-cooked versus restaurant meals?"
- ENE_SO03: "Do you feel more energetic when eating simple, whole foods?"
- ENE_SO07: "Do you have more sustained energy when avoiding packaged and processed foods?"

Fixed from `LIKERT_SCALE` to `FREQUENCY`:
- SCR052: "Do you crave sugar or carbohydrates?"

### 2. Scripts Created
- `scripts/find-incorrect-likert.js` - Identifies questions with incorrect types
- `scripts/fix-specific-likert-questions.js` - Fixes specific questions automatically

### 3. UI Enhancement
Updated the assessment UI to support custom Likert scale labels via `scaleMin` and `scaleMax` properties for questions that legitimately need Likert scales.

## Guidelines for Future Questions
- Questions starting with "Do you...", "Are you...", "Have you..." → Use `YES_NO`
- Questions about frequency ("How often...") → Use `FREQUENCY`
- Questions about intensity/degree ("How much...", "Rate your...") → Use `LIKERT_SCALE`
- Questions about specific choices → Use `MULTIPLE_CHOICE`

## Result
- Questions now show appropriate answer options
- Better user experience with logical answer choices
- Consistent question types across the assessment
