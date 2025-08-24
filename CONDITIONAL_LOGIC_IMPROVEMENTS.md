# Conditional Logic Improvements

## Overview
Fixed multiple instances where follow-up questions were asked about symptoms the user doesn't have.

## Fixes Implemented

### 1. COVID Vaccination Logic (NEUROLOGICAL)
- **Gateway Question**: NEURO017_VAX_STATUS - "Have you received any COVID-19 vaccinations?"
- **Skip Logic**: If NO/UNSURE → Skip NEURO018 (neurological symptoms after vaccination)
- **Commit**: 69175f0

### 2. Swelling Logic (CARDIOVASCULAR)
- **Gateway Question**: CARDIO012 - "Do your ankles or feet swell?"
- **Skip Logic**: If NEVER → Skip CARDIO013 (evening swelling patterns)
- **Commit**: 1ea5239

### 3. Cough Logic (RESPIRATORY)
- **Gateway Question**: RESP004 - "Do you have a chronic cough?"
- **Skip Logic**: If NO → Skip RESP005 (productive cough) and RESP006 (phlegm color)
- **Additional**: RESP005 - If NO/UNSURE to productive → Skip RESP006
- **Commits**: ae46f69, 6a8bbf4

### 4. Asthma Logic (RESPIRATORY)
- **Gateway Question**: RESP008 - "Have you been diagnosed with asthma?"
- **Skip Logic**: If NO → Skip RESP009 (inhaler use) and RESP015 (breathing triggers)
- **Commit**: fc2f443

## Pattern Applied
All fixes follow the same logical pattern:
1. Ask if user HAS a condition/symptom
2. Only ask ABOUT the condition/symptom if they have it
3. Skip follow-up questions when the base condition is absent

## Benefits
- More logical question flow
- Shorter assessments (skip irrelevant questions)
- Better user experience
- More accurate data (no forced answers about non-existent symptoms)
