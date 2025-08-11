# Medical Document Processing System API Documentation

This comprehensive API documentation covers the medical document processing system built for the FNTP Nutrition System.

## Table of Contents

1. [Authentication](#authentication)
2. [Document Upload API](#document-upload-api)
3. [Document Processing API](#document-processing-api)
4. [Document Analysis API](#document-analysis-api)
5. [Document Status API](#document-status-api)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [WebSocket Events](#websocket-events)
9. [Data Models](#data-models)
10. [Examples](#examples)

## Authentication

All API endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The JWT token should contain:
- `id`: User ID
- `email`: User email
- `role`: User role
- `clientIds`: Array of client IDs the user can access (optional)

## Document Upload API

### POST `/api/documents/upload`

Upload medical documents for processing.

#### Request

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Document file (PDF, JPEG, PNG, TIFF, DOC, DOCX, TXT) |
| `clientId` | String | Yes | Client ID the document belongs to |
| `documentType` | String | Yes | Type of document (see DocumentType enum) |
| `labType` | String | No | Laboratory type if applicable (see LabType enum) |

#### Response

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "doc_12345",
      "fileName": "timestamp_random_filename.pdf",
      "originalFileName": "lab_results.pdf",
      "fileType": "application/pdf",
      "fileSize": 2048576,
      "documentType": "LAB_REPORT",
      "labType": "LABCORP",
      "status": "UPLOADED",
      "uploadedAt": "2024-01-15T10:30:00Z"
    },
    "uploadResult": {
      "id": "storage_key_or_public_id",
      "url": "https://storage-url/path/to/file",
      "size": 2048576,
      "provider": "S3"
    }
  },
  "message": "Document uploaded and queued for processing"
}
```

#### Document Types

- `LAB_REPORT`: Laboratory test results
- `IMAGING_REPORT`: Medical imaging reports
- `CLINICAL_NOTES`: Clinical notes and summaries
- `PATHOLOGY_REPORT`: Pathology reports
- `ASSESSMENT_FORM`: Assessment forms and questionnaires
- `PRESCRIPTION`: Prescription documents
- `INSURANCE_CARD`: Insurance card images
- `INTAKE_FORM`: Patient intake forms
- `UNKNOWN`: Unknown or unclassified documents

#### Lab Types

- `NUTRIQ`: NutriQ labs
- `LABCORP`: LabCorp
- `QUEST`: Quest Diagnostics
- `DUTCH`: DUTCH testing
- `KBMO`: KBMO FIT tests
- `GENOVA`: Genova Diagnostics
- `DIAGNOSTIC_SOLUTIONS`: Diagnostic Solutions
- `GREAT_PLAINS`: Great Plains Laboratory
- `VIBRANT_WELLNESS`: Vibrant Wellness
- `PRECISION_POINT`: Precision Point
- `OTHER`: Other laboratories

### GET `/api/documents/upload`

List uploaded documents with filtering options.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `clientId` | String | Filter by client ID |
| `documentType` | String | Filter by document type |
| `status` | String | Filter by processing status |
| `limit` | Number | Maximum number of results (default: 10) |
| `offset` | Number | Number of results to skip (default: 0) |

#### Response

```json
{
  "success": true,
  "data": {
    "documents": [...],
    "pagination": {
      "total": 150,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  },
  "message": "Documents retrieved successfully"
}
```

## Document Processing API

### POST `/api/documents/process`

Trigger or re-trigger document processing (OCR and data extraction).

#### Request Body

```json
{
  "documentId": "doc_12345",
  "forceReprocess": false,
  "options": {
    "priority": 5,
    "ocrProvider": "CLAUDE",
    "language": "en",
    "analysisType": "FUNCTIONAL_MEDICINE",
    "includeRecommendations": true,
    "includeTrends": true,
    "compareWithPrevious": false
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "documentId": "doc_12345",
    "status": "Processing queued",
    "jobs": [
      {
        "type": "OCR_EXTRACTION",
        "jobId": "job_67890",
        "priority": 5
      },
      {
        "type": "FUNCTIONAL_ANALYSIS",
        "jobId": "job_67891",
        "priority": 5
      }
    ],
    "estimatedCompletion": "2024-01-15T10:35:00Z"
  },
  "message": "Document processing successfully initiated"
}
```

### GET `/api/documents/process`

Get processing queue status and statistics.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `clientId` | String | Filter by client ID |
| `status` | String | Filter by job status |
| `jobType` | String | Filter by job type |

#### Response

```json
{
  "success": true,
  "data": {
    "processingJobs": [...],
    "queueHealth": [
      {
        "queueName": "ocr-extraction",
        "status": "healthy",
        "metrics": {
          "waiting": 5,
          "active": 2,
          "completed": 150,
          "failed": 3,
          "delayed": 0,
          "paused": false
        }
      }
    ],
    "summary": {
      "total": 160,
      "pending": 5,
      "active": 2,
      "completed": 150,
      "failed": 3
    }
  },
  "message": "Processing queue status retrieved successfully"
}
```

## Document Analysis API

### POST `/api/documents/analyze`

Trigger functional medicine analysis of processed documents.

#### Request Body

```json
{
  "documentId": "doc_12345",
  "analysisType": "FUNCTIONAL_MEDICINE",
  "options": {
    "priority": 3,
    "includeRecommendations": true,
    "includeTrends": true,
    "compareWithPrevious": true,
    "forceReprocess": false
  }
}
```

#### Analysis Types

- `FUNCTIONAL_MEDICINE`: Functional medicine interpretation
- `CONVENTIONAL_INTERPRETATION`: Conventional medical interpretation
- `PATTERN_RECOGNITION`: Pattern recognition analysis
- `TREND_ANALYSIS`: Trend analysis over time
- `COMPARATIVE_ANALYSIS`: Comparative analysis with reference ranges
- `NUTRIENT_ANALYSIS`: Nutrient deficiency analysis
- `TOXICITY_ANALYSIS`: Toxicity assessment
- `HORMONE_ANALYSIS`: Hormone balance analysis

#### Response

```json
{
  "success": true,
  "data": {
    "analysisId": "analysis_12345",
    "documentId": "doc_12345",
    "analysisType": "FUNCTIONAL_MEDICINE",
    "status": "Analysis queued",
    "labValuesCount": 45,
    "historicalValuesCount": 120,
    "estimatedCompletion": "2024-01-15T10:32:00Z",
    "jobId": "job_67892"
  },
  "message": "Document analysis successfully queued"
}
```

### GET `/api/documents/analyze`

List document analyses with filtering and statistics.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `documentId` | String | Filter by document ID |
| `clientId` | String | Filter by client ID |
| `analysisType` | String | Filter by analysis type |
| `status` | String | Filter by analysis status |
| `limit` | Number | Maximum number of results (default: 10) |
| `offset` | Number | Number of results to skip (default: 0) |

#### Response

```json
{
  "success": true,
  "data": {
    "analyses": [...],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    },
    "statistics": {
      "byStatus": {
        "COMPLETED": 20,
        "PENDING": 3,
        "FAILED": 2
      },
      "byType": {
        "FUNCTIONAL_MEDICINE": 15,
        "TREND_ANALYSIS": 8,
        "NUTRIENT_ANALYSIS": 2
      }
    }
  },
  "message": "Document analyses retrieved successfully"
}
```

## Document Status API

### GET `/api/documents/status/[id]`

Get comprehensive status information for a specific document.

#### Response

```json
{
  "success": true,
  "data": {
    "document": {
      "id": "doc_12345",
      "fileName": "timestamp_random_filename.pdf",
      "originalFileName": "lab_results.pdf",
      "status": "COMPLETED",
      "documentType": "LAB_REPORT",
      "labType": "LABCORP"
    },
    "client": {
      "id": "client_67890",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "progress": {
      "percentage": 100,
      "currentStep": "COMPLETED",
      "estimatedCompletion": null
    },
    "processing": {
      "summary": {
        "total": 3,
        "pending": 0,
        "active": 0,
        "completed": 3,
        "failed": 0
      },
      "jobs": [...]
    },
    "labValues": {
      "summary": {
        "total": 45,
        "critical": 2,
        "outOfRange": 8,
        "verified": 45,
        "byCategory": {
          "BASIC_METABOLIC": 8,
          "LIPID_PANEL": 6,
          "THYROID": 4
        }
      },
      "values": [...]
    },
    "analyses": {
      "summary": {
        "total": 2,
        "completed": 2,
        "pending": 0,
        "failed": 0,
        "requiresReview": 0,
        "types": ["FUNCTIONAL_MEDICINE", "TREND_ANALYSIS"],
        "latestCompletion": "2024-01-15T10:35:00Z"
      },
      "results": [...]
    }
  },
  "message": "Document status retrieved successfully"
}
```

### PATCH `/api/documents/status/[id]`

Update document properties.

#### Request Body

```json
{
  "documentType": "LAB_REPORT",
  "labType": "QUEST",
  "containsPHI": true,
  "tags": ["urgent", "follow-up"],
  "metadata": {
    "notes": "High priority case",
    "category": "cardiovascular"
  }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details or validation errors"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created successfully
- `202`: Accepted (for async operations)
- `400`: Bad request / validation error
- `401`: Authentication required
- `403`: Forbidden / insufficient permissions
- `404`: Resource not found
- `409`: Conflict (e.g., already processing)
- `429`: Rate limit exceeded
- `500`: Internal server error

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Default**: 100 requests per 15-minute window per user
- **Upload endpoint**: 50 requests per 15-minute window per user
- **Processing endpoint**: 20 requests per 15-minute window per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

## WebSocket Events

Real-time updates are available via WebSocket connection at `/socket.io`.

### Client Events

#### Subscribe to Document Updates

```javascript
socket.emit('subscribe:document', documentId);
```

#### Unsubscribe from Document Updates

```javascript
socket.emit('unsubscribe:document', documentId);
```

#### Request Document Status

```javascript
socket.emit('request:document-status', documentId);
```

#### Request Queue Status

```javascript
socket.emit('request:queue-status');
```

### Server Events

#### Document Progress Update

```javascript
socket.on('document:progress', (update) => {
  console.log('Progress update:', update);
  // {
  //   documentId: "doc_12345",
  //   clientId: "client_67890",
  //   status: "PROCESSING",
  //   progress: 45,
  //   currentStep: "OCR_EXTRACTION",
  //   estimatedCompletion: "2024-01-15T10:35:00Z"
  // }
});
```

#### Analysis Update

```javascript
socket.on('analysis:update', (update) => {
  console.log('Analysis update:', update);
  // {
  //   documentId: "doc_12345",
  //   clientId: "client_67890",
  //   analysisId: "analysis_12345",
  //   analysisType: "FUNCTIONAL_MEDICINE",
  //   status: "COMPLETED",
  //   confidence: 0.92,
  //   findings: [...],
  //   criticalValues: [...]
  // }
});
```

#### Notifications

```javascript
socket.on('notification', (notification) => {
  console.log('Notification:', notification);
  // {
  //   type: "SUCCESS",
  //   title: "Document Processed",
  //   message: "Lab results have been successfully processed",
  //   data: { documentId: "doc_12345" },
  //   timestamp: "2024-01-15T10:35:00Z"
  // }
});
```

## Data Models

### Document Model

```typescript
interface Document {
  id: string;
  clientId: string;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  storageProvider: 'LOCAL' | 'S3' | 'CLOUDINARY';
  storageKey?: string;
  documentType: DocumentType;
  labType?: LabType;
  status: ProcessingStatus;
  processingError?: string;
  extractedText?: string;
  structuredData?: any;
  ocrConfidence?: number;
  ocrProvider?: string;
  aiAnalysis?: any;
  analysisStatus: AnalysisStatus;
  analysisDate?: Date;
  isEncrypted: boolean;
  containsPHI: boolean;
  phiTypes?: string[];
  tags: string[];
  metadata?: any;
  uploadedAt: Date;
  processedAt?: Date;
  lastAccessedAt?: Date;
}
```

### Lab Value Model

```typescript
interface LabValue {
  id: string;
  documentId: string;
  clientId: string;
  testName: string;
  testCode?: string;
  category: LabCategory;
  subcategory?: string;
  panel?: string;
  value: string;
  numericValue?: number;
  unit?: string;
  referenceRange?: any;
  conventionalLow?: number;
  conventionalHigh?: number;
  functionalLow?: number;
  functionalHigh?: number;
  flag?: string;
  isOutOfRange: boolean;
  isCritical: boolean;
  severity: Severity;
  labName?: string;
  labLocation?: string;
  collectionDate?: Date;
  reportDate?: Date;
  extractionMethod?: string;
  confidence?: number;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Document Analysis Model

```typescript
interface DocumentAnalysis {
  id: string;
  documentId: string;
  clientId: string;
  analysisType: AnalysisType;
  provider: string;
  modelVersion?: string;
  patterns?: any[];
  findings?: any[];
  criticalValues?: any[];
  recommendations?: any[];
  insights?: any[];
  systemAssessment?: any;
  rootCauses?: any[];
  interactions?: any[];
  trends?: any[];
  confidence?: number;
  reliability?: string;
  limitations: string[];
  processingTime?: number;
  tokens?: number;
  cost?: number;
  status: AnalysisStatus;
  errorMessage?: string;
  reviewRequired: boolean;
  reviewedAt?: Date;
  reviewedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}
```

## Examples

### Complete Document Processing Workflow

```javascript
// 1. Upload document
const formData = new FormData();
formData.append('file', file);
formData.append('clientId', 'client_12345');
formData.append('documentType', 'LAB_REPORT');
formData.append('labType', 'LABCORP');

const uploadResponse = await fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { data: { document } } = await uploadResponse.json();
const documentId = document.id;

// 2. Subscribe to real-time updates
socket.emit('subscribe:document', documentId);

// 3. Monitor progress
socket.on('document:progress', (update) => {
  console.log(`Processing ${update.progress}% complete`);
  if (update.status === 'COMPLETED') {
    // Document processing finished
    triggerAnalysis(documentId);
  }
});

// 4. Trigger analysis when processing is complete
async function triggerAnalysis(documentId) {
  const analysisResponse = await fetch('/api/documents/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      documentId,
      analysisType: 'FUNCTIONAL_MEDICINE',
      options: {
        includeRecommendations: true,
        includeTrends: true,
        compareWithPrevious: true
      }
    })
  });
  
  const analysisData = await analysisResponse.json();
  console.log('Analysis queued:', analysisData.data.analysisId);
}

// 5. Monitor analysis progress
socket.on('analysis:update', (update) => {
  if (update.status === 'COMPLETED') {
    console.log('Analysis completed with confidence:', update.confidence);
    // Fetch complete document status
    fetchDocumentStatus(documentId);
  }
});

// 6. Get complete status
async function fetchDocumentStatus(documentId) {
  const statusResponse = await fetch(`/api/documents/status/${documentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const statusData = await statusResponse.json();
  console.log('Complete document status:', statusData.data);
}
```

### Batch Processing Multiple Documents

```javascript
async function processBatchDocuments(clientId, files) {
  const results = [];
  
  // Upload all documents
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('clientId', clientId);
    formData.append('documentType', detectDocumentType(file.name));
    
    const response = await fetch('/api/documents/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const { data } = await response.json();
    results.push(data.document);
  }
  
  // Monitor all documents
  results.forEach(doc => {
    socket.emit('subscribe:document', doc.id);
  });
  
  // Check processing status periodically
  const checkInterval = setInterval(async () => {
    const processingResponse = await fetch(`/api/documents/process?clientId=${clientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const { data } = await processingResponse.json();
    const stillProcessing = data.summary.pending + data.summary.active;
    
    if (stillProcessing === 0) {
      clearInterval(checkInterval);
      console.log('All documents processed!');
      
      // Trigger analyses for all completed documents
      for (const doc of results) {
        await triggerAnalysis(doc.id);
      }
    }
  }, 5000);
}
```

This API provides a comprehensive solution for medical document processing with real-time updates, robust error handling, and HIPAA-compliant audit logging.
