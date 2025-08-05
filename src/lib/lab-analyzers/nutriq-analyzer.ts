import PDFLabParser, { ParsedLabReport } from './pdf-parser'
import ClaudeClient, { NutriQAnalysis } from '../claude-client'
import ClientDataPriorityService, { ClientData, PDFExtractedData, FormData } from '../client-data-priority'
import NAQReportGenerator, { ComprehensiveNAQReport, NAQResponses, ClientData as NAQClientData } from '../analysis/naq-report-generator'
import { SymptomBurdenData } from '../analysis/naq-pattern-analyzer'

export interface NutriQParsedReport extends ParsedLabReport {
  nutriqAnalysis: NutriQAnalysis
  reportType: 'nutriq'
  comprehensiveReport?: ComprehensiveNAQReport
}

export class NutriQAnalyzer {
  private static instance: NutriQAnalyzer
  private pdfParser: PDFLabParser
  private claudeClient: ClaudeClient
  private clientDataService: ClientDataPriorityService
  private naqReportGenerator: NAQReportGenerator

  private constructor() {
    this.pdfParser = PDFLabParser.getInstance()
    this.claudeClient = ClaudeClient.getInstance()
    this.clientDataService = ClientDataPriorityService.getInstance()
    this.naqReportGenerator = new NAQReportGenerator()
  }

  static getInstance(): NutriQAnalyzer {
    if (!NutriQAnalyzer.instance) {
      NutriQAnalyzer.instance = new NutriQAnalyzer()
    }
    return NutriQAnalyzer.instance
  }

  async analyzeNutriQReport(pdfBuffer: Buffer): Promise<NutriQParsedReport> {
    try {
      // First, parse the PDF to get basic text (now includes vision analysis)
      const basicParsedReport = await this.pdfParser.parseLabReport(pdfBuffer)
      
      // Use combined text if available (includes vision analysis)
      const textForAnalysis = basicParsedReport.combinedText || basicParsedReport.rawText
      
      // Extract patient information from the PDF text
      const patientInfo = this.extractNutriQPatientInfo(textForAnalysis)
      
      // Use Claude to analyze the NutriQ assessment
      const nutriqAnalysis = await this.claudeClient.analyzeNutriQ(textForAnalysis)
      
      // Combine the results
      const nutriqReport: NutriQParsedReport = {
        ...basicParsedReport,
        ...patientInfo,
        nutriqAnalysis,
        reportType: 'nutriq'
      }

      return nutriqReport
    } catch (error) {
      throw new Error(`Failed to analyze NutriQ report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze NutriQ report with client data priority logic
   * This method ensures PDF client data takes precedence over form entries
   */
  async analyzeNutriQReportWithClientPriority(
    pdfBuffer: Buffer, 
    formData: FormData
  ): Promise<NutriQParsedReport & { clientData: ClientData }> {
    try {
      console.log('[NUTRIQ-ANALYZER] Starting analysis with client data priority...')
      
      // First, parse the PDF to get basic text (now includes vision analysis)
      const basicParsedReport = await this.pdfParser.parseLabReport(pdfBuffer)
      
      // Use combined text if available (includes vision analysis)
      const textForAnalysis = basicParsedReport.combinedText || basicParsedReport.rawText
      
      // Extract patient information from the PDF text
      const patientInfo = this.extractNutriQPatientInfo(textForAnalysis)
      
      // Prepare PDF data for client priority processing
      const pdfData: PDFExtractedData = {
        clientName: patientInfo.patientName,
        assessmentDate: patientInfo.testDate,
        systemScores: null, // Will be extracted from Claude analysis
        rawText: textForAnalysis
      }
      
      // Process client data with priority logic
      const clientData = this.clientDataService.processClientData(formData, pdfData)
      
      // Validate the data before proceeding
      const validation = this.clientDataService.validateAnalysisData(clientData, pdfData)
      if (!validation.valid) {
        console.warn('[NUTRIQ-ANALYZER] Data validation warnings:', validation.issues)
      }
      
      // Use Claude to analyze the NutriQ assessment with correct client context
      const nutriqAnalysis = await this.claudeClient.analyzeNutriQWithClientContext(
        textForAnalysis, 
        clientData.clientName
      )
      
      // Update PDF data with system scores from analysis
      pdfData.systemScores = nutriqAnalysis.bodySystems
      
      // Get final analysis data with correct client association
      const analysisData = this.clientDataService.getAnalysisData(clientData, pdfData)
      
      console.log('[NUTRIQ-ANALYZER] Analysis complete with client data priority')
      console.log('[NUTRIQ-ANALYZER] Data source message:', this.clientDataService.getDataSourceMessage(clientData))
      
      // Generate comprehensive functional medicine report if enabled
      let comprehensiveReport: ComprehensiveNAQReport | undefined
      try {
        comprehensiveReport = await this.generateComprehensiveReport(
          nutriqAnalysis,
          textForAnalysis,
          clientData
        )
      } catch (error) {
        console.error('[NUTRIQ-ANALYZER] Failed to generate comprehensive report, continuing with basic analysis:', error)
      }
      
      // Combine the results
      const nutriqReport: NutriQParsedReport & { clientData: ClientData } = {
        ...basicParsedReport,
        ...patientInfo,
        nutriqAnalysis,
        reportType: 'nutriq',
        clientData,
        comprehensiveReport
      }

      return nutriqReport
    } catch (error) {
      throw new Error(`Failed to analyze NutriQ report with client priority: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private extractNutriQPatientInfo(rawText: string): Partial<ParsedLabReport> {
    const patientInfo: Partial<ParsedLabReport> = {}

    // Extract patient name - NutriQ typically has "Patient Name:" or "Name:"
    const namePatterns = [
      /Patient Name[:\s]*([A-Za-z\s]+)/i,
      /Name[:\s]*([A-Za-z\s]+)/i,
      /Client Name[:\s]*([A-Za-z\s]+)/i
    ]

    for (const pattern of namePatterns) {
      const match = rawText.match(pattern)
      if (match && match[1]) {
        patientInfo.patientName = match[1].trim()
        break
      }
    }

    // Extract date of birth
    const dobPatterns = [
      /Date of Birth[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /DOB[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /Birth Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    ]

    for (const pattern of dobPatterns) {
      const match = rawText.match(pattern)
      if (match) {
        patientInfo.dateOfBirth = match[1]
        break
      }
    }

    // Extract test date
    const testDatePatterns = [
      /Test Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /Assessment Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    ]

    for (const pattern of testDatePatterns) {
      const match = rawText.match(pattern)
      if (match) {
        const dateStr = match[1]
        // Try to parse the date
        const parsedDate = this.parseDate(dateStr)
        if (parsedDate) {
          patientInfo.testDate = parsedDate
        }
        break
      }
    }

    // Extract patient ID or reference number
    const idPatterns = [
      /Patient ID[:\s]*([A-Z0-9-]+)/i,
      /Reference[:\s]*([A-Z0-9-]+)/i,
      /ID[:\s]*([A-Z0-9-]+)/i
    ]

    for (const pattern of idPatterns) {
      const match = rawText.match(pattern)
      if (match) {
        patientInfo.patientId = match[1]
        break
      }
    }

    return patientInfo
  }

  private parseDate(dateStr: string): Date | null {
    // Handle various date formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/, // MM/DD/YYYY or MM/DD/YY
      /(\d{1,2})-(\d{1,2})-(\d{2,4})/,   // MM-DD-YYYY or MM-DD-YY
    ]

    for (const format of formats) {
      const match = dateStr.match(format)
      if (match) {
        const [, month, day, year] = match
        const fullYear = year.length === 2 ? `20${year}` : year
        const date = new Date(parseInt(fullYear), parseInt(month) - 1, parseInt(day))
        
        // Validate the date
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }

    return null
  }

  // Convert Claude's basic analysis to symptom burden data for enhanced analysis
  private convertToSymptomBurden(nutriqAnalysis: NutriQAnalysis, rawText: string): SymptomBurdenData {
    // Extract symptom burden from the analysis or text
    // This is a simplified conversion - in practice, you'd parse specific NAQ scores
    const burden: SymptomBurdenData = {
      upperGI: this.extractSystemScore('upper gi', rawText) || Math.round(nutriqAnalysis.bodySystems.digestion?.score * 0.09) || 0,
      smallIntestine: this.extractSystemScore('small intestine', rawText) || Math.round(nutriqAnalysis.bodySystems.digestion?.score * 0.09) || 0,
      largeIntestine: this.extractSystemScore('large intestine', rawText) || Math.round(nutriqAnalysis.bodySystems.digestion?.score * 0.09) || 0,
      liverGB: this.extractSystemScore('liver', rawText) || 3, // Default moderate if not found
      kidneys: this.extractSystemScore('kidney', rawText) || 2,
      cardiovascular: this.extractSystemScore('cardiovascular', rawText) || 3,
      immuneSystem: this.extractSystemScore('immune', rawText) || Math.round(nutriqAnalysis.bodySystems.immunity?.score * 0.09) || 0,
      energyProduction: Math.round(nutriqAnalysis.bodySystems.energy?.score * 0.09) || 0,
      thyroid: this.extractSystemScore('thyroid', rawText) || 3,
      adrenal: Math.round(nutriqAnalysis.bodySystems.stress?.score * 0.09) || 0,
      femaleReprod: this.extractSystemScore('female reprod', rawText),
      maleReprod: this.extractSystemScore('male reprod', rawText),
      sugarHandling: this.extractSystemScore('sugar handling', rawText) || 2,
      joints: this.extractSystemScore('joints', rawText) || 2,
      skin: this.extractSystemScore('skin', rawText) || 2,
      brain: Math.round(nutriqAnalysis.bodySystems.mood?.score * 0.09) || 0,
      totalBurden: 0
    }
    
    // Calculate total burden
    burden.totalBurden = Object.values(burden)
      .filter(v => typeof v === 'number' && v > 0)
      .reduce((sum, val) => sum + val, 0)
    
    return burden
  }
  
  private extractSystemScore(systemName: string, rawText: string): number | undefined {
    // Look for specific system scores in the text
    const patterns = [
      new RegExp(`${systemName}[:\\s]*(\\d+)\\s*(?:/\\s*\\d+)?`, 'i'),
      new RegExp(`${systemName}[^\\d]*(\\d+)`, 'i')
    ]
    
    for (const pattern of patterns) {
      const match = rawText.match(pattern)
      if (match && match[1]) {
        return parseInt(match[1])
      }
    }
    
    return undefined
  }
  
  // Generate comprehensive NAQ report
  async generateComprehensiveReport(
    nutriqAnalysis: NutriQAnalysis,
    rawText: string,
    clientData: ClientData
  ): Promise<ComprehensiveNAQReport> {
    try {
      console.log('[NUTRIQ-ANALYZER] Generating comprehensive functional medicine report...')
      
      // Convert to symptom burden data
      const symptomBurden = this.convertToSymptomBurden(nutriqAnalysis, rawText)
      
      // Create NAQ client data
      const naqClientData: NAQClientData = {
        firstName: clientData.clientName?.split(' ')[0] || 'Unknown',
        lastName: clientData.clientName?.split(' ').slice(1).join(' ') || 'Client',
        email: clientData.clientEmail || '',
        dateOfBirth: clientData.dateOfBirth,
        occupation: 'Truck Driver', // Default for this system
        assessmentDate: new Date(clientData.reportDate || Date.now())
      }
      
      // Create NAQ responses
      const naqResponses: NAQResponses = {
        answers: {}, // Would be populated from actual NAQ questionnaire
        symptomBurden,
        completedSections: ['all'], // Simplified
        assessmentDate: new Date(clientData.reportDate || Date.now())
      }
      
      // Generate comprehensive report
      const comprehensiveReport = await this.naqReportGenerator.generateReport(
        naqClientData,
        naqResponses,
        'Kevin Rutherford, FNTP'
      )
      
      console.log('[NUTRIQ-ANALYZER] Comprehensive report generated successfully')
      return comprehensiveReport
      
    } catch (error) {
      console.error('[NUTRIQ-ANALYZER] Error generating comprehensive report:', error)
      throw error
    }
  }

  // Helper method to validate NutriQ analysis results
  validateNutriQAnalysis(analysis: NutriQAnalysis): { valid: boolean; reasons: string[] } {
    const reasons: string[] = []
    
    // Check if all required fields are present
    if (!analysis.totalScore || typeof analysis.totalScore !== 'number') {
      reasons.push('Missing or invalid total score')
    }

    if (!analysis.bodySystems || typeof analysis.bodySystems !== 'object') {
      reasons.push('Missing body systems analysis')
    } else {
      // Check for required body systems - but be more flexible
      const requiredSystems = ['energy', 'mood', 'sleep', 'stress', 'digestion', 'immunity']
      const missingSystems: string[] = []
      
      for (const system of requiredSystems) {
        if (!analysis.bodySystems[system as keyof typeof analysis.bodySystems]) {
          missingSystems.push(system)
        }
      }
      
      // Allow some missing systems but require at least 3
      if (missingSystems.length > 3) {
        reasons.push(`Too many missing body systems: ${missingSystems.join(', ')}`)
      }
    }

    return {
      valid: reasons.length === 0,
      reasons
    }
  }

  // Method to get priority recommendations based on scores
  getPriorityRecommendations(analysis: NutriQAnalysis): string[] {
    const priorities: string[] = []
    
    // Find the lowest scoring systems
    const systemScores = Object.entries(analysis.bodySystems).map(([system, data]) => ({
      system,
      score: data.score
    }))
    
    systemScores.sort((a, b) => a.score - b.score)
    
    // Add recommendations for the 3 lowest scoring systems
    for (let i = 0; i < Math.min(3, systemScores.length); i++) {
      const system = systemScores[i]
      if (system.score < 50) {
        priorities.push(`Focus on improving ${system.system} (score: ${system.score})`)
      }
    }

    return priorities
  }
}

export default NutriQAnalyzer 