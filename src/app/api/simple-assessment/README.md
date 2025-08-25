# Simple Assessment API Documentation

## Overview

Simple REST API for managing 20-question health assessments.

## Endpoints

### 1. Start Assessment

**POST** `/api/simple-assessment/start`

Starts a new assessment or resumes an existing in-progress assessment.

**Request Body:**

```json
{
  "clientId": "string" // Required
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "assessmentId": "string",
    "status": "started" | "resumed",
    "progress": {
      "completed": 0,
      "total": 20,
      "nextQuestionId": 1
    }
  }
}
```

### 2. Submit Response

**POST** `/api/simple-assessment/[id]/submit`

Saves a response to a specific question.

**Request Body:**

```json
{
  "questionId": 1, // 1-20
  "score": 3 // 1-5 (Very Poor to Excellent)
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "saved": true,
    "progress": {
      "completed": 1,
      "total": 20,
      "nextQuestionId": 2,
      "isComplete": false
    }
  }
}
```

### 3. Get Assessment Status

**GET** `/api/simple-assessment/[id]/status`

Gets current assessment status, progress, and next question.

**Response:**

```json
{
  "success": true,
  "data": {
    "assessment": {
      "id": "string",
      "status": "in_progress" | "completed",
      "startedAt": "2024-01-01T00:00:00Z",
      "completedAt": null
    },
    "client": {
      "firstName": "Test",
      "lastName": "User"
    },
    "progress": {
      "completed": 5,
      "total": 20,
      "percentage": 25
    },
    "nextQuestion": {
      "id": 6,
      "category": "energy",
      "text": "How consistent is your energy throughout the day?"
    },
    "responses": [
      // Array of saved responses
    ]
  }
}
```

### 4. Test Connection

**GET** `/api/simple-assessment/test`

Tests database connection (development only).

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Database connection working",
    "counts": {
      "clients": 1,
      "assessments": 0,
      "responses": 0
    }
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:

- 400: Bad Request (missing/invalid parameters)
- 404: Not Found (client/assessment not found)
- 500: Internal Server Error

## Testing

Use the provided test scripts:

```bash
# Get test client ID
node scripts/get-test-client.js

# Test all endpoints
node scripts/test-simple-api.js
```
