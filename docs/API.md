# API Documentation

## Overview

The Nutrition Lab Management System provides RESTful API endpoints for uploading, analyzing, and managing lab reports.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All API endpoints require authentication using Supabase JWT tokens.

## Endpoints

### File Upload

#### POST /api/upload

Upload a lab report file (PDF or image).

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Response:**
```json
{
  "success": true,
  "filename": "unique_filename.pdf",
  "originalName": "lab_report.pdf",
  "size": 1024000,
  "path": "/path/to/file"
}
```

**Error Response:**
```json
{
  "error": "File size exceeds maximum allowed size"
}
```

### PDF Analysis

#### POST /api/analyze

Analyze a uploaded PDF lab report.

**Request:**
```json
{
  "filename": "unique_filename.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "patientId": "12345",
    "patientName": "John Doe",
    "testDate": "2024-01-15T00:00:00.000Z",
    "results": [
      {
        "testName": "Glucose",
        "value": "95",
        "unit": "mg/dL",
        "referenceRange": "70-100",
        "status": "normal",
        "timestamp": "2024-01-15T00:00:00.000Z"
      }
    ],
    "rawText": "Original PDF text content..."
  }
}
```

### Lab Results

#### GET /api/results

Get lab results for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "testName": "Glucose",
      "value": "95",
      "unit": "mg/dL",
      "referenceRange": "70-100",
      "status": "normal",
      "created_at": "2024-01-15T00:00:00.000Z"
    }
  ]
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a descriptive message:

```json
{
  "error": "Descriptive error message"
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse. Limits will be configured based on usage patterns.

## File Upload Limits

- Maximum file size: 10MB
- Allowed file types: PDF, PNG, JPG, JPEG
- Files are stored securely with unique names
