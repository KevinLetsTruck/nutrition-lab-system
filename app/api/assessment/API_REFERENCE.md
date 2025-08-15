# Assessment API Reference

## Overview
The assessment API provides endpoints for managing functional medicine health assessments with AI-driven question selection.

## Endpoints

### 1. Start Assessment
**POST** `/api/assessment/start`

Creates a new assessment or returns existing in-progress assessment.

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "clxx...",
    "firstQuestion": { /* question object */ },
    "module": "SCREENING",
    "questionsInModule": 75
  }
}
```

### 2. Submit Response
**POST** `/api/assessment/[id]/response`

Saves user response and gets next question using AI logic.

**Request Body:**
```json
{
  "questionId": "screening_1",
  "value": "answer value",
  "module": "SCREENING"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nextQuestion": { /* question object */ },
    "module": "SCREENING",
    "questionsInModule": 75,
    "questionsSaved": 5,
    "aiReasoning": "Skipping 5 questions due to high severity",
    "seedOilFlag": false
  }
}
```

### 3. Pause Assessment
**POST** `/api/assessment/[id]/pause`

Pauses an in-progress assessment for later resumption.

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "clxx...",
    "status": "PAUSED",
    "questionsAnswered": 45,
    "questionsAsked": 50,
    "questionsSaved": 10,
    "currentModule": "DEFENSE_REPAIR",
    "progressPercentage": 12,
    "message": "Assessment saved successfully. You can resume anytime."
  }
}
```

### 4. Resume Assessment
**POST** `/api/assessment/[id]/resume`

Resumes a paused assessment from where user left off.

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "clxx...",
    "currentQuestion": { /* question object */ },
    "currentModule": "DEFENSE_REPAIR",
    "responses": [ /* array of previous responses */ ],
    "questionsAsked": 50,
    "questionsSaved": 10,
    "questionsAnsweredInModule": 15,
    "questionsInCurrentModule": 60,
    "progressPercentage": 12
  }
}
```

### 5. Get Progress
**GET** `/api/assessment/[id]/progress`

Retrieves detailed progress information for an assessment.

**Response:**
```json
{
  "success": true,
  "data": {
    "assessmentId": "clxx...",
    "status": "IN_PROGRESS",
    "currentModule": "DEFENSE_REPAIR",
    "questionsAsked": 50,
    "questionsSaved": 10,
    "totalQuestions": 495,
    "overallPercentage": 12,
    "moduleProgress": {
      "SCREENING": {
        "answered": 30,
        "total": 75,
        "percentage": 40
      },
      // ... other modules
    },
    "estimatedMinutesRemaining": 180,
    "efficiencyRate": 20,
    "efficiencyMessage": "AI has saved you 10 questions (20% reduction)"
  }
}
```

## Authentication
All endpoints require authentication via session cookies. Unauthorized requests return:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

## Error Handling
All endpoints follow consistent error response format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details if available"
}
```

## AI Features
- **Smart Question Selection**: AI analyzes responses to skip redundant questions
- **High Severity Detection**: Questions rated ≥7 trigger special handling
- **Seed Oil Tracking**: Special category for tracking seed oil exposure
- **Module Progression**: Automatic advancement through 8 health modules
- **Efficiency Metrics**: Tracks questions saved by AI optimization
