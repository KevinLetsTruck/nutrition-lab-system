# Assessment Intake Update

## Overview

Added a comprehensive intake form that collects basic client information before the assessment begins, including demographics, medications, and supplements.

## New Features

### 1. Intake Page (`/assessment/intake`)

- Collects essential demographic information:
  - Date of Birth (required)
  - Gender (required - used for intelligent question filtering)
  - Height and Weight (optional)
  - Primary Health Goal (optional)
- Medication tracking:
  - Current prescription medications with dosage and frequency
  - Over-the-counter medications
- Supplement tracking:
  - Vitamins, minerals, and other supplements
  - Dosage and brand information

### 2. Intelligent Gender-Based Question Filtering

The AI now automatically filters out gender-inappropriate questions:

- **For Males**: Skips questions about menstruation, pregnancy, menopause
- **For Females**: Skips questions about erectile dysfunction, prostate issues
- **Gender-neutral handling**: If gender is not specified or "other", all questions are available

### 3. Medication/Supplement Database

Created a comprehensive database of common medications and supplements for future autocomplete functionality:

- 40+ common medications with categories and typical dosages
- 35+ common supplements with categories and typical dosages
- Search helper functions for easy integration

### 4. Enhanced AI Context

The AI now receives:

- Client gender and age
- Current medications (helps identify potential interactions)
- Can make more informed decisions about question relevance

## User Flow

1. **Welcome Page** → User clicks "Begin Your Health Journey"
2. **Intake Page** → Collects demographics, medications, supplements
3. **Assessment** → Begins with AI using collected information

## API Updates

### PATCH `/api/clients/[clientId]`

New endpoint for updating client information including:

- `dateOfBirth`
- `gender`
- `medications` (JSON object with `current` and `supplements` arrays)
- `height`, `weight` (stored in metadata)
- `healthGoals`, `conditions`, `allergies`

## Data Structure

```typescript
// Medications stored as JSON in Client model
{
  current: [
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
    // ...
  ],
  supplements: [
    { name: "Vitamin D3", dosage: "5000 IU", brand: "Nature's Way" },
    // ...
  ]
}
```

## Performance Considerations

- Gender filtering happens at the AI level, reducing unnecessary questions
- Client information is cached with assessment for quick access
- Intake data persists, allowing users to skip if already completed

## Future Enhancements

1. Autocomplete for medication/supplement names
2. Drug interaction warnings
3. Medication adherence tracking
4. Integration with pharmacy data
