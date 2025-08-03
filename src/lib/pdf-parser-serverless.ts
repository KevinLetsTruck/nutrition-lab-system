// pdfjs will be loaded dynamically to avoid build issues
let pdfjsLib: any = null;

export interface ParsedPDF {
  text: string;
  pageCount: number;
  metadata?: any;
}

export async function parsePDFServerless(pdfBuffer: Buffer): Promise<ParsedPDF> {
  try {
    console.log('[PDF-PARSER-SERVERLESS] Starting PDF parsing with pdfjs-dist');
    
    // Dynamically import pdfjs to avoid build issues
    if (!pdfjsLib) {
      try {
        // Try the legacy build first for Node.js environments
        pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        console.log('[PDF-PARSER-SERVERLESS] Loaded legacy pdfjs build');
      } catch (e) {
        // Fallback to regular build
        pdfjsLib = await import('pdfjs-dist');
        console.log('[PDF-PARSER-SERVERLESS] Loaded regular pdfjs build');
      }
      
      // Configure for serverless
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = false;
      }
    }
    
    // Convert Buffer to Uint8Array for pdfjs
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      // Disable web workers in serverless environment
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    console.log(`[PDF-PARSER-SERVERLESS] PDF loaded successfully. Pages: ${pdf.numPages}`);
    
    let fullText = '';
    const pageTexts: string[] = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => {
            // Check if item has the text property (it's a TextItem)
            if ('str' in item) {
              return item.str;
            }
            return '';
          })
          .filter((text: string) => text.length > 0)
          .join(' ');
        
        pageTexts.push(pageText);
        fullText += pageText + '\n\n';
        
        console.log(`[PDF-PARSER-SERVERLESS] Extracted text from page ${pageNum}, length: ${pageText.length}`);
      } catch (pageError) {
        console.error(`[PDF-PARSER-SERVERLESS] Error extracting text from page ${pageNum}:`, pageError);
        // Continue with other pages even if one fails
      }
    }
    
    // Get metadata if available
    let metadata;
    try {
      metadata = await pdf.getMetadata();
      console.log('[PDF-PARSER-SERVERLESS] PDF metadata extracted:', metadata.info);
    } catch (metaError) {
      console.log('[PDF-PARSER-SERVERLESS] Could not extract metadata:', metaError);
    }
    
    // Clean up the text
    fullText = fullText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .trim();
    
    console.log(`[PDF-PARSER-SERVERLESS] PDF parsing complete. Total text length: ${fullText.length}`);
    
    return {
      text: fullText,
      pageCount: pdf.numPages,
      metadata: metadata?.info || {}
    };
    
  } catch (error) {
    console.error('[PDF-PARSER-SERVERLESS] PDF parsing failed:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to extract specific sections from NAQ documents
export function extractNAQSections(pdfText: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  // Common NAQ section patterns
  const sectionPatterns = [
    { name: 'symptoms', pattern: /symptom.*?questionnaire/i },
    { name: 'digestive', pattern: /digestive.*?health|gut.*?health/i },
    { name: 'energy', pattern: /energy.*?fatigue/i },
    { name: 'hormonal', pattern: /hormonal.*?balance/i },
    { name: 'immune', pattern: /immune.*?system/i },
    { name: 'detox', pattern: /detox.*?liver/i },
    { name: 'neurological', pattern: /brain.*?nervous/i }
  ];
  
  for (const { name, pattern } of sectionPatterns) {
    const match = pdfText.match(new RegExp(`${pattern.source}[\\s\\S]*?(?=\\n\\n|$)`, 'i'));
    if (match) {
      sections[name] = match[0].trim();
    }
  }
  
  return sections;
}

// Helper function to detect document type from text
export function detectDocumentType(pdfText: string): string {
  const lowercaseText = pdfText.toLowerCase();
  
  if (lowercaseText.includes('nutritional assessment questionnaire') || 
      lowercaseText.includes('naq')) {
    return 'NAQ';
  }
  
  if (lowercaseText.includes('nutriq') || 
      lowercaseText.includes('symptom burden')) {
    return 'NutriQ';
  }
  
  if (lowercaseText.includes('kbmo') || 
      lowercaseText.includes('food sensitivity')) {
    return 'KBMO';
  }
  
  if (lowercaseText.includes('dutch') || 
      lowercaseText.includes('hormone test')) {
    return 'DUTCH';
  }
  
  if (lowercaseText.includes('blood chemistry') || 
      lowercaseText.includes('cbc') ||
      lowercaseText.includes('comprehensive metabolic')) {
    return 'Blood Chemistry';
  }
  
  return 'Unknown';
}