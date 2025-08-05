import { Buffer } from 'buffer'
import ClaudeClient from '../claude-client'

export interface ProcessedDocument {
  text: string
  format: 'pdf' | 'image' | 'text' | 'excel' | 'csv' | 'unknown'
  confidence: number
  metadata: {
    pageCount?: number
    extractionMethod: string
    processingTime: number
    warnings: string[]
  }
  structuredData?: any
}

export class UniversalDocumentProcessor {
  private claudeClient: ClaudeClient
  
  constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }
  
  async processDocument(
    input: Buffer | string,
    mimeType?: string,
    fileName?: string
  ): Promise<ProcessedDocument> {
    const startTime = Date.now()
    const warnings: string[] = []
    
    console.log('[UNIVERSAL-PROCESSOR] Starting document processing...')
    console.log('[UNIVERSAL-PROCESSOR] Input type:', typeof input)
    console.log('[UNIVERSAL-PROCESSOR] MIME type:', mimeType)
    console.log('[UNIVERSAL-PROCESSOR] File name:', fileName)
    
    // If input is already text, return it
    if (typeof input === 'string') {
      return {
        text: input,
        format: 'text',
        confidence: 1.0,
        metadata: {
          extractionMethod: 'direct-text',
          processingTime: Date.now() - startTime,
          warnings
        }
      }
    }
    
    // Detect format from various sources
    const format = this.detectFormat(input, mimeType, fileName)
    console.log('[UNIVERSAL-PROCESSOR] Detected format:', format)
    
    let result: ProcessedDocument
    
    switch (format) {
      case 'pdf':
        result = await this.processPDF(input, warnings)
        break
        
      case 'image':
        result = await this.processImage(input, warnings)
        break
        
      case 'excel':
      case 'csv':
        result = await this.processSpreadsheet(input, format, warnings)
        break
        
      case 'text':
        result = await this.processText(input, warnings)
        break
        
      default:
        // Try multiple methods
        result = await this.processUnknown(input, warnings)
    }
    
    result.metadata.processingTime = Date.now() - startTime
    result.metadata.warnings = warnings
    
    console.log('[UNIVERSAL-PROCESSOR] Processing complete:', {
      format: result.format,
      textLength: result.text.length,
      confidence: result.confidence,
      warnings: warnings.length
    })
    
    return result
  }
  
  private detectFormat(
    buffer: Buffer,
    mimeType?: string,
    fileName?: string
  ): ProcessedDocument['format'] {
    // Check MIME type first
    if (mimeType) {
      if (mimeType.includes('pdf')) return 'pdf'
      if (mimeType.includes('image')) return 'image'
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel'
      if (mimeType.includes('csv')) return 'csv'
      if (mimeType.includes('text')) return 'text'
    }
    
    // Check file extension
    if (fileName) {
      const ext = fileName.toLowerCase().split('.').pop()
      if (ext === 'pdf') return 'pdf'
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) return 'image'
      if (['xlsx', 'xls'].includes(ext || '')) return 'excel'
      if (ext === 'csv') return 'csv'
      if (['txt', 'text'].includes(ext || '')) return 'text'
    }
    
    // Check file signature (magic bytes)
    const header = buffer.toString('hex', 0, Math.min(16, buffer.length)).toUpperCase()
    
    if (header.startsWith('255044462D')) return 'pdf' // %PDF-
    if (header.startsWith('FFD8FF')) return 'image' // JPEG
    if (header.startsWith('89504E47')) return 'image' // PNG
    if (header.startsWith('504B0304')) return 'excel' // ZIP (XLSX)
    
    // Check if it's readable text
    try {
      const text = buffer.toString('utf8', 0, Math.min(1000, buffer.length))
      const printableRatio = text.replace(/[^\x20-\x7E\n\r\t]/g, '').length / text.length
      if (printableRatio > 0.95) return 'text'
    } catch (e) {
      // Not valid UTF-8
    }
    
    return 'unknown'
  }
  
  private async processPDF(buffer: Buffer, warnings: string[]): Promise<ProcessedDocument> {
    console.log('[UNIVERSAL-PROCESSOR] Processing as PDF...')
    
    let text = ''
    let method = 'none'
    
    // Method 1: Try pdf-parse
    try {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)
      text = data.text
      method = 'pdf-parse'
      console.log('[UNIVERSAL-PROCESSOR] PDF parsed successfully with pdf-parse')
    } catch (error) {
      console.log('[UNIVERSAL-PROCESSOR] pdf-parse failed:', error)
      warnings.push('PDF text extraction failed, trying OCR')
    }
    
    // Method 2: If no text or error, try OCR via Claude Vision
    if (!text || text.length < 50) {
      try {
        text = await this.extractViaVision(buffer, 'pdf')
        method = 'vision-api'
        console.log('[UNIVERSAL-PROCESSOR] Extracted text via Claude Vision')
      } catch (error) {
        console.log('[UNIVERSAL-PROCESSOR] Vision extraction failed:', error)
        warnings.push('OCR extraction failed')
      }
    }
    
    return {
      text: text || '',
      format: 'pdf',
      confidence: text.length > 100 ? 0.9 : 0.5,
      metadata: {
        extractionMethod: method,
        processingTime: 0,
        warnings
      }
    }
  }
  
  private async processImage(buffer: Buffer, warnings: string[]): Promise<ProcessedDocument> {
    console.log('[UNIVERSAL-PROCESSOR] Processing as image...')
    
    try {
      const text = await this.extractViaVision(buffer, 'image')
      return {
        text,
        format: 'image',
        confidence: text.length > 50 ? 0.85 : 0.6,
        metadata: {
          extractionMethod: 'vision-api',
          processingTime: 0,
          warnings
        }
      }
    } catch (error) {
      console.error('[UNIVERSAL-PROCESSOR] Image processing failed:', error)
      warnings.push('Failed to extract text from image')
      
      return {
        text: '',
        format: 'image',
        confidence: 0,
        metadata: {
          extractionMethod: 'failed',
          processingTime: 0,
          warnings
        }
      }
    }
  }
  
  private async processSpreadsheet(
    buffer: Buffer, 
    format: 'excel' | 'csv',
    warnings: string[]
  ): Promise<ProcessedDocument> {
    console.log('[UNIVERSAL-PROCESSOR] Processing as spreadsheet...')
    
    let text = ''
    let structuredData: any = null
    
    if (format === 'csv') {
      try {
        text = buffer.toString('utf8')
        // Parse CSV into structured format
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0]?.split(',').map(h => h.trim())
        const rows = lines.slice(1).map(line => 
          line.split(',').map(cell => cell.trim())
        )
        
        structuredData = { headers, rows }
        
      } catch (error) {
        console.error('[UNIVERSAL-PROCESSOR] CSV parsing failed:', error)
        warnings.push('CSV parsing failed')
      }
    } else {
      // For Excel, we'd need a library like xlsx
      // For now, try to extract via vision
      try {
        text = await this.extractViaVision(buffer, 'document')
        warnings.push('Excel processed as image - install xlsx package for better results')
      } catch (error) {
        warnings.push('Excel processing not fully implemented')
      }
    }
    
    return {
      text,
      format,
      confidence: text.length > 50 ? 0.8 : 0.4,
      metadata: {
        extractionMethod: format === 'csv' ? 'direct-parse' : 'vision-api',
        processingTime: 0,
        warnings
      },
      structuredData
    }
  }
  
  private async processText(buffer: Buffer, warnings: string[]): Promise<ProcessedDocument> {
    console.log('[UNIVERSAL-PROCESSOR] Processing as text...')
    
    try {
      const text = buffer.toString('utf8')
      return {
        text,
        format: 'text',
        confidence: 1.0,
        metadata: {
          extractionMethod: 'direct-decode',
          processingTime: 0,
          warnings
        }
      }
    } catch (error) {
      console.error('[UNIVERSAL-PROCESSOR] Text decoding failed:', error)
      warnings.push('Failed to decode as UTF-8')
      
      // Try other encodings
      try {
        const text = buffer.toString('latin1')
        warnings.push('Decoded as Latin-1 instead of UTF-8')
        return {
          text,
          format: 'text',
          confidence: 0.8,
          metadata: {
            extractionMethod: 'latin1-decode',
            processingTime: 0,
            warnings
          }
        }
      } catch (e) {
        return {
          text: '',
          format: 'text',
          confidence: 0,
          metadata: {
            extractionMethod: 'failed',
            processingTime: 0,
            warnings
          }
        }
      }
    }
  }
  
  private async processUnknown(buffer: Buffer, warnings: string[]): Promise<ProcessedDocument> {
    console.log('[UNIVERSAL-PROCESSOR] Processing unknown format...')
    warnings.push('Unknown document format')
    
    // Try text extraction first
    const textResult = await this.processText(buffer, [])
    if (textResult.text && textResult.confidence > 0.5) {
      return { ...textResult, format: 'unknown' }
    }
    
    // Try vision API as last resort
    try {
      const text = await this.extractViaVision(buffer, 'document')
      return {
        text,
        format: 'unknown',
        confidence: 0.6,
        metadata: {
          extractionMethod: 'vision-api-fallback',
          processingTime: 0,
          warnings
        }
      }
    } catch (error) {
      console.error('[UNIVERSAL-PROCESSOR] All extraction methods failed')
      warnings.push('All extraction methods failed')
      
      return {
        text: '',
        format: 'unknown',
        confidence: 0,
        metadata: {
          extractionMethod: 'failed',
          processingTime: 0,
          warnings
        }
      }
    }
  }
  
  private async extractViaVision(buffer: Buffer, type: string): Promise<string> {
    console.log('[UNIVERSAL-PROCESSOR] Attempting vision extraction...')
    
    // Convert buffer to base64
    const base64 = buffer.toString('base64')
    
    // Determine media type
    let mediaType = 'image/jpeg'
    if (type === 'pdf') {
      // For PDFs, we'd need to convert to images first
      // For now, throw an error
      throw new Error('PDF vision extraction requires pdf-to-image conversion')
    }
    
    // Use Claude to extract text
    const prompt = `Extract ALL text from this ${type}. Include all values, numbers, test results, and data. 
Format the output clearly and preserve the structure.
If this is a lab report or medical document, ensure all scores, ranges, and values are captured.`
    
    const systemPrompt = 'You are an expert at extracting text from images and documents. Preserve all formatting and structure.'
    
    const response = await this.claudeClient.analyzeImageWithVision(base64, mediaType, prompt, systemPrompt)
    
    return response
  }
}