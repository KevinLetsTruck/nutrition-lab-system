# Robust Universal Analysis System

## Overview
This is a production-ready document analysis system that handles multiple file formats and provides reliable functional medicine analysis through Claude AI.

## Key Features

### 1. Multiple Input Methods
- **File Upload**: Drag & drop or click to upload
- **Direct Text**: Paste document content directly
- **Multiple Formats**: PDF, Images (JPG, PNG), Excel, CSV, Text files

### 2. Intelligent Processing
- **Auto-detection**: Automatically detects document type
- **Multiple Extraction Methods**: 
  - PDF text extraction
  - OCR via Claude Vision API
  - Direct text parsing
  - Spreadsheet parsing
- **Fallback Mechanisms**: If one method fails, tries alternatives

### 3. Robust Error Handling
- Clear error messages
- Processing status updates
- Detailed logging
- Graceful degradation

## API Endpoints

### `/api/analyze-universal` (NEW - Recommended)
The most robust endpoint that handles all formats:

```javascript
// File upload
const formData = new FormData()
formData.append('file', file)
formData.append('documentType', 'auto') // or 'nutriq', 'kbmo', etc.
formData.append('clientName', 'John Smith')

const response = await fetch('/api/analyze-universal', {
  method: 'POST',
  body: formData
})

// Text input
const response = await fetch('/api/analyze-universal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Document text here...',
    documentType: 'nutriq',
    clientName: 'John Smith'
  })
})
```

### `/api/analyze-direct` (Simple text analysis)
For when you have text and want direct analysis:

```javascript
const response = await fetch('/api/analyze-direct', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'NutriQ scores...',
    documentType: 'nutriq'
  })
})
```

## User Interface

### Main Analysis Page: `/analyze`
A comprehensive UI with:
- Tab interface for different input methods
- Real-time processing status
- Detailed results display
- Error handling with user-friendly messages
- Processing confidence indicators

## Document Types Supported

1. **NutriQ / NAQ**: Nutritional assessments
2. **KBMO**: Food sensitivity reports
3. **Dutch**: Hormone test results
4. **FIT Test**: Intestinal health markers
5. **CGM**: Continuous glucose monitoring data
6. **Generic**: Any health-related document

## Architecture

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│  User Interface │────▶│ Universal Processor  │────▶│  Claude AI API  │
│   (/analyze)    │     │ - Format detection   │     │ - Analysis      │
└─────────────────┘     │ - Text extraction    │     │ - Insights      │
                        │ - Fallback methods   │     └─────────────────┘
                        └──────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │     Database         │
                        │ - Lab reports        │
                        │ - Analysis results   │
                        └──────────────────────┘
```

## Processing Flow

1. **Input Reception**
   - Accept file upload, text, or base64 data
   - Detect format from MIME type, extension, or content

2. **Document Processing**
   - Try primary extraction method
   - Fall back to alternatives if needed
   - Track confidence and warnings

3. **AI Analysis**
   - Send extracted text to Claude
   - Use document-specific prompts
   - Return structured or narrative results

4. **Result Storage**
   - Save to database if client ID provided
   - Store type-specific data (e.g., NutriQ scores)
   - Track processing metadata

## Error Recovery

The system handles common issues:
- **Corrupted PDFs**: Falls back to image extraction
- **Missing dependencies**: Uses alternative methods
- **API failures**: Provides detailed error messages
- **Empty documents**: Clear user feedback

## Usage Examples

### Example 1: Upload a PDF
1. Go to `/analyze`
2. Drag and drop your PDF file
3. Select document type (or leave as auto-detect)
4. Click "Analyze Document"
5. View results with confidence scores

### Example 2: Paste Text
1. Go to `/analyze`
2. Click "Text" tab
3. Paste your lab results
4. Select appropriate document type
5. Click "Analyze Document"

### Example 3: Programmatic Usage
```javascript
// In your application
async function analyzeDocument(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('documentType', 'auto')
  
  const response = await fetch('/api/analyze-universal', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    console.error('Analysis failed:', error.details)
    return null
  }
  
  const result = await response.json()
  return result.result
}
```

## Advantages Over Previous System

1. **No External Dependencies**: Doesn't require ImageMagick or other system tools
2. **Multiple Input Methods**: Not limited to PDFs
3. **Better Error Messages**: Users know exactly what went wrong
4. **Fallback Mechanisms**: Tries multiple extraction methods
5. **Confidence Scoring**: Shows how reliable the extraction was
6. **Real-time Status**: Users see progress during processing

## Next Steps

1. **Add URL Support**: Fetch and analyze documents from URLs
2. **Batch Processing**: Handle multiple documents at once
3. **Enhanced OCR**: Integrate with dedicated OCR services
4. **Template Recognition**: Pre-built templates for common lab formats
5. **Historical Comparison**: Compare results over time

## Testing

### Test Direct Text Analysis
```bash
curl -X POST http://localhost:3000/api/analyze-direct \
  -H "Content-Type: application/json" \
  -d '{"text": "NutriQ Score: 45", "documentType": "nutriq"}'
```

### Test Universal Analysis
```bash
# With text
curl -X POST http://localhost:3000/api/analyze-universal \
  -H "Content-Type: application/json" \
  -d '{"text": "Lab results here...", "documentType": "auto"}'

# With file (using form data)
curl -X POST http://localhost:3000/api/analyze-universal \
  -F "file=@document.pdf" \
  -F "documentType=auto"
```

## Deployment Considerations

1. **Environment Variables**
   - Ensure `ANTHROPIC_API_KEY` is set
   - Configure database credentials

2. **File Size Limits**
   - Default: 10MB per file
   - Adjust in Vercel/hosting settings if needed

3. **Rate Limiting**
   - Consider adding rate limits for production
   - Monitor Claude API usage

4. **Caching**
   - Cache analysis results by document hash
   - Reduce duplicate API calls

This system is designed to work reliably in production with minimal configuration and maximum flexibility.