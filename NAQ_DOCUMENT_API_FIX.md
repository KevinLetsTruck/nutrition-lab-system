# NAQ Analysis Document API Fix

## Problem
The NAQ enhanced analysis was failing with a TypeError when trying to analyze PDF files. This was happening because the system was trying to convert PDFs to images for analysis, similar to the issue we previously encountered.

## Solution
Updated the PDF parser to use Claude's document API instead of image conversion:

### Changes Made
1. **PDF Parser Update** (`src/lib/lab-analyzers/pdf-parser.ts`):
   - Changed from `analyzePDFPagesAsImages` to `analyzeWithDocument`
   - Now sends the PDF directly to Claude as a document (base64 encoded)
   - Added fallback to image-based analysis if document API fails
   - Updated prompts to specifically mention NAQ/NutriQ assessments

### Before:
```typescript
// Convert PDF pages to images
const pageImages = await this.convertPDFToImages(pdfBuffer)
visionAnalysisText = await this.claudeClient.analyzePDFPagesAsImages(
  pageImages,
  systemPrompt,
  text
)
```

### After:
```typescript
// Use Claude's document API directly with the PDF
const pdfBase64 = pdfBuffer.toString('base64')
visionAnalysisText = await this.claudeClient.analyzeWithDocument(
  documentPrompt,
  {
    type: 'document',
    source: {
      type: 'base64',
      media_type: 'application/pdf',
      data: pdfBase64
    }
  },
  systemPrompt
)
```

## Benefits
1. **Better Accuracy**: Document API is designed for PDFs and handles them more accurately
2. **Faster Processing**: No need to convert PDFs to images
3. **More Reliable**: Direct PDF analysis without intermediate conversion steps
4. **Better Text Extraction**: Document API better understands PDF structure

## Testing
Once deployed (in ~2-3 minutes), test at:
- https://nutrition-lab-system-lets-truck.vercel.app/naq-enhanced-demo

Upload a NAQ PDF (like Symptom-Burden-Bar-Graph-17 (1).pdf) and it should now analyze correctly without the TypeError.

## Next Steps
1. Monitor the deployment
2. Test with various NAQ/NutriQ PDFs
3. If successful, integrate into the main quick-analysis page