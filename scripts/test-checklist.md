# Complete Conditional Logic Testing Checklist

## Overview

- Base Questions: 33
- Follow-up Questions: 18
- Total Possible: 51
- Minimum (all NO/negative): 33
- Maximum (all YES/positive): 51

## Testing Checklist

### SCREENING Module (4 follow-ups)

- [ ] **Digestive Issues** → YES → Shows "Please describe your digestive issues" (TEXT)
- [ ] **Food Sensitivities** → YES → Shows "Which foods do you react to?" (TEXT)
- [ ] **Chronic Conditions** → YES → Shows "Please list your chronic health conditions" (TEXT)
- [ ] **Medications** → YES → Shows "Please list all medications and supplements" (TEXT)

### DIGESTIVE Module (4 follow-ups)

- [ ] **Regular Bowel Movements** → NO → Shows "Please describe your bowel movement patterns" (TEXT)
- [ ] **Stomach Pain** → YES → Shows "Describe your stomach pain patterns" (TEXT)
- [ ] **Food Reactions** → YES → Shows "Which foods trigger symptoms?" (TEXT)

### ENERGY Module (2 follow-ups)

- [ ] **Afternoon Crash** → YES → Shows "When do crashes occur and what helps?" (TEXT)
- [ ] **Need Caffeine** → YES → Shows "Describe your caffeine consumption" (TEXT)

### IMMUNE Module (3 follow-ups)

- [ ] **Autoimmune Conditions** → YES → Shows "Which autoimmune conditions?" (TEXT)
- [ ] **Environmental Allergies** → YES → Shows "What are you allergic to?" (TEXT)
- [ ] **Chronic Inflammation** → YES → Shows "Describe your inflammation symptoms" (TEXT)

### HORMONAL Module (2 follow-ups)

- [ ] **Temperature Regulation Issues** → YES → Shows "Describe temperature issues" (TEXT)
- [ ] **Hair/Skin Changes** → YES → Shows "Describe the changes" (TEXT)

### NEUROLOGICAL Module (1 follow-up)

- [ ] **Anxiety/Mood Swings** → YES → Shows "Describe frequency and triggers" (TEXT)

### CARDIOVASCULAR Module (2 follow-ups)

- [ ] **Shortness of Breath** → YES → Shows "Describe when it occurs" (TEXT)
- [ ] **Family Heart History** → YES → Shows "Which conditions and family members?" (TEXT)

### DETOX Module (1 follow-up)

- [ ] **Chemical Sensitivities** → YES → Shows "Which substances trigger reactions?" (TEXT)

## Console Output to Verify

When testing, check console for:

```
🔍 Checking conditional for essential-[question]-details:
   Depends on: essential-[question]
   Show if: yes
   Found response: {questionId: "essential-[question]", value: "yes"}
   Response value: yes
   Normalized comparison: "yes" === "yes" = true
✅ Showing essential-[question]-details
```

## Edge Cases to Test

1. **Bowel Regularity** - Only follow-up that triggers on NO instead of YES
2. **Skip Logic** - Answer NO and verify follow-up is skipped
3. **Progress Bar** - Should show "Question X of ~33-51"
4. **Completion Summary** - Should correctly count base vs follow-up questions
5. **Dark Mode** - All text should be visible in both light and dark modes
