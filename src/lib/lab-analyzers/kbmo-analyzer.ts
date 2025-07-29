import PDFLabParser, { ParsedLabReport } from './pdf-parser'
import ClaudeClient, { KBMAAnalysis } from '../claude-client'

export interface KBMOParsedReport extends ParsedLabReport {
  kbmoAnalysis: KBMAAnalysis
  reportType: 'kbmo'
}

export class KBMAAnalyzer {
  private static instance: KBMAAnalyzer
  private pdfParser: PDFLabParser
  private claudeClient: ClaudeClient

  private constructor() {
    this.pdfParser = PDFLabParser.getInstance()
    this.claudeClient = ClaudeClient.getInstance()
  }

  static getInstance(): KBMAAnalyzer {
    if (!KBMAAnalyzer.instance) {
      KBMAAnalyzer.instance = new KBMAAnalyzer()
    }
    return KBMAAnalyzer.instance
  }

  async analyzeKBMReport(pdfBuffer: Buffer): Promise<KBMOParsedReport> {
    try {
      // First, parse the PDF to get basic text
      const basicParsedReport = await this.pdfParser.parseLabReport(pdfBuffer)
      
      // Extract patient information from the PDF text
      const patientInfo = this.extractKBMOPatientInfo(basicParsedReport.rawText)
      
      // Use Claude to analyze the KBMO test results
      const kbmoAnalysis = await this.claudeClient.analyzeKBMO(basicParsedReport.rawText)
      
      // Combine the results
      const kbmoReport: KBMOParsedReport = {
        ...basicParsedReport,
        ...patientInfo,
        kbmoAnalysis,
        reportType: 'kbmo'
      }

      return kbmoReport
    } catch (error) {
      throw new Error(`Failed to analyze KBMO report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private extractKBMOPatientInfo(rawText: string): Partial<ParsedLabReport> {
    const patientInfo: Partial<ParsedLabReport> = {}

    // Extract patient name - KBMO typically has "Patient Name:" or "Client Name:"
    const namePatterns = [
      /Patient Name[:\s]*([A-Za-z\s]+)/i,
      /Client Name[:\s]*([A-Za-z\s]+)/i,
      /Name[:\s]*([A-Za-z\s]+)/i
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
      /Collection Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /Date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
    ]

    for (const pattern of testDatePatterns) {
      const match = rawText.match(pattern)
      if (match) {
        const dateStr = match[1]
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
      /ID[:\s]*([A-Z0-9-]+)/i,
      /Sample ID[:\s]*([A-Z0-9-]+)/i
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

  // Helper method to validate KBMO analysis results
  validateKBMAAnalysis(analysis: KBMAAnalysis): { valid: boolean; reasons: string[] } {
    const reasons: string[] = []
    
    // Check if all required fields are present
    if (!analysis.totalIggScore || typeof analysis.totalIggScore !== 'number') {
      reasons.push('Missing or invalid total IgG score')
    }

    if (!analysis.highSensitivityFoods || !Array.isArray(analysis.highSensitivityFoods)) {
      reasons.push('Missing high sensitivity foods array')
    }

    if (!analysis.moderateSensitivityFoods || !Array.isArray(analysis.moderateSensitivityFoods)) {
      reasons.push('Missing moderate sensitivity foods array')
    }

    if (!analysis.lowSensitivityFoods || !Array.isArray(analysis.lowSensitivityFoods)) {
      reasons.push('Missing low sensitivity foods array')
    }

    return {
      valid: reasons.length === 0,
      reasons
    }
  }

  // Method to get elimination diet recommendations
  getEliminationDietPlan(analysis: KBMAAnalysis): string[] {
    const plan: string[] = []
    
    // Add high sensitivity foods to immediate elimination
    if (analysis.highSensitivityFoods.length > 0) {
      plan.push('Immediate elimination (6-8 weeks):')
      analysis.highSensitivityFoods.forEach(food => {
        plan.push(`- ${food.food} (IgG: ${food.iggLevel})`)
      })
    }

    // Add moderate sensitivity foods to consider
    if (analysis.moderateSensitivityFoods.length > 0) {
      plan.push('Consider eliminating (4-6 weeks):')
      analysis.moderateSensitivityFoods.forEach(food => {
        plan.push(`- ${food.food} (IgG: ${food.iggLevel})`)
      })
    }

    return plan
  }

  // Method to get reintroduction schedule
  getReintroductionSchedule(analysis: KBMAAnalysis): string[] {
    const schedule: string[] = []
    
    // Create a reintroduction schedule based on sensitivity levels
    const allFoods = [
      ...analysis.highSensitivityFoods.map(f => ({ ...f, priority: 3 })),
      ...analysis.moderateSensitivityFoods.map(f => ({ ...f, priority: 2 })),
      ...analysis.lowSensitivityFoods.map(f => ({ ...f, priority: 1 }))
    ]

    // Sort by priority (lowest first for reintroduction)
    allFoods.sort((a, b) => a.priority - b.priority)

    schedule.push('Reintroduction Schedule:')
    schedule.push('Week 1-2: Reintroduce low sensitivity foods')
    schedule.push('Week 3-4: Reintroduce moderate sensitivity foods')
    schedule.push('Week 5-6: Reintroduce high sensitivity foods (if needed)')

    return schedule
  }

  // Method to calculate total IgG score
  calculateTotalIggScore(analysis: KBMAAnalysis): number {
    const allFoods = [
      ...analysis.highSensitivityFoods,
      ...analysis.moderateSensitivityFoods,
      ...analysis.lowSensitivityFoods
    ]

    return allFoods.reduce((total, food) => total + food.iggLevel, 0)
  }
}

export default KBMAAnalyzer 