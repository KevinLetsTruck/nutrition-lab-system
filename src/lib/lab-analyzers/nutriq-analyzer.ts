import PDFLabParser, { ParsedLabReport } from './pdf-parser'
import ClaudeClient, { NutriQAnalysis } from '../claude-client'

export interface NutriQParsedReport extends ParsedLabReport {
  nutriqAnalysis: NutriQAnalysis
  reportType: 'nutriq'
}

export class NutriQAnalyzer {
  private static instance: NutriQAnalyzer
  private pdfParser: PDFLabParser
  private claudeClient: ClaudeClient

  private constructor() {
    this.pdfParser = PDFLabParser.getInstance()
    this.claudeClient = ClaudeClient.getInstance()
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
      if (match) {
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