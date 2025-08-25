# Previous/Back Navigation Testing Guide

## Overview

The assessment now supports bidirectional navigation with Previous and Next buttons, allowing you to:

- Go back to change answers
- Test different conditional logic paths
- Update responses without restarting

## New Features

### 1. Previous Button

- **Appears**: After answering the first question
- **Location**: Bottom left, next to Restart
- **Functionality**:
  - Goes back to the last visible question
  - Loads your previous answer
  - Removes responses for questions after the current one
  - Properly handles conditional questions

### 2. Enhanced Next Button

- **Updates existing answers** when navigating forward after going back
- **Shows "Complete"** on the last question
- **Includes navigation arrow** for clarity

### 3. Navigation Indicators

- **Progress counter** shows saved responses
- **Navigation hints** show "← Previous" and "Next →" availability
- **Save indicator** shows when responses are being saved

## Testing Scenarios

### Test 1: Basic Navigation

1. Start assessment at http://localhost:3000/test-complete-flow
2. Answer first 3 questions
3. Click "Previous" to go back to question 2
4. Change your answer
5. Click "Next" - verify answer is updated
6. Continue to question 3 - verify it shows your previous answer

### Test 2: Conditional Logic with Navigation

1. Answer "Do you have digestive issues?" with YES
2. Click Next - see follow-up question about symptoms
3. Select some symptoms
4. Click Previous twice to go back to digestive issues
5. Change answer to NO
6. Click Next - verify follow-up is skipped
7. Click Previous - change back to YES
8. Click Next - verify follow-up reappears

### Test 3: "Other" Option Navigation

1. Find a MULTI_SELECT question with "Other" option
2. Select "Other" and enter custom text
3. Click Next
4. Click Previous
5. Verify "Other" is still selected and text is preserved
6. Uncheck "Other" and select different options
7. Click Next to save changes

### Test 4: Multiple Follow-ups

1. Answer several YES/NO questions to trigger follow-ups:
   - Chronic conditions → YES
   - Medications → YES
   - Autoimmune → YES
2. Answer all follow-up questions
3. Navigate back to the first YES/NO
4. Change to NO
5. Navigate forward - verify all related follow-ups are skipped

### Test 5: Complex Navigation Path

1. Answer 10+ questions including follow-ups
2. Use Previous to go back 5 questions
3. Change a YES to NO (removing follow-ups)
4. Navigate forward - verify:
   - Previously answered questions show saved answers
   - Skipped follow-ups are removed from responses
   - Progress updates correctly

### Test 6: Edge Cases

1. Try clicking Previous on first question (button shouldn't appear)
2. Answer all questions to completion
3. On completion screen, verify all responses shown
4. Check that follow-up questions are marked with "Follow-up" badge

## Expected Behavior

### Previous Button

- ✅ Only shows after first question
- ✅ Disabled while saving
- ✅ Removes future responses when going back
- ✅ Preserves "Other" text when applicable
- ✅ Skips conditional questions that shouldn't show

### Next Button

- ✅ Updates existing responses when re-answering
- ✅ Shows "Complete" on last question
- ✅ Saves to database (create or update)
- ✅ Properly handles conditional logic
- ✅ Shows save indicator

### Navigation Flow

- ✅ Can freely move between answered questions
- ✅ Conditional questions appear/disappear based on updated answers
- ✅ Progress bar updates as you navigate
- ✅ Responses persist in database
- ✅ Can test multiple paths without restarting

## UI Improvements

- Navigation hints in header
- Save status indicator
- Confirmation for restart
- Better button styling with icons
- Clear visual feedback for navigation state

## Benefits

1. **Faster Testing** - Change answers without restarting
2. **Path Exploration** - Test different conditional branches
3. **Error Correction** - Fix mistakes easily
4. **Better UX** - More control over assessment flow
5. **Confidence** - See and verify your answers
