import PDFLabParser, { ParsedLabReport } from './pdf-parser'
import ClaudeClient, { DutchAnalysis } from '../claude-client'

export interface DutchParsedReport extends ParsedLabReport {
  dutchAnalysis: DutchAnalysis
  reportType: 'dutch'
}

export class DutchAnalyzer {
  private static instance: DutchAnalyzer
  private pdfParser: PDFLabParser
  private claudeClient: ClaudeClient

  private constructor() {
    this.pdfParser = PDFLabParser.getInstance()
    this.claudeClient = ClaudeClient.getInstance()
  }

  static getInstance(): DutchAnalyzer {
    if (!DutchAnalyzer.instance) {
      DutchAnalyzer.instance = new DutchAnalyzer()
    }
    return DutchAnalyzer.instance
  }

  async analyzeDutchReport(pdfBuffer: Buffer): Promise<DutchParsedReport> {
    try {
      // First, parse the PDF to get basic text
      const basicParsedReport = await this.pdfParser.parseLabReport(pdfBuffer)
      
      // Extract patient information from the PDF text
      const patientInfo = this.extractDutchPatientInfo(basicParsedReport.rawText)
      
      // Use Claude to analyze the Dutch hormone test results
      const dutchAnalysis = await this.claudeClient.analyzeDutch(basicParsedReport.rawText)
      
      // Combine the results
      const dutchReport: DutchParsedReport = {
        ...basicParsedReport,
        ...patientInfo,
        dutchAnalysis,
        reportType: 'dutch'
      }

      return dutchReport
    } catch (error) {
      throw new Error(`Failed to analyze Dutch report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private extractDutchPatientInfo(rawText: string): Partial<ParsedLabReport> {
    const patientInfo: Partial<ParsedLabReport> = {}

    // Extract patient name - Dutch typically has "Patient Name:" or "Client Name:"
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

  // Helper method to validate Dutch analysis results
  validateDutchAnalysis(analysis: DutchAnalysis): { valid: boolean; reasons: string[] } {
    const reasons: string[] = []
    
    // Check if all required fields are present
    if (!analysis.cortisolPattern || typeof analysis.cortisolPattern !== 'object') {
      reasons.push('Missing cortisol pattern analysis')
    }

    if (!analysis.sexHormones || typeof analysis.sexHormones !== 'object') {
      reasons.push('Missing sex hormones analysis')
    }

    if (!analysis.organicAcids || !Array.isArray(analysis.organicAcids)) {
      reasons.push('Missing organic acids analysis')
    }

    return {
      valid: reasons.length === 0,
      reasons
    }
  }

  // Method to get hormone imbalance summary
  getHormoneImbalanceSummary(analysis: DutchAnalysis): string[] {
    const summary: string[] = []
    
    // Check cortisol pattern
    const cortisolAM = analysis.cortisolPattern.am
    const cortisolPM = analysis.cortisolPattern.pm
    
    if (cortisolAM.status !== 'normal' || cortisolPM.status !== 'normal') {
      summary.push(`Cortisol pattern: ${analysis.cortisolPattern.pattern}`)
      summary.push(`AM cortisol: ${cortisolAM.status} (${cortisolAM.value} ${cortisolAM.unit})`)
      summary.push(`PM cortisol: ${cortisolPM.status} (${cortisolPM.value} ${cortisolPM.unit})`)
    }

    // Check sex hormones
    const sexHormones = analysis.sexHormones
    Object.entries(sexHormones).forEach(([hormone, result]) => {
      if (result.status !== 'normal') {
        summary.push(`${hormone}: ${result.status} (${result.value} ${result.unit})`)
      }
    })

    return summary
  }

  // Method to get priority recommendations based on hormone levels
  getPriorityRecommendations(analysis: DutchAnalysis): string[] {
    const priorities: string[] = []
    
    // Check for adrenal dysfunction
    if (analysis.cortisolPattern.pattern !== 'normal') {
      priorities.push('Address adrenal function and stress management')
    }

    // Check for sex hormone imbalances
    const sexHormones = analysis.sexHormones
    const imbalancedHormones = Object.entries(sexHormones).filter(([, result]) => result.status !== 'normal')
    
    if (imbalancedHormones.length > 0) {
      priorities.push('Address sex hormone balance')
    }

    // Check for organic acid issues
    const abnormalOrganicAcids = analysis.organicAcids.filter(acid => acid.status !== 'normal')
    if (abnormalOrganicAcids.length > 0) {
      priorities.push('Address metabolic pathways and nutrient deficiencies')
    }

    return priorities
  }

  // Method to calculate overall hormone health score
  calculateHormoneHealthScore(analysis: DutchAnalysis): number {
    let score = 100
    let totalTests = 0

    // Check cortisol pattern
    if (analysis.cortisolPattern.pattern !== 'normal') {
      score -= 20
    }
    totalTests += 1

    // Check sex hormones
    const sexHormones = analysis.sexHormones
    Object.values(sexHormones).forEach(result => {
      if (result.status !== 'normal') {
        score -= 15
      }
      totalTests += 1
    })

    // Check organic acids
    analysis.organicAcids.forEach(acid => {
      if (acid.status !== 'normal') {
        score -= 5
      }
      totalTests += 1
    })

    return Math.max(0, score)
  }

  // Method to get follow-up testing recommendations
  getFollowUpTests(analysis: DutchAnalysis): string[] {
    const followUpTests: string[] = []
    
    // Add specific follow-up tests based on findings
    if (analysis.cortisolPattern.pattern !== 'normal') {
      followUpTests.push('Repeat cortisol testing in 3 months')
      followUpTests.push('Consider adrenal stress index')
    }

    const sexHormones = analysis.sexHormones
    const imbalancedHormones = Object.entries(sexHormones).filter(([, result]) => result.status !== 'normal')
    
    if (imbalancedHormones.length > 0) {
      followUpTests.push('Repeat sex hormone panel in 3 months')
    }

    const abnormalOrganicAcids = analysis.organicAcids.filter(acid => acid.status !== 'normal')
    if (abnormalOrganicAcids.length > 0) {
      followUpTests.push('Consider comprehensive metabolic panel')
      followUpTests.push('Vitamin and mineral testing')
    }

    return followUpTests
  }
}

export default DutchAnalyzer 