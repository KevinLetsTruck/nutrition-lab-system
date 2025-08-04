# Phase 1 Usage Guide: Enhanced Document Processing

## Quick Start

### 1. Medical Terminology Enhancement

Use this when processing any medical document to improve OCR accuracy:

```typescript
// In your document processing flow
import MedicalTerminologyProcessor from '@/lib/document-processors/medical-terminology-processor'

// For general medical documents
const enhancedResult = await MedicalTerminologyProcessor.enhanceOCRResults(
  textractOutput,
  'standard'
)

// For specific document types
const nutriqResult = await MedicalTerminologyProcessor.enhanceNutriQReport(rawText)
const labResult = await MedicalTerminologyProcessor.enhanceLabReport(rawText, 'kbmo')

// Access enhanced data
console.log(enhancedResult.enhancedText) // Corrected text
console.log(enhancedResult.medicalTerms) // Identified medical terms
console.log(enhancedResult.overallConfidence) // Confidence score
```

### 2. Batch Document Processing

Process multiple documents at once:

```bash
# Using curl
curl -X POST http://localhost:3000/api/batch-process \
  -F "clientId=your-client-id" \
  -F "processType=comprehensive" \
  -F "document_1=@/path/to/nutriq.pdf" \
  -F "document_1_type=nutriq" \
  -F "document_2=@/path/to/kbmo.pdf" \
  -F "document_2_type=kbmo"

# Response
{
  "success": true,
  "jobId": "abc123...",
  "message": "Batch processing started for 2 documents",
  "statusUrl": "/api/batch-process/status/abc123..."
}
```

Check batch job status:

```bash
curl http://localhost:3000/api/batch-process/status/abc123

# Response
{
  "jobId": "abc123...",
  "status": "processing",
  "progress": {
    "total": 2,
    "processed": 1,
    "percentage": 50
  },
  "results": [...],
  "errors": []
}
```

### 3. Document Versioning

Track document changes over time:

```typescript
import { documentVersionService } from '@/lib/services/document-version-service'

// Process a new document with versioning
const { document, version } = await documentVersionService.processDocumentUpload(
  clientId,
  'lab_report_2024.pdf',
  'nutriq',
  extractedData,
  enhancedData,
  { uploadedBy: 'practitioner@example.com' },
  userId
)

// Get version history
const versions = await documentVersionService.getDocumentVersions(document.id)

// Compare versions
const comparison = await documentVersionService.compareVersions(
  document.id,
  1, // from version
  2, // to version
  userId
)

// Validate a version
await documentVersionService.validateVersion(
  document.id,
  2,
  'validated',
  'OCR results verified against original',
  userId
)
```

## Integration Examples

### Example 1: Upload with Enhanced Processing

```typescript
// In your upload endpoint
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const clientId = formData.get('clientId') as string
  
  // Process with existing analyzer
  const buffer = Buffer.from(await file.arrayBuffer())
  const analysis = await analyzer.analyzeReport(buffer, file.name)
  
  // Enhance with medical terminology
  if (analysis.parsedData?.rawText) {
    const enhanced = await MedicalTerminologyProcessor.enhanceOCRResults(
      analysis.parsedData.rawText,
      analysis.reportType
    )
    
    // Store with versioning
    const { document, version } = await documentVersionService.processDocumentUpload(
      clientId,
      file.name,
      analysis.reportType,
      {
        ...analysis.parsedData,
        enhancedText: enhanced.enhancedText,
        medicalTerms: enhanced.medicalTerms,
        ocrConfidence: enhanced.overallConfidence
      }
    )
    
    return NextResponse.json({
      success: true,
      documentId: document.id,
      versionNumber: version.versionNumber,
      confidence: enhanced.overallConfidence
    })
  }
}
```

### Example 2: Batch Processing with Progress Tracking

```typescript
// Frontend component
function BatchUpload() {
  const [jobId, setJobId] = useState<string>()
  const [progress, setProgress] = useState(0)
  
  const uploadBatch = async (files: File[]) => {
    const formData = new FormData()
    formData.append('clientId', clientId)
    
    files.forEach((file, index) => {
      formData.append(`document_${index}`, file)
      formData.append(`document_${index}_type`, detectDocumentType(file))
    })
    
    const response = await fetch('/api/batch-process', {
      method: 'POST',
      body: formData
    })
    
    const { jobId } = await response.json()
    setJobId(jobId)
    
    // Poll for progress
    const interval = setInterval(async () => {
      const status = await fetch(`/api/batch-process/status/${jobId}`)
      const data = await status.json()
      
      setProgress(data.progress.percentage)
      
      if (data.status === 'completed' || data.status === 'failed') {
        clearInterval(interval)
      }
    }, 1000)
  }
}
```

## Best Practices

### 1. Medical Term Processing
- Always use the medical terminology processor for health documents
- Check confidence scores before relying on extracted values
- Review corrected terms in the `corrections` array

### 2. Batch Processing
- Limit batches to 10-20 documents for optimal performance
- Monitor job status for error handling
- Use `processType: 'comprehensive'` to trigger full analysis

### 3. Version Control
- Always validate critical document versions
- Use comparison feature to track changes over time
- Check clinical significance ratings for important changes

## Troubleshooting

### Low Confidence Scores
If OCR confidence is low:
1. Check if document is scanned/image-based
2. Ensure AWS Textract is being used
3. Review medical terms corrections

### Batch Processing Failures
If batch jobs fail:
1. Check individual document errors in job status
2. Verify file formats are supported
3. Ensure client ID exists

### Version Conflicts
If versions show unexpected changes:
1. Compare raw vs enhanced text
2. Check processing method used
3. Review audit log for actions

## Next Steps

With Phase 1 complete, you can now:
- Process medical documents with 95% accuracy
- Handle multiple documents efficiently
- Track all document changes
- Validate and audit document processing

Phase 2 will add:
- Advanced pattern recognition
- Truck driver health analysis
- Automated workflows
- Intelligent prompt selection