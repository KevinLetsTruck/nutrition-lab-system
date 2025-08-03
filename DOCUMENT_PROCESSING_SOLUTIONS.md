# Robust Document Processing Solutions for Nutrition Lab System

## Current Problem
- Most documents are scanned PDFs (image-based)
- `pdf2pic` requires system dependencies not available in Vercel
- Current system only works with text-based PDFs in production

## Recommended Solutions (Ranked by Effectiveness)

### 1. **AWS Textract** (Recommended) ⭐
**What it does:** Extracts text, tables, and forms from scanned documents using AI
**Pros:**
- Handles any document type (scanned, photos, PDFs)
- Extracts tables and forms intelligently
- Works perfectly with medical/lab reports
- Serverless-friendly
- Pay-per-use pricing (~$1.50 per 1000 pages)

**Implementation:**
```javascript
import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";

async function extractWithTextract(pdfBuffer: Buffer) {
  const client = new TextractClient({ region: "us-east-1" });
  const command = new AnalyzeDocumentCommand({
    Document: { Bytes: pdfBuffer },
    FeatureTypes: ["TABLES", "FORMS"]
  });
  const response = await client.send(command);
  // Process extracted text, tables, and key-value pairs
}
```

### 2. **Google Cloud Document AI** ⭐
**What it does:** Advanced document understanding with pre-trained models
**Pros:**
- Specialized processors for healthcare documents
- Excellent table extraction
- Can identify specific document types
- ~$1.50 per 1000 pages

**Implementation:**
```javascript
const {DocumentProcessorServiceClient} = require('@google-cloud/documentai');

async function processWithDocumentAI(pdfBuffer: Buffer) {
  const client = new DocumentProcessorServiceClient();
  const request = {
    rawDocument: {
      content: pdfBuffer.toString('base64'),
      mimeType: 'application/pdf',
    },
  };
  const [result] = await client.processDocument(request);
  // Extract text, entities, and tables
}
```

### 3. **Azure Form Recognizer** (Now Azure AI Document Intelligence)
**What it does:** Extract text, key-value pairs, tables, and structures
**Pros:**
- Pre-built models for health documents
- Custom model training available
- Good accuracy for medical forms
- $1.50 per 1000 pages

### 4. **Hybrid Solution: PDF.js + Claude Vision** (Most Control)
**What it does:** Convert PDF to images client-side, then use Claude Vision
**Pros:**
- No external dependencies
- Works with your existing Claude API
- Full control over the process
- Can handle ANY document type

**Implementation Plan:**
1. Use PDF.js in the browser to convert PDF to images
2. Send images to your API
3. Use Claude Vision to extract text
4. Process with existing analyzers

```javascript
// Client-side (browser)
import * as pdfjsLib from 'pdfjs-dist';

async function convertPDFToImages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const images = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context, viewport }).promise;
    const imageData = canvas.toDataURL('image/png');
    images.push(imageData);
  }
  
  return images;
}

// Server-side - already have Claude Vision integration
```

### 5. **OCR.space API** (Budget Option)
**What it does:** Simple OCR service
**Pros:**
- Easy to implement
- 25,000 pages free per month
- Supports multiple languages
**Cons:**
- Less accurate for complex layouts
- Limited table extraction

## Recommended Implementation Strategy

### Phase 1: Immediate Solution (1-2 days)
Implement **PDF.js + Claude Vision** hybrid solution:
- Add PDF.js to frontend for client-side conversion
- Send base64 images to API instead of PDF buffer
- Use existing Claude Vision code
- This solves the problem immediately

### Phase 2: Production-Grade Solution (1 week)
Integrate **AWS Textract**:
- Better accuracy for medical documents
- Handles tables and forms properly
- More cost-effective at scale
- Keep Claude for analysis, use Textract for extraction

### Implementation Code Structure

```typescript
// src/lib/document-processors/document-processor.ts
interface DocumentProcessor {
  extractText(document: Buffer): Promise<ExtractedContent>;
  extractTables(document: Buffer): Promise<Table[]>;
  extractKeyValues(document: Buffer): Promise<KeyValuePair[]>;
}

// src/lib/document-processors/textract-processor.ts
export class TextractProcessor implements DocumentProcessor {
  async extractText(document: Buffer): Promise<ExtractedContent> {
    // AWS Textract implementation
  }
}

// src/lib/document-processors/claude-vision-processor.ts
export class ClaudeVisionProcessor implements DocumentProcessor {
  async extractText(images: string[]): Promise<ExtractedContent> {
    // Use existing Claude Vision code
  }
}

// Factory to choose processor based on environment/config
export class DocumentProcessorFactory {
  static getProcessor(type: 'textract' | 'claude' | 'documentai'): DocumentProcessor {
    // Return appropriate processor
  }
}
```

## Cost Analysis

For 1000 documents per month:
- **AWS Textract**: ~$15-20/month
- **Google Document AI**: ~$15-20/month
- **Azure Form Recognizer**: ~$15-20/month
- **Claude Vision (current)**: ~$30-50/month (more API calls)

## Recommended Action Plan

1. **Immediate** (Today):
   - Implement client-side PDF to image conversion
   - Update API to accept base64 images
   - Deploy to handle scanned documents

2. **Next Week**:
   - Set up AWS account and Textract
   - Implement Textract processor
   - Add fallback to Claude Vision

3. **Future Enhancement**:
   - Add document type detection
   - Implement specialized processors for different lab types
   - Cache extraction results

## Environment Variables Needed

```env
# For AWS Textract
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# For Google Document AI (alternative)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
GOOGLE_PROJECT_ID=your_project_id
GOOGLE_PROCESSOR_ID=your_processor_id

# Feature flags
USE_TEXTRACT=true
FALLBACK_TO_CLAUDE=true
```

## Summary

The most robust solution is a combination of:
1. **Client-side PDF to image conversion** (immediate fix)
2. **AWS Textract** for production text extraction
3. **Claude Vision** as a fallback and for analysis

This ensures you can handle:
- ✅ Scanned PDFs
- ✅ Image-based documents
- ✅ Photos of documents
- ✅ Text-based PDFs
- ✅ Complex medical forms and tables
- ✅ Any document format

The total cost would be minimal (~$20/month for 1000 documents) and you'd have a production-grade solution that handles any document type reliably.