import Anthropic from '@anthropic-ai/sdk'

export interface PDFProcessorConfig {
  anthropicApiKey: string
  maxRetries?: number
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

      let result: LabReport | null = null
      let lastError: Error | null = null

      // Try native PDF processing with retries
      for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
        try {
          retryCount = attempt
          result = await this.processWithNativePDFSupport(pdfBuffer, options)
          
          if (result) {
            break
          }
        } catch (error) {
          lastError = error as Error
          console.error(`[PDFProcessor] Attempt ${attempt + 1} failed:`, error)
          
          // Check if it's a specific error about PDFs not being supported
          if (error instanceof Anthropic.APIError && error.message.includes('document')) {
            console.log('[PDFProcessor] Native PDF not supported, falling back to text-only mode')
            result = await this.processAsText(pdfBuffer, options)
            break
          }
          
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

    // Detect report type if not provided
    const reportType = options?.reportType || 'general'

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
          pageCount: 1 // We don't have page count in production version
        }
      }

    } catch (error) {
      console.error('[PDFProcessor] Native PDF processing failed:', error)
      throw error
    }
  }

  /**
   * Fallback: Process as text only (for when native PDF fails)
   */
  private async processAsText(
    pdfBuffer: Buffer,
    options?: { clientName?: string; reportType?: string }
  ): Promise<LabReport> {
    console.log('[PDFProcessor] Processing as text-only fallback')

    const reportType = options?.reportType || 'general'
    const prompt = this.getAnalysisPrompt(reportType, options?.clientName)
    
    // Since we can't extract text in production without dependencies,
    // we'll send a message explaining the limitation
    const fallbackPrompt = `${prompt}

Note: The PDF processing encountered an issue. Please analyze based on the following:
- This is a ${reportType} lab report
${options?.clientName ? `- Patient/Client name: ${options.clientName}` : ''}
- The document appears to be a scanned or complex PDF that requires manual review

Please provide a general structure and recommendations for this type of report.`

    const response = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0,
      messages: [{
        role: 'user',
        content: fallbackPrompt
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
        confidence: 0.3,
        pageCount: 0,
        warnings: ['PDF could not be fully processed. Manual review recommended.']
      }
    }
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