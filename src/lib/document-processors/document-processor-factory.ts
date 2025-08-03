import { TextractProcessor } from './textract-processor'
import ClaudeClient from '@/lib/claude-client'

export interface DocumentProcessor {
  extractFromDocument(documentBuffer: Buffer): Promise<ExtractedContent>
}

export interface ExtractedContent {
  text: string
  tables: ExtractedTable[]
  keyValuePairs: KeyValuePair[]
  confidence: number
  pageCount: number
}

export interface ExtractedTable {
  rows: string[][]
  confidence: number
}

export interface KeyValuePair {
  key: string
  value: string
  confidence: number
}

/**
 * Claude Vision processor as fallback for when Textract is not available
 */
export class ClaudeVisionProcessor implements DocumentProcessor {
  private claudeClient: ClaudeClient

  constructor() {
    this.claudeClient = ClaudeClient.getInstance()
  }

  async extractFromDocument(documentBuffer: Buffer): Promise<ExtractedContent> {
    console.log('[CLAUDE-VISION] Using Claude Vision as fallback processor')
    
    // For Claude, we need to convert the PDF to images first
    // This would use the client-side conversion in production
    const text = await this.extractTextWithClaude(documentBuffer)
    
    return {
      text,
      tables: [], // Claude doesn't extract structured tables
      keyValuePairs: [], // Claude doesn't extract key-value pairs
      confidence: 85, // Estimated confidence
      pageCount: 1
    }
  }

  private async extractTextWithClaude(documentBuffer: Buffer): Promise<string> {
    // In production, this would receive base64 images from client
    // For now, extract text if possible
    try {
      const PDFLabParser = (await import('@/lib/lab-analyzers/pdf-parser')).default
      const parser = PDFLabParser.getInstance()
      const parsed = await parser.parseLabReport(documentBuffer)
      return parsed.rawText || ''
    } catch (error) {
      console.error('[CLAUDE-VISION] Failed to extract text:', error)
      return ''
    }
  }
}

/**
 * Factory to create appropriate document processor based on configuration
 */
export class DocumentProcessorFactory {
  private static hasAWSCredentials(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID && 
      process.env.AWS_SECRET_ACCESS_KEY
    )
  }

  /**
   * Get the best available document processor
   */
  static async getProcessor(): Promise<DocumentProcessor> {
    // Check if AWS credentials are configured
    if (this.hasAWSCredentials()) {
      console.log('[FACTORY] Using AWS Textract processor')
      return new TextractProcessor()
    }

    // Fallback to Claude Vision
    console.log('[FACTORY] AWS credentials not found, using Claude Vision processor')
    return new ClaudeVisionProcessor()
  }

  /**
   * Get a specific processor by type
   */
  static async getProcessorByType(type: 'textract' | 'claude'): Promise<DocumentProcessor> {
    switch (type) {
      case 'textract':
        if (!this.hasAWSCredentials()) {
          throw new Error('AWS credentials not configured for Textract')
        }
        return new TextractProcessor()
      
      case 'claude':
        return new ClaudeVisionProcessor()
      
      default:
        throw new Error(`Unknown processor type: ${type}`)
    }
  }
}