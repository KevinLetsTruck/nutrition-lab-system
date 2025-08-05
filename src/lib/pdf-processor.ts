import Anthropic from '@anthropic-ai/sdk'
import { PDFDocument } from 'pdf-lib'

let pdfjs: any

// Initialize pdf.js dynamically
async function initPDFJS() {
  if (!pdfjs) {
    pdfjs = await import('pdfjs-dist')
    // Disable worker to avoid build issues in production
    pdfjs.GlobalWorkerOptions.workerSrc = false
  }
  return pdfjs
}

export interface PDFProcessorConfig {
  anthropicApiKey: string
  maxRetries?: number
  chunkSize?: number // pages per request
  enableOCRFallback?: boolean
  maxPDFSizeMB?: number
}

export interface PatientInfo {
  name?: string
  dateOfBirth?: string
  testDate?: string
  reportId?: string
  provider?: string
}

export interface TestResult {
  name: string
  value: string | number
  unit?: string
  referenceRange?: string
  status?: 'normal' | 'high' | 'low' | 'critical'
  notes?: string
}

export interface ReportMetadata {
  reportType: 'nutriq' | 'kbmo' | 'dutch' | 'fit_test' | 'stool_test' | 'blood_test' | 'general'
  labName?: string
  testDate?: string
  processingMethod: 'native' | 'preprocessed' | 'ocr' | 'vision'
  confidence: number
  pageCount: number
  warnings?: string[]
}

export interface LabReport {
  patientInfo: PatientInfo
  testResults: TestResult[]
  clinicalNotes?: string
  metadata: ReportMetadata
  rawExtract?: string
}

export interface ProcessingLog {
  documentId: string
  timestamp: Date
  processingMethod: 'native' | 'preprocessed' | 'vision' | 'ocr'
  success: boolean
  errorDetails?: string
  retryCount: number
  tokenUsage?: number
  processingTimeMs: number
}

export class PDFProcessor {
  private anthropic: Anthropic
  private config: Required<PDFProcessorConfig>
  private processingLogs: ProcessingLog[] = []

  constructor(config: PDFProcessorConfig) {
    this.anthropic = new Anthropic({ apiKey: config.anthropicApiKey })
    this.config = {
      anthropicApiKey: config.anthropicApiKey,
      maxRetries: config.maxRetries ?? 3,
      chunkSize: config.chunkSize ?? 20,
      enableOCRFallback: config.enableOCRFallback ?? true,
      maxPDFSizeMB: config.maxPDFSizeMB ?? 32
    }
  }

  /**
   * Primary method: Process lab report using Claude's native PDF support
   */
  async processLabReport(
    pdfInput: File | Buffer | string, 
    options?: { clientName?: string; reportType?: string }
  ): Promise<LabReport> {
    const startTime = Date.now()
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    let retryCount = 0

    try {
      // Convert input to Buffer
      const pdfBuffer = await this.normalizeInput(pdfInput)
      
      // Check PDF size
      const sizeMB = pdfBuffer.length / (1024 * 1024)
      if (sizeMB > this.config.maxPDFSizeMB) {
        throw new Error(`PDF size (${sizeMB.toFixed(2)}MB) exceeds maximum allowed size of ${this.config.maxPDFSizeMB}MB`)
      }

      console.log('[PDFProcessor] Processing PDF:', { 
        sizeMB: sizeMB.toFixed(2), 
        clientName: options?.clientName,
        reportType: options?.reportType 
      })

      // Classify PDF type
      const pdfType = await this.classifyPDF(pdfBuffer)
      console.log('[PDFProcessor] PDF classification:', pdfType)

      let result: LabReport | null = null
      let lastError: Error | null = null

      // Try native PDF processing first
      for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
        try {
          retryCount = attempt
          
          if (pdfType === 'native' || attempt === 0) {
            // Primary method: Native PDF support
            result = await this.processWithNativePDFSupport(pdfBuffer, options)
          } else {
            // Fallback: Preprocessing pipeline
            result = await this.processWithPreprocessing(pdfBuffer, options)
          }
          
          if (result) {
            break
          }
        } catch (error) {
          lastError = error as Error
          console.error(`[PDFProcessor] Attempt ${attempt + 1} failed:`, error)
          
          // Exponential backoff
          if (attempt < this.config.maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
      }

      if (!result) {
        throw lastError || new Error('Failed to process PDF after all retries')
      }

      // Log successful processing
      this.logProcessing({
        documentId,
        timestamp: new Date(),
        processingMethod: result.metadata.processingMethod,
        success: true,
        retryCount,
        processingTimeMs: Date.now() - startTime
      })

      return result

    } catch (error) {
      // Log failed processing
      this.logProcessing({
        documentId,
        timestamp: new Date(),
        processingMethod: 'native',
        success: false,
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        retryCount,
        processingTimeMs: Date.now() - startTime
      })

      throw error
    }
  }

  /**
   * Process PDF using Claude's native PDF support
   */
  private async processWithNativePDFSupport(
    pdfBuffer: Buffer, 
    options?: { clientName?: string; reportType?: string }
  ): Promise<LabReport> {
    console.log('[PDFProcessor] Using native PDF support')

    // Convert to base64
    const pdfBase64 = pdfBuffer.toString('base64')

    // Get page count
    const pageCount = await this.getPageCount(pdfBuffer)
    console.log('[PDFProcessor] PDF has', pageCount, 'pages')

    // Process in chunks if needed
    if (pageCount > this.config.chunkSize) {
      return await this.processLargePDF(pdfBuffer, pdfBase64, pageCount, options)
    }

    // Detect report type if not provided
    const reportType = options?.reportType || await this.detectReportType(pdfBuffer)

    // Get appropriate prompt
    const prompt = this.getAnalysisPrompt(reportType, options?.clientName)

    try {
      // Send to Claude with native PDF support
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      })

      // Parse response
      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      const labReport = this.parseClaudeResponse(responseText, reportType)

      return {
        ...labReport,
        metadata: {
          ...labReport.metadata,
          reportType: reportType as any,
          processingMethod: 'native',
          confidence: 0.95,
          pageCount
        }
      }

    } catch (error) {
      console.error('[PDFProcessor] Native PDF processing failed:', error)
      
      // Check if it's a specific error about PDFs not being supported
      if (error instanceof Anthropic.APIError && error.message.includes('document')) {
        console.log('[PDFProcessor] Native PDF not supported, falling back to preprocessing')
        return await this.processWithPreprocessing(pdfBuffer, options)
      }
      
      throw error
    }
  }

  /**
   * Fallback method: Process with preprocessing for problematic PDFs
   */
  async processWithPreprocessing(
    pdfBuffer: Buffer,
    options?: { clientName?: string; reportType?: string }
  ): Promise<LabReport> {
    console.log('[PDFProcessor] Using preprocessing pipeline')

    // Extract text first
    const textExtract = await this.extractTextFromPDF(pdfBuffer)
    console.log('[PDFProcessor] Extracted text length:', textExtract.text.length)

    // Detect report type
    const reportType = options?.reportType || await this.detectReportType(pdfBuffer)

    // If text extraction is good, use it
    if (textExtract.confidence > 0.7 && textExtract.text.length > 500) {
      const prompt = this.getAnalysisPrompt(reportType, options?.clientName)
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0,
        messages: [{
          role: 'user',
          content: `${prompt}\n\nDocument content:\n${textExtract.text}`
        }]
      })

      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      const labReport = this.parseClaudeResponse(responseText, reportType)

      return {
        ...labReport,
        metadata: {
          ...labReport.metadata,
          reportType: reportType as any,
          processingMethod: 'preprocessed',
          confidence: textExtract.confidence,
          pageCount: textExtract.pageCount
        },
        rawExtract: textExtract.text
      }
    }

    // If text extraction fails, use vision API
    if (this.config.enableOCRFallback) {
      return await this.processWithVisionAPI(pdfBuffer, options)
    }

    throw new Error('Text extraction failed and OCR fallback is disabled')
  }

  /**
   * Process PDF using Vision API (convert pages to images)
   */
  private async processWithVisionAPI(
    pdfBuffer: Buffer,
    options?: { clientName?: string; reportType?: string }
  ): Promise<LabReport> {
    console.log('[PDFProcessor] Using Vision API fallback')

    // Convert PDF pages to images
    const pageImages = await this.convertPDFToImages(pdfBuffer)
    console.log('[PDFProcessor] Converted', pageImages.length, 'pages to images')

    // Detect report type
    const reportType = options?.reportType || 'general'
    const prompt = this.getAnalysisPrompt(reportType, options?.clientName)

    // Build content array for Claude
    const content: any[] = [
      {
        type: 'text',
        text: prompt
      }
    ]

    // Add each page image
    for (const { base64, pageNumber } of pageImages) {
      content.push({
        type: 'text',
        text: `Page ${pageNumber}:`
      })
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: base64
        }
      })
    }

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0,
      messages: [{
        role: 'user',
        content
      }]
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    const labReport = this.parseClaudeResponse(responseText, reportType)

    return {
      ...labReport,
      metadata: {
        ...labReport.metadata,
        reportType: reportType as any,
        processingMethod: 'vision',
        confidence: 0.85,
        pageCount: pageImages.length
      }
    }
  }

  /**
   * Process large PDFs in chunks
   */
  private async processLargePDF(
    pdfBuffer: Buffer,
    pdfBase64: string,
    pageCount: number,
    options?: { clientName?: string; reportType?: string }
  ): Promise<LabReport> {
    console.log('[PDFProcessor] Processing large PDF in chunks')

    // Split PDF into chunks
    const chunks: string[] = []
    const chunkPromises: Promise<any>[] = []

    for (let i = 0; i < pageCount; i += this.config.chunkSize) {
      const startPage = i
      const endPage = Math.min(i + this.config.chunkSize, pageCount)
      
      // Extract pages for this chunk
      const chunkBuffer = await this.extractPDFPages(pdfBuffer, startPage, endPage)
      const chunkBase64 = chunkBuffer.toString('base64')
      
      const reportType = options?.reportType || 'general'
      const prompt = `Analyze pages ${startPage + 1} to ${endPage} of this lab report. Extract all test results, values, and relevant information.`

      chunkPromises.push(
        this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4000,
          temperature: 0,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: chunkBase64
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }]
        })
      )
    }

    // Process all chunks in parallel
    const responses = await Promise.all(chunkPromises)
    
    // Combine results
    const combinedText = responses
      .map(r => r.content[0].type === 'text' ? r.content[0].text : '')
      .join('\n\n')

    // Final analysis on combined results
    const reportType = options?.reportType || await this.detectReportTypeFromText(combinedText)
    const finalPrompt = this.getCombinedAnalysisPrompt(reportType, options?.clientName)

    const finalResponse = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0,
      messages: [{
        role: 'user',
        content: `${finalPrompt}\n\nCombined extracted data from all pages:\n${combinedText}`
      }]
    })

    const responseText = finalResponse.content[0].type === 'text' ? finalResponse.content[0].text : ''
    const labReport = this.parseClaudeResponse(responseText, reportType)

    return {
      ...labReport,
      metadata: {
        ...labReport.metadata,
        reportType: reportType as any,
        processingMethod: 'native',
        confidence: 0.9,
        pageCount,
        warnings: ['Processed in chunks due to large size']
      }
    }
  }

  /**
   * Classify PDF as native, scanned, or mixed
   */
  async classifyPDF(pdfBuffer: Buffer): Promise<'native' | 'scanned' | 'mixed'> {
    try {
      const textExtract = await this.extractTextFromPDF(pdfBuffer)
      const averageCharsPerPage = textExtract.text.length / textExtract.pageCount

      if (averageCharsPerPage < 100) {
        return 'scanned'
      } else if (averageCharsPerPage < 500) {
        return 'mixed'
      } else {
        return 'native'
      }
    } catch (error) {
      console.error('[PDFProcessor] Classification error:', error)
      return 'mixed' // Default to mixed for safety
    }
  }

  /**
   * Extract text from PDF using pdfjs-dist
   */
  private async extractTextFromPDF(pdfBuffer: Buffer): Promise<{
    text: string
    confidence: number
    pageCount: number
  }> {
    try {
      const pdfjsLib = await initPDFJS()
      const uint8Array = new Uint8Array(pdfBuffer)
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
      const pdf = await loadingTask.promise

      let fullText = ''
      const pageCount = pdf.numPages

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n\n'
      }

      // Calculate confidence based on text quality
      const confidence = this.calculateTextConfidence(fullText)

      return {
        text: fullText.trim(),
        confidence,
        pageCount
      }
    } catch (error) {
      console.error('[PDFProcessor] Text extraction error:', error)
      return {
        text: '',
        confidence: 0,
        pageCount: 0
      }
    }
  }

  /**
   * Convert PDF pages to images for Vision API
   */
  private async convertPDFToImages(pdfBuffer: Buffer): Promise<Array<{
    base64: string
    pageNumber: number
  }>> {
    const images: Array<{ base64: string; pageNumber: number }> = []

    try {
      const pdfjsLib = await initPDFJS()
      const uint8Array = new Uint8Array(pdfBuffer)
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array })
      const pdf = await loadingTask.promise

      const pageCount = Math.min(pdf.numPages, 10) // Limit to 10 pages for Vision API

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })
        
        // Create canvas
        const canvas = {
          width: viewport.width,
          height: viewport.height,
          data: new Uint8Array(viewport.width * viewport.height * 4)
        }

        // Note: In production, we'll skip image conversion
        // The Vision API fallback is not available without proper canvas/image processing
        console.warn('[PDFProcessor] Image conversion skipped in production environment')
        
        // For now, we'll only support text extraction and native PDF processing
        continue
      }

      return images
    } catch (error) {
      console.error('[PDFProcessor] Image conversion error:', error)
      throw new Error('Failed to convert PDF to images')
    }
  }

  /**
   * Detect report type from PDF content
   */
  private async detectReportType(pdfBuffer: Buffer): Promise<string> {
    try {
      const textExtract = await this.extractTextFromPDF(pdfBuffer)
      return await this.detectReportTypeFromText(textExtract.text)
    } catch (error) {
      return 'general'
    }
  }

  /**
   * Detect report type from text content
   */
  private async detectReportTypeFromText(text: string): Promise<string> {
    const reportTypePatterns = {
      nutriq: /nutriq|naq|nutritional assessment|symptom burden/i,
      kbmo: /kbmo|food sensitivity|igg.*food|food intolerance/i,
      dutch: /dutch|hormone.*test|cortisol.*pattern|sex.*hormone/i,
      fit_test: /fit.*test|fecal immunochemical|fobt|colon.*screening/i,
      stool_test: /stool.*analysis|microbiome|gi.*map|digestive/i,
      blood_test: /cbc|complete blood|metabolic panel|lipid.*panel/i
    }

    for (const [type, pattern] of Object.entries(reportTypePatterns)) {
      if (pattern.test(text)) {
        return type
      }
    }

    return 'general'
  }

  /**
   * Get analysis prompt based on report type
   */
  private getAnalysisPrompt(reportType: string, clientName?: string): string {
    const clientContext = clientName ? `This report is for client: ${clientName}. ` : ''

    const prompts: Record<string, string> = {
      nutriq: `Extract all lab results from this NutriQ/NAQ report. ${clientContext}Return as JSON with:
        - Patient demographics
        - All test results with values and reference ranges
        - Body system scores (energy, mood, sleep, stress, digestion, immunity)
        - Flagged abnormal results
        - Clinical interpretations
        - Recommendations
        Format: { patientInfo: {...}, testResults: [...], bodySystems: {...}, recommendations: [...] }`,
      
      kbmo: `Process this KBMO food sensitivity report. ${clientContext}Extract:
        - Patient information
        - All IgG levels for each food
        - Sensitivity categories (high, moderate, low)
        - Elimination diet recommendations
        - Reintroduction schedule
        Format: { patientInfo: {...}, testResults: [...], sensitivities: {...}, dietPlan: {...} }`,
      
      dutch: `Analyze this DUTCH hormone test. ${clientContext}Extract:
        - Patient demographics
        - All hormone levels with units and reference ranges
        - Cortisol pattern analysis
        - Sex hormone levels
        - Organic acids if present
        - Clinical recommendations
        Format: { patientInfo: {...}, testResults: [...], cortisolPattern: {...}, recommendations: [...] }`,
      
      fit_test: `Analyze this FIT/Fecal Immunochemical Test. ${clientContext}Extract:
        - Patient information
        - Test result (positive/negative/inconclusive)
        - Hemoglobin levels if provided
        - Clinical significance
        - Follow-up recommendations
        Format: { patientInfo: {...}, testResults: [...], interpretation: {...}, followUp: [...] }`,
      
      general: `Analyze this lab report. ${clientContext}Extract all available information:
        - Patient demographics
        - All test results with values, units, and reference ranges
        - Abnormal findings
        - Clinical notes or interpretations
        - Any recommendations
        Format: { patientInfo: {...}, testResults: [...], abnormalFindings: [...], recommendations: [...] }`
    }

    return prompts[reportType] || prompts.general
  }

  /**
   * Get prompt for combining chunked analysis
   */
  private getCombinedAnalysisPrompt(reportType: string, clientName?: string): string {
    const clientContext = clientName ? `This report is for client: ${clientName}. ` : ''

    return `Combine and synthesize the extracted data from all pages into a comprehensive analysis. ${clientContext}
      Organize all test results, remove duplicates, and provide a structured summary.
      Include all patient information, test results with values and ranges, clinical interpretations, and recommendations.
      Format as clean JSON without any markdown or code blocks.`
  }

  /**
   * Parse Claude's response into structured LabReport
   */
  private parseClaudeResponse(responseText: string, reportType: string): LabReport {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      
      const parsed = JSON.parse(jsonStr);

      // Map to LabReport structure
      return {
        patientInfo: parsed.patientInfo || {},
        testResults: this.normalizeTestResults(parsed.testResults || parsed.results || []),
        clinicalNotes: parsed.clinicalNotes || parsed.interpretation || '',
        metadata: {
          reportType: reportType as any,
          processingMethod: 'native',
          confidence: 0.9,
          pageCount: 1
        }
      }
    } catch (error) {
      console.error('[PDFProcessor] Failed to parse Claude response:', error)
      
      // Fallback: Extract what we can from text
      return {
        patientInfo: {},
        testResults: [],
        clinicalNotes: responseText,
        metadata: {
          reportType: reportType as any,
          processingMethod: 'native',
          confidence: 0.5,
          pageCount: 1,
          warnings: ['Failed to parse structured response']
        }
      }
    }
  }

  /**
   * Normalize test results to consistent format
   */
  private normalizeTestResults(results: any[]): TestResult[] {
    return results.map(result => ({
      name: result.name || result.test || result.parameter || 'Unknown',
      value: result.value || result.result || '',
      unit: result.unit || result.units || '',
      referenceRange: result.referenceRange || result.range || result.reference || '',
      status: this.determineStatus(result),
      notes: result.notes || result.interpretation || ''
    }))
  }

  /**
   * Determine test result status
   */
  private determineStatus(result: any): 'normal' | 'high' | 'low' | 'critical' | undefined {
    if (result.status) return result.status
    if (result.flag) {
      if (result.flag.toLowerCase().includes('h')) return 'high'
      if (result.flag.toLowerCase().includes('l')) return 'low'
      if (result.flag.toLowerCase().includes('c')) return 'critical'
    }
    return undefined
  }

  /**
   * Calculate text extraction confidence
   */
  private calculateTextConfidence(text: string): number {
    if (!text || text.length === 0) return 0

    // Check for common lab report indicators
    const indicators = [
      /patient|client|name/i,
      /test|result|value/i,
      /date|collected|received/i,
      /reference|range|normal/i,
      /lab|laboratory|clinic/i
    ]

    let score = 0
    indicators.forEach(pattern => {
      if (pattern.test(text)) score += 0.2
    })

    // Check text quality
    const words = text.split(/\s+/).filter(w => w.length > 2)
    if (words.length > 100) score = Math.min(score + 0.3, 1)

    // Check for gibberish (too many non-alphanumeric characters)
    const alphanumericRatio = text.replace(/[^a-zA-Z0-9\s]/g, '').length / text.length
    if (alphanumericRatio < 0.7) score *= 0.5

    return Math.min(Math.max(score, 0), 1)
  }

  /**
   * Get page count from PDF
   */
  private async getPageCount(pdfBuffer: Buffer): Promise<number> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      return pdfDoc.getPageCount()
    } catch (error) {
      console.error('[PDFProcessor] Failed to get page count:', error)
      return 1
    }
  }

  /**
   * Extract specific pages from PDF
   */
  private async extractPDFPages(pdfBuffer: Buffer, startPage: number, endPage: number): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer)
      const newPdf = await PDFDocument.create()

      for (let i = startPage; i < endPage && i < pdfDoc.getPageCount(); i++) {
        const [page] = await newPdf.copyPages(pdfDoc, [i])
        newPdf.addPage(page)
      }

      return Buffer.from(await newPdf.save())
    } catch (error) {
      console.error('[PDFProcessor] Failed to extract pages:', error)
      throw error
    }
  }

  /**
   * Normalize input to Buffer
   */
  private async normalizeInput(input: File | Buffer | string): Promise<Buffer> {
    if (Buffer.isBuffer(input)) {
      return input
    } else if (typeof input === 'string') {
      // Assume it's a base64 string
      return Buffer.from(input, 'base64')
    } else if (input instanceof File) {
      const arrayBuffer = await input.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } else {
      throw new Error('Invalid input type. Expected File, Buffer, or base64 string.')
    }
  }

  /**
   * Log processing attempt
   */
  private logProcessing(log: ProcessingLog) {
    this.processingLogs.push(log)
    
    // Keep only last 1000 logs
    if (this.processingLogs.length > 1000) {
      this.processingLogs = this.processingLogs.slice(-1000)
    }

    console.log('[PDFProcessor] Processing log:', {
      ...log,
      timestamp: log.timestamp.toISOString()
    })
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(): {
    totalAttempts: number
    successRate: number
    averageProcessingTime: number
    methodBreakdown: Record<string, number>
  } {
    const total = this.processingLogs.length
    const successful = this.processingLogs.filter(l => l.success).length
    const avgTime = this.processingLogs.reduce((sum, l) => sum + l.processingTimeMs, 0) / total || 0

    const methodBreakdown: Record<string, number> = {}
    this.processingLogs.forEach(log => {
      methodBreakdown[log.processingMethod] = (methodBreakdown[log.processingMethod] || 0) + 1
    })

    return {
      totalAttempts: total,
      successRate: total > 0 ? successful / total : 0,
      averageProcessingTime: avgTime,
      methodBreakdown
    }
  }
}