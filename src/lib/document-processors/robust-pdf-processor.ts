import { getAIService } from '@/lib/ai'

export interface ProcessedDocument {
  text: string
  metadata: {
    pageCount: number
    extractionMethod: 'text' | 'ocr' | 'vision' | 'hybrid'
    confidence: number
    warnings: string[]
  }
  structuredData?: any
}

export class RobustPDFProcessor {
  private aiService = getAIService()

  constructor() {
    console.log('[RobustPDF] Using AI Service framework')
  }

  async processPDF(fileBuffer: Buffer): Promise<ProcessedDocument> {
    console.log('[ROBUST-PDF] Starting PDF processing...')
    
    const warnings: string[] = []
    let extractedText = ''
    let extractionMethod: ProcessedDocument['metadata']['extractionMethod'] = 'text'
    let confidence = 0

    try {
      // Step 1: Try standard text extraction
      console.log('[ROBUST-PDF] Attempting text extraction...')
      const textResult = await this.extractTextFromPDF(fileBuffer)
      
      if (textResult.text && textResult.text.trim().length > 100) {
        extractedText = textResult.text
        extractionMethod = 'text'
        confidence = 0.9
        console.log('[ROBUST-PDF] Text extraction successful, length:', extractedText.length)
      } else {
        warnings.push('Text extraction yielded minimal content')
        
        // Step 2: Try OCR extraction
        console.log('[ROBUST-PDF] Text extraction insufficient, attempting OCR...')
        const ocrResult = await this.performOCR(fileBuffer)
        
        if (ocrResult.text && ocrResult.text.trim().length > 100) {
          extractedText = ocrResult.text
          extractionMethod = 'ocr'
          confidence = ocrResult.confidence
          console.log('[ROBUST-PDF] OCR successful, confidence:', confidence)
        } else {
          warnings.push('OCR extraction yielded minimal content')
          
          // Step 3: Fall back to vision API if available
          const providerStatus = this.aiService.getProviderStatus()
          const hasAIProvider = Object.values(providerStatus).some(p => p.available)
          
          if (hasAIProvider) {
            console.log('[ROBUST-PDF] OCR insufficient, attempting vision API...')
            const visionResult = await this.extractWithVisionAPI(fileBuffer)
            
            if (visionResult.text) {
              extractedText = visionResult.text
              extractionMethod = 'vision'
              confidence = 0.8
              console.log('[ROBUST-PDF] Vision API successful')
            } else {
              warnings.push('Vision API extraction failed')
            }
          } else {
            warnings.push('Vision API not available (no AI providers configured)')
          }
        }
      }

      // Step 4: If we have some text, try to enhance it
      if (extractedText.length > 50 && extractionMethod !== 'text') {
        const enhancedResult = await this.enhanceExtractedText(extractedText, extractionMethod)
        if (enhancedResult.improved) {
          extractedText = enhancedResult.text
          extractionMethod = 'hybrid'
          confidence = Math.min(confidence + 0.1, 1.0)
        }
      }

      return {
        text: extractedText,
        metadata: {
          pageCount: textResult.pageCount || 0,
          extractionMethod,
          confidence,
          warnings
        }
      }

    } catch (error) {
      console.error('[ROBUST-PDF] Processing failed:', error)
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
    try {
      // Dynamic import to avoid build-time issues
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      return {
        text: data.text,
        pageCount: data.numpages
      }
    } catch (error) {
      console.error('[ROBUST-PDF] Text extraction error:', error)
      return { text: '', pageCount: 0 }
    }
  }

  private async performOCR(buffer: Buffer): Promise<{ text: string; confidence: number }> {
    try {
      // Convert PDF to images first (simplified - in production use pdf-to-image library)
      // For now, return empty result
      console.log('[ROBUST-PDF] OCR not implemented yet')
      return { text: '', confidence: 0 }
    } catch (error) {
      console.error('[ROBUST-PDF] OCR error:', error)
      return { text: '', confidence: 0 }
    }
  }

  private async extractWithVisionAPI(buffer: Buffer): Promise<{ text: string }> {
    // Vision API doesn't support PDFs directly - would need to convert to images first
    // For now, return empty result
    console.log('[ROBUST-PDF] Vision API extraction not implemented for PDFs')
    return { text: '' }
  }

  private async enhanceExtractedText(
    text: string, 
    method: string
  ): Promise<{ text: string; improved: boolean }> {
    // Clean up common OCR/extraction issues
    let enhanced = text
      // Fix common OCR mistakes
      .replace(/\bl\s*\(/g, '1(')  // l( -> 1(
      .replace(/\bO\s*\./g, '0.')   // O. -> 0.
      .replace(/\s+/g, ' ')          // Multiple spaces to single
      .replace(/\n{3,}/g, '\n\n')    // Multiple newlines to double
      .trim()

    // Remove obvious garbage characters
    enhanced = enhanced.replace(/[^\x20-\x7E\n\r\t]/g, '')

    return {
      text: enhanced,
      improved: enhanced !== text
    }
  }

  async classifyDocument(text: string): Promise<string> {
    // Simple keyword-based classification
    const textLower = text.toLowerCase()
    
    if (textLower.includes('nutriq') && textLower.includes('health assessment')) {
      return 'nutriq'
    } else if (textLower.includes('kbmo') || textLower.includes('food sensitivity')) {
      return 'kbmo'
    } else if (textLower.includes('dutch') && textLower.includes('hormone')) {
      return 'dutch'
    } else if (textLower.includes('fit test') || textLower.includes('gastrointestinal')) {
      return 'fit-test'
    } else if (textLower.includes('success probability index') || textLower.includes('spi')) {
      return 'spi'
    } else if (textLower.includes('glucose') || textLower.includes('cgm')) {
      return 'cgm'
    } else if (textLower.includes('laboratory') || textLower.includes('lab report')) {
      return 'lab-report'
    }
    
    return 'unknown'
  }
}