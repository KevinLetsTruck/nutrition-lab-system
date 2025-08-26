# Severity Ratings Testing Guide

## Overview

The assessment now includes severity ratings that appear when users select symptoms. This creates a clinically meaningful assessment that helps prioritize treatment based on symptom severity.

## New Features

### 1. Conditional Severity Questions

- **Digestive Severity** - Appears after selecting digestive symptoms
- **Chronic Impact** - Appears after selecting chronic conditions
- **Inflammation Frequency & Severity** - Two questions after inflammation symptoms
- **Anxiety Frequency & Impact** - Two questions after anxiety/mood symptoms

### 2. Enhanced Likert Scales

- **Numeric Value**: 0-5 scale
- **Severity Labels**: None → Mild → Moderate → Significant → Severe → Extreme
- **Visual Feedback**: Large number display with descriptive text

### 3. Additional Context Questions

- **Symptom Timeline** - When health concerns began
- **Digestive Triggers** - What triggers digestive symptoms

## Testing Scenarios

### Test 1: Digestive Severity Flow

1. Navigate to http://localhost:3000/test-complete-flow
2. Answer "YES" to "Do you experience digestive issues?"
3. Select multiple digestive symptoms (Bloating, Gas, Stomach pain)
4. ✅ **Verify**: Severity rating question appears
5. ✅ **Verify**: Digestive triggers question appears
6. Move the slider and verify labels change:
   - 0 = None
   - 1 = Mild
   - 2 = Moderate
   - 3 = Significant
   - 4 = Severe
   - 5 = Extreme
7. Use Previous button to go back
8. Unselect all symptoms
9. Click Next
10. ✅ **Verify**: Severity questions are skipped

### Test 2: Chronic Conditions Impact

1. Answer "YES" to "Do you have chronic conditions?"
2. Select multiple conditions (Diabetes, High Blood Pressure)
3. ✅ **Verify**: Impact rating appears
4. Check scale labels show "No impact" → "Severe impact"
5. Rate the impact and continue

### Test 3: Inflammation Dual Ratings

1. Answer "YES" to "Do you have signs of chronic inflammation?"
2. Select inflammation symptoms (Joint pain, Morning stiffness)
3. ✅ **Verify**: TWO questions appear:
   - Frequency question (Daily, Weekly, etc.)
   - Severity rating (0-5 scale)
4. Complete both and continue

### Test 4: Mental Health Assessment

1. Answer "YES" to "Do you experience anxiety or mood swings?"
2. Select symptoms (General anxiety, Panic attacks)
3. ✅ **Verify**: TWO questions appear:
   - Frequency (Multiple times daily → Monthly or less)
   - Impact on daily activities (0-5 scale)
4. Check impact scale shows "No interference" → "Unable to function"

### Test 5: Navigation with Severity

1. Complete several symptom selections with severity ratings
2. Use Previous button to navigate back
3. Change symptom selections
4. ✅ **Verify**: Severity questions appear/disappear based on selections
5. ✅ **Verify**: Previous severity ratings are preserved when navigating

### Test 6: Edge Cases

1. Select only "Other" from symptoms
2. ✅ **Verify**: Severity question still appears
3. Select symptoms, rate severity, then go back and unselect all
4. ✅ **Verify**: Severity questions are removed from flow

## Expected Behavior

### Conditional Logic

- ✅ Severity questions ONLY appear when symptoms are selected
- ✅ Questions disappear if all symptoms are unselected
- ✅ Navigation respects conditional flow
- ✅ All severity data saves to database

### Likert Scale Display

- ✅ Shows numeric value (0-5)
- ✅ Shows descriptive label below number
- ✅ Updates in real-time as slider moves
- ✅ Proper min/max labels from question definition

### Data Flow

- ✅ All responses saved including severity ratings
- ✅ Can analyze severity with `analyzeSeverity()` function
- ✅ Generates priority scores (low/medium/high/critical)

## Severity Analysis

After completing assessment, the system can:

1. Calculate combined severity scores
2. Prioritize treatment areas
3. Generate clinical reports
4. Track severity changes over time

### Priority Levels

- **Critical** (5): Immediate attention needed
- **High** (3-4): Priority treatment recommended
- **Medium** (2): Monitor and intervene
- **Low** (0-1): Minimal intervention

## Clinical Value

The severity ratings enable:

- **Triage**: Focus on most severe symptoms first
- **Tracking**: Monitor improvement over time
- **Personalization**: Tailor interventions to severity
- **Communication**: Clear severity metrics for providers

## Quick Test Checklist

- [ ] Digestive symptoms → Severity rating appears
- [ ] Chronic conditions → Impact rating appears
- [ ] Inflammation → Frequency + Severity appear
- [ ] Anxiety/Mood → Frequency + Impact appear
- [ ] Likert labels update (None → Extreme)
- [ ] Unselect all → Severity questions skip
- [ ] Navigation preserves severity ratings
- [ ] All data saves correctly

This creates a clinically meaningful assessment that captures not just the presence of symptoms, but their severity and impact on daily life!
