# Assessment API Documentation

## Overview

The Assessment API provides endpoints for managing AI-powered functional medicine assessments. All endpoints follow RESTful conventions and return consistent response formats.

## Base URL

```
/api/assessment
```

## Response Format

All endpoints return responses in this format:

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}
```

## Endpoints

### 1. Start Assessment

Start a new assessment or resume an existing one for a client.

**Endpoint:** `POST /api/assessment/start`

**Request Body:**
```json
{
  "clientId": "string"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "assessmentId": "assessment-123",
    "status": "IN_PROGRESS",
    "currentModule": "SCREENING",
    "questionsAsked": 0,
    "completionRate": 0,
    "resuming": false
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z",
    "version": "1.0.0"
  }
}
```

**Error Codes:**
- `MISSING_CLIENT_ID` - Client ID not provided
- `CLIENT_NOT_FOUND` - Client doesn't exist
- `ASSESSMENT_START_ERROR` - Server error

### 2. Get Next Question

Get the next question based on AI analysis of previous responses.

**Endpoint:** `GET /api/assessment/{assessmentId}/next-question`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "question": {
      "id": "SCR001",
      "text": "How often do you experience fatigue?",
      "type": "scale",
      "module": "SCREENING",
      "category": "Energy",
      "options": {...},
      "helpText": "Consider your average energy levels",
      "required": true
    },
    "progress": {
      "currentModule": "SCREENING",
      "moduleProgress": 5,
      "overallProgress": 15.5,
      "questionsAsked": 23
    }
  }
}
```

**Completed Response:**
```json
{
  "success": true,
  "data": {
    "completed": true,
    "message": "Assessment completed successfully"
  }
}
```

**Error Codes:**
- `ASSESSMENT_NOT_FOUND` - Assessment doesn't exist
- `ASSESSMENT_ABANDONED` - Assessment was abandoned
- `NEXT_QUESTION_ERROR` - Server error

### 3. Submit Response

Submit a response to a question.

**Endpoint:** `POST /api/assessment/{assessmentId}/response`

**Request Body:**
```json
{
  "questionId": "SCR001",
  "value": 3,
  "text": "Often experience fatigue in afternoons",
  "confidence": 0.8
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "saved": true,
    "progress": {
      "questionsAsked": 24,
      "completionRate": 16.2
    }
  }
}
```

**Error Codes:**
- `MISSING_RESPONSE_DATA` - Required fields missing
- `ASSESSMENT_NOT_FOUND` - Assessment doesn't exist
- `ASSESSMENT_NOT_ACTIVE` - Assessment not in progress
- `QUESTION_ALREADY_ANSWERED` - Duplicate response
- `SAVE_RESPONSE_ERROR` - Server error

### 4. Pause Assessment

Pause an active assessment.

**Endpoint:** `POST /api/assessment/{assessmentId}/pause`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "PAUSED",
    "pausedAt": "2024-01-01T12:30:00Z",
    "questionsAsked": 45,
    "completionRate": 30.5
  }
}
```

**Error Codes:**
- `ASSESSMENT_NOT_FOUND` - Assessment doesn't exist
- `CANNOT_PAUSE` - Assessment not active
- `PAUSE_ERROR` - Server error

### 5. Resume Assessment

Resume a paused assessment.

**Endpoint:** `POST /api/assessment/{assessmentId}/resume`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "IN_PROGRESS",
    "currentModule": "ENERGY",
    "questionsAnswered": 45,
    "completionRate": 30.5,
    "aiContext": {...}
  }
}
```

**Error Codes:**
- `ASSESSMENT_NOT_FOUND` - Assessment doesn't exist
- `CANNOT_RESUME` - Assessment not paused
- `RESUME_ERROR` - Server error

### 6. Get Progress

Get detailed progress information.

**Endpoint:** `GET /api/assessment/{assessmentId}/progress`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "IN_PROGRESS",
    "currentModule": "ENERGY",
    "questionsAsked": 75,
    "questionsSaved": 75,
    "completionRate": 50.5,
    "moduleProgress": {
      "SCREENING": 15,
      "ENERGY": 12,
      "DEFENSE_REPAIR": 8
    },
    "estimatedMinutesRemaining": 150,
    "startedAt": "2024-01-01T12:00:00Z",
    "lastActiveAt": "2024-01-01T13:30:00Z"
  }
}
```

### 7. Get Analysis

Get comprehensive assessment analysis (available after completion).

**Endpoint:** `GET /api/assessment/{assessmentId}/analysis`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "assessment-123",
      "status": "COMPLETED",
      "completedAt": "2024-01-01T14:00:00Z",
      "questionsAsked": 150,
      "seedOilRisk": {...}
    },
    "analysis": {
      "overallScore": 72,
      "nodeScores": {
        "ENERGY": 65,
        "DEFENSE_REPAIR": 78,
        "ASSIMILATION": 80
      },
      "primaryConcerns": ["Chronic fatigue", "Inflammation"],
      "strengths": ["Good digestive health"],
      "riskFactors": ["High seed oil exposure"]
    },
    "recommendations": {
      "essential": ["Omega-3/6 ratio test", "CRP"],
      "recommended": ["Comprehensive metabolic panel"],
      "optional": ["Food sensitivity panel"],
      "reasoning": {...},
      "expectedFindings": {...}
    },
    "responsesByModule": {...}
  }
}
```

**Error Codes:**
- `ASSESSMENT_NOT_FOUND` - Assessment doesn't exist
- `ANALYSIS_NOT_AVAILABLE` - Assessment not completed
- `ANALYSIS_ERROR` - Server error

## Client Library Usage

Use the provided client library for easy integration:

```typescript
import { assessmentAPI } from '@/lib/api/assessment-client';

// Start assessment
const result = await assessmentAPI.startAssessment(clientId);

// Get next question
const question = await assessmentAPI.getNextQuestion(assessmentId);

// Submit response
await assessmentAPI.submitResponse(
  assessmentId,
  questionId,
  value,
  text,
  confidence
);

// Pause/Resume
await assessmentAPI.pauseAssessment(assessmentId);
await assessmentAPI.resumeAssessment(assessmentId);

// Get progress/analysis
const progress = await assessmentAPI.getProgress(assessmentId);
const analysis = await assessmentAPI.getAnalysis(assessmentId);
```

## Error Handling

All errors follow a consistent format:

```typescript
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error context"
  }
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (when auth is enabled)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

When deployed, these endpoints should be rate limited:
- Start assessment: 10 per hour per IP
- Submit response: 100 per hour per assessment
- Other endpoints: 1000 per hour per IP

## Security Notes

1. Authentication is currently commented out for development
2. Enable session validation before production deployment
3. Validate client ownership in production
4. Implement CORS restrictions
5. Add request logging for audit trails
