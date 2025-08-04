import { RobustPDFProcessor } from '../document-processors/robust-pdf-processor'
import ClaudeClient from '../claude-client'
import { ClientDataAggregator } from './client-data-aggregator'
import { ComprehensiveAnalyzer } from './comprehensive-analyzer'
import { SupplementRecommender } from './supplement-recommender'

export interface UnifiedAnalysisRequest {
  fileBuffer?: Buffer
  clientId?: string
  analysisType: 'document' | 'comprehensive' | 'quick'
  reportType?: string
  metadata?: Record<string, any>
}

export interface UnifiedAnalysisResult {
  success: boolean
  analysisId: string
  documentType?: string
  extractedData?: any
  functionalAnalysis?: any
  recommendations?: any
  protocols?: any
  errors?: string[]
  warnings?: string[]
  processingTime: number
}

export class UnifiedAnalysisOrchestrator {
  private pdfProcessor: RobustPDFProcessor
  private claudeClient: ClaudeClient
  private dataAggregator: ClientDataAggregator
  private comprehensiveAnalyzer: ComprehensiveAnalyzer
  private supplementRecommender: SupplementRecommender

  constructor() {
    this.pdfProcessor = new RobustPDFProcessor()
    this.claudeClient = new ClaudeClient()
    this.dataAggregator = new ClientDataAggregator()
    this.comprehensiveAnalyzer = new ComprehensiveAnalyzer()
    this.supplementRecommender = new SupplementRecommender()
  }

  async analyzeDocument(request: UnifiedAnalysisRequest): Promise<UnifiedAnalysisResult> {
    const startTime = Date.now()
    const analysisId = crypto.randomUUID()
    const errors: string[] = []
    const warnings: string[] = []

    try {
      console.log('[ORCHESTRATOR] Starting unified analysis:', {
        analysisId,
        type: request.analysisType,
        hasFile: !!request.fileBuffer,
        clientId: request.clientId
      })

      // Step 1: Document Processing (if file provided)
      let extractedText = ''
      let documentType = 'unknown'
      let extractedData: any = null

      if (request.fileBuffer) {
        console.log('[ORCHESTRATOR] Processing document...')
        
        try {
          const processed = await this.pdfProcessor.processPDF(request.fileBuffer)
          extractedText = processed.text
          warnings.push(...processed.metadata.warnings)
          
          // Classify document
          documentType = await this.pdfProcessor.classifyDocument(extractedText)
          console.log('[ORCHESTRATOR] Document classified as:', documentType)
          
          // Extract structured data based on document type
          extractedData = await this.extractStructuredData(extractedText, documentType)
          
        } catch (pdfError) {
          console.error('[ORCHESTRATOR] PDF processing error:', pdfError)
          errors.push(`PDF processing failed: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`)
          
          // Try fallback text extraction
          extractedText = await this.fallbackTextExtraction(request.fileBuffer)
          if (!extractedText) {
            throw new Error('Unable to extract any text from document')
          }
        }
      }

      // Step 2: Functional Medicine Analysis
      let functionalAnalysis: any = null
      
      if (extractedData || request.clientId) {
        console.log('[ORCHESTRATOR] Performing functional medicine analysis...')
        
        try {
          functionalAnalysis = await this.performFunctionalAnalysis({
            extractedData,
            documentType,
            clientId: request.clientId,
            rawText: extractedText
          })
        } catch (analysisError) {
          console.error('[ORCHESTRATOR] Functional analysis error:', analysisError)
          errors.push(`Functional analysis failed: ${analysisError instanceof Error ? analysisError.message : 'Unknown error'}`)
        }
      }

      // Step 3: Generate Recommendations
      let recommendations: any = null
      let protocols: any = null
      
      if (functionalAnalysis) {
        console.log('[ORCHESTRATOR] Generating recommendations...')
        
        try {
          recommendations = await this.generateRecommendations(functionalAnalysis, documentType)
          protocols = await this.createProtocols(functionalAnalysis, recommendations)
        } catch (recError) {
          console.error('[ORCHESTRATOR] Recommendation generation error:', recError)
          warnings.push('Unable to generate complete recommendations')
        }
      }

      // Step 4: Quality Assurance
      const qaResult = await this.performQualityCheck({
        extractedData,
        functionalAnalysis,
        recommendations,
        documentType
      })
      
      if (!qaResult.passed) {
        warnings.push(...qaResult.issues)
      }

      const processingTime = Date.now() - startTime
      
      return {
        success: errors.length === 0,
        analysisId,
        documentType,
        extractedData,
        functionalAnalysis,
        recommendations,
        protocols,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        processingTime
      }

    } catch (error) {
      console.error('[ORCHESTRATOR] Fatal error:', error)
      
      return {
        success: false,
        analysisId,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings,
        processingTime: Date.now() - startTime
      }
    }
  }

  private async extractStructuredData(text: string, documentType: string): Promise<any> {
    // Use specialized extractors based on document type
    switch (documentType) {
      case 'nutriq':
        return this.extractNutriQData(text)
      case 'kbmo':
        return this.extractKBMOData(text)
      case 'dutch':
        return this.extractDutchData(text)
      case 'fit-test':
        return this.extractFITTestData(text)
      case 'lab-report':
        return this.extractLabReportData(text)
      default:
        return this.extractGenericData(text)
    }
  }

  private async extractNutriQData(text: string): Promise<any> {
    // Extract scores and sections from NutriQ assessment
    const data: any = {
      scores: {},
      symptoms: [],
      recommendations: []
    }

    // Extract total score
    const totalScoreMatch = text.match(/Total\s*Score[:\s]*(\d+)/i)
    if (totalScoreMatch) {
      data.scores.total = parseInt(totalScoreMatch[1])
    }

    // Extract section scores
    const sections = ['digestive', 'energy', 'immune', 'mental', 'sleep', 'stress']
    for (const section of sections) {
      const regex = new RegExp(`${section}[:\\s]*(\\d+)`, 'i')
      const match = text.match(regex)
      if (match) {
        data.scores[section] = parseInt(match[1])
      }
    }

    return data
  }

  private async extractKBMOData(text: string): Promise<any> {
    // Extract food sensitivities
    const data: any = {
      sensitivities: [],
      totalIgg: 0
    }

    // Extract IgG levels
    const iggMatches = text.matchAll(/([A-Za-z\s]+):\s*(\d+\.?\d*)\s*(mg\/mL|IU\/mL)/gi)
    for (const match of iggMatches) {
      data.sensitivities.push({
        food: match[1].trim(),
        level: parseFloat(match[2]),
        unit: match[3]
      })
    }

    return data
  }

  private async extractDutchData(text: string): Promise<any> {
    // Extract hormone levels
    const data: any = {
      cortisol: {},
      hormones: []
    }

    // Extract cortisol pattern
    const cortisolMatches = text.matchAll(/(morning|afternoon|evening|night|am|pm)\s*cortisol[:\s]*(\d+\.?\d*)/gi)
    for (const match of cortisolMatches) {
      data.cortisol[match[1].toLowerCase()] = parseFloat(match[2])
    }

    return data
  }

  private async extractFITTestData(text: string): Promise<any> {
    // Extract FIT test results
    const data: any = {
      result: '',
      value: null
    }

    const resultMatch = text.match(/(positive|negative|abnormal|normal)/i)
    if (resultMatch) {
      data.result = resultMatch[1].toLowerCase()
    }

    const valueMatch = text.match(/(\d+\.?\d*)\s*(ng\/mL|μg\/g)/i)
    if (valueMatch) {
      data.value = parseFloat(valueMatch[1])
      data.unit = valueMatch[2]
    }

    return data
  }

  private async extractLabReportData(text: string): Promise<any> {
    // Generic lab report extraction
    const data: any = {
      markers: []
    }

    // Extract common lab markers
    const markerPatterns = [
      /glucose[:\s]*(\d+\.?\d*)\s*(mg\/dL|mmol\/L)/i,
      /cholesterol[:\s]*(\d+\.?\d*)\s*(mg\/dL|mmol\/L)/i,
      /hemoglobin\s*a1c[:\s]*(\d+\.?\d*)%?/i,
      /triglycerides[:\s]*(\d+\.?\d*)\s*(mg\/dL|mmol\/L)/i
    ]

    for (const pattern of markerPatterns) {
      const match = text.match(pattern)
      if (match) {
        data.markers.push({
          name: pattern.source.split('[')[0],
          value: parseFloat(match[1]),
          unit: match[2] || '%'
        })
      }
    }

    return data
  }

  private async extractGenericData(text: string): Promise<any> {
    // Fallback generic extraction
    return {
      rawText: text.substring(0, 1000),
      extractionNote: 'Generic extraction - document type not recognized'
    }
  }

  private async performFunctionalAnalysis(data: any): Promise<any> {
    const prompt = `Analyze this health data from a functional medicine perspective:

Document Type: ${data.documentType}
Extracted Data: ${JSON.stringify(data.extractedData, null, 2)}

Provide a comprehensive functional medicine analysis including:
1. Root cause identification
2. System imbalances
3. Functional vs optimal range assessment
4. Pattern recognition
5. Risk factors

Focus on truck driver health considerations:
- DOT medical certification risks
- Road-compatible interventions
- Safety-critical health factors

Return a structured JSON response.`

    try {
      const response = await this.claudeClient.analyzeWithPrompt(prompt)
      return JSON.parse(response)
    } catch (error) {
      console.error('[ORCHESTRATOR] Claude analysis error:', error)
      throw error
    }
  }

  private async generateRecommendations(analysis: any, documentType: string): Promise<any> {
    // Generate personalized recommendations based on analysis
    return {
      immediate: [
        'Address critical findings first',
        'Implement safety protocols'
      ],
      shortTerm: [
        'Begin supplement protocol',
        'Dietary modifications'
      ],
      longTerm: [
        'Lifestyle optimization',
        'Preventive measures'
      ]
    }
  }

  private async createProtocols(analysis: any, recommendations: any): Promise<any> {
    // Create actionable protocols
    return {
      phase1: {
        duration: '4 weeks',
        focus: 'Stabilization',
        interventions: []
      },
      phase2: {
        duration: '8 weeks',
        focus: 'Restoration',
        interventions: []
      },
      phase3: {
        duration: 'Ongoing',
        focus: 'Optimization',
        interventions: []
      }
    }
  }

  private async performQualityCheck(data: any): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = []

    // Check completeness
    if (!data.extractedData || Object.keys(data.extractedData).length === 0) {
      issues.push('No data extracted from document')
    }

    if (!data.functionalAnalysis) {
      issues.push('Functional analysis incomplete')
    }

    if (!data.recommendations) {
      issues.push('Recommendations not generated')
    }

    return {
      passed: issues.length === 0,
      issues
    }
  }

  private async fallbackTextExtraction(buffer: Buffer): Promise<string> {
    // Simple fallback - convert buffer to string and extract readable text
    try {
      const text = buffer.toString('utf8')
      // Remove non-printable characters
      return text.replace(/[^\x20-\x7E\n\r\t]/g, '')
    } catch {
      return ''
    }
  }
}