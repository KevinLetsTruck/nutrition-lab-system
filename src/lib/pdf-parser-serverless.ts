// Simple PDF text extraction for serverless environments
// This implementation avoids DOM dependencies that cause issues in Vercel

export interface ParsedPDF {
  text: string;
  pageCount: number;
  metadata?: any;
}

export async function parsePDFServerless(pdfBuffer: Buffer): Promise<ParsedPDF> {
  try {
    console.log('[PDF-PARSER-SERVERLESS] Using enhanced PDF text extraction');
    
    // Convert buffer to string and look for text content
    const bufferString = pdfBuffer.toString('latin1');
    
    // Method 1: Extract text between BT (Begin Text) and ET (End Text) PDF operators
    const textMatches = bufferString.match(/BT[\s\S]*?ET/g) || [];
    let extractedText = '';
    
    for (const match of textMatches) {
      // Extract text within parentheses (PDF text strings)
      const stringMatches = match.match(/\(([^)]+)\)/g) || [];
      for (const str of stringMatches) {
        // Remove parentheses and add to text
        const cleanStr = str.slice(1, -1)
          .replace(/\\(\d{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        extractedText += cleanStr + ' ';
      }
    }
    
    // Method 2: If no text found with BT/ET, try alternative extraction
    if (extractedText.length < 100) {
      console.log('[PDF-PARSER-SERVERLESS] Primary extraction found little text, trying alternative method');
      
      // Look for readable ASCII text chunks with better filtering
      const readableChunks = bufferString.match(/[\x20-\x7E\s]{30,}/g) || [];
      const alternativeText = readableChunks
        .filter(chunk => {
          // Filter out binary data and PDF operators, but keep assessment content
          const isPDFOperator = chunk.includes('obj') || 
                               chunk.includes('endobj') || 
                               chunk.includes('stream') ||
                               chunk.includes('xref') ||
                               chunk.includes('trailer') ||
                               chunk.includes('startxref');
          
          const isAssessmentContent = chunk.includes('NAQ') || 
                                     chunk.includes('Symptom') || 
                                     chunk.includes('Assessment') || 
                                     chunk.includes('Question') ||
                                     chunk.includes('Score') ||
                                     chunk.includes('Total');
          
          return !isPDFOperator && chunk.trim().length > 20 && (isAssessmentContent || chunk.length > 50);
        })
        .join(' ')
        .trim();
      
      if (alternativeText.length > extractedText.length) {
        extractedText = alternativeText;
      }
    }
    
    // Method 3: Direct text extraction for assessment documents
    if (extractedText.length < 100) {
      console.log('[PDF-PARSER-SERVERLESS] Trying direct text extraction for assessment documents');
      
      // Look for specific assessment patterns
      const assessmentPatterns = [
        /NAQ[\s\S]*?Assessment[\s\S]*?Report/gi,
        /Symptom[\s\S]*?Burden[\s\S]*?Questionnaire/gi,
        /Question[\s\S]*?\d+[\s\S]*?Answer/gi,
        /Score[\s\S]*?\d+[\s\S]*?Total/gi
      ];
      
      for (const pattern of assessmentPatterns) {
        const matches = bufferString.match(pattern);
        if (matches && matches.length > 0) {
          extractedText += matches.join(' ') + ' ';
        }
      }
    }
    
    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .trim();
    
    // Estimate page count (rough approximation)
    const pageMatches = bufferString.match(/\/Type\s*\/Page[^s]/g) || [];
    const pageCount = Math.max(1, pageMatches.length);
    
    console.log(`[PDF-PARSER-SERVERLESS] Extracted ${extractedText.length} characters from ${pageCount} pages`);
    
    return {
      text: extractedText,
      pageCount: pageCount,
      metadata: {
        method: 'simplified-extraction'
      }
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