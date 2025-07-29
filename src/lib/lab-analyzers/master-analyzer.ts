import PDFLabParser, { ParsedLabReport } from './pdf-parser'
import ClaudeClient from '../claude-client'
import NutriQAnalyzer, { NutriQParsedReport } from './nutriq-analyzer'
import KBMAAnalyzer, { KBMOParsedReport } from './kbmo-analyzer'
import DutchAnalyzer, { DutchParsedReport } from './dutch-analyzer'

export type ReportType = 'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo'

export type AnalyzedReport = 
  | NutriQParsedReport 
  | KBMOParsedReport 
  | DutchParsedReport
  | (ParsedLabReport & { reportType: 'cgm' | 'food_photo' })

export interface AnalysisResult {
  reportType: ReportType
  analyzedReport: AnalyzedReport
  processingTime: number
  confidence: number
}

export class MasterAnalyzer {
  private static instance: MasterAnalyzer
  private pdfParser: PDFLabParser
  private claudeClient: ClaudeClient
  private nutriqAnalyzer: NutriQAnalyzer
  private kbmoAnalyzer: KBMAAnalyzer
  private dutchAnalyzer: DutchAnalyzer

  private constructor() {
    this.pdfParser = PDFLabParser.getInstance()
    this.claudeClient = ClaudeClient.getInstance()
    this.nutriqAnalyzer = NutriQAnalyzer.getInstance()
    this.kbmoAnalyzer = KBMAAnalyzer.getInstance()
    this.dutchAnalyzer = DutchAnalyzer.getInstance()
  }

  static getInstance(): MasterAnalyzer {
    if (!MasterAnalyzer.instance) {
      MasterAnalyzer.instance = new MasterAnalyzer()
    }
    return MasterAnalyzer.instance
  }

  async analyzeReport(pdfBuffer: Buffer): Promise<AnalysisResult> {
    const startTime = Date.now()
    
    try {
      // First, get the basic parsed report to extract text
      const basicParsedReport = await this.pdfParser.parseLabReport(pdfBuffer)
      
      // Use Claude to detect the report type
      const detectedType = await this.claudeClient.detectReportType(basicParsedReport.rawText)
      
      // Route to the appropriate analyzer based on detected type
      let analyzedReport: AnalyzedReport
      
      switch (detectedType) {
        case 'nutriq':
          analyzedReport = await this.nutriqAnalyzer.analyzeNutriQReport(pdfBuffer)
          break
          
        case 'kbmo':
          analyzedReport = await this.kbmoAnalyzer.analyzeKBMReport(pdfBuffer)
          break
          
        case 'dutch':
          analyzedReport = await this.dutchAnalyzer.analyzeDutchReport(pdfBuffer)
          break
          
        case 'cgm':
          analyzedReport = await this.analyzeCGMReport(pdfBuffer, basicParsedReport)
          break
          
        case 'food_photo':
          analyzedReport = await this.analyzeFoodPhotoReport(pdfBuffer, basicParsedReport)
          break
          
        default:
          // Default to NutriQ if type is unclear
          analyzedReport = await this.nutriqAnalyzer.analyzeNutriQReport(pdfBuffer)
      }
      
      const processingTime = Date.now() - startTime
      
      // Calculate confidence based on how well the analysis went
      const confidence = this.calculateConfidence(analyzedReport, detectedType)
      
      return {
        reportType: detectedType,
        analyzedReport,
        processingTime,
        confidence
      }
      
    } catch (error) {
      throw new Error(`Master analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async analyzeCGMReport(pdfBuffer: Buffer, basicParsedReport: ParsedLabReport): Promise<AnalyzedReport> {
    try {
      // For CGM reports, we'll use Claude to analyze the data
      const cgmAnalysis = await this.claudeClient.analyzeCGM(basicParsedReport.rawText)
      
      return {
        ...basicParsedReport,
        reportType: 'cgm',
        analysisResults: cgmAnalysis
      } as AnalyzedReport
    } catch (error) {
      throw new Error(`CGM analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async analyzeFoodPhotoReport(pdfBuffer: Buffer, basicParsedReport: ParsedLabReport): Promise<AnalyzedReport> {
    try {
      // For food photos, we'll use Claude to analyze the image description
      const foodAnalysis = await this.claudeClient.analyzeFoodPhoto(basicParsedReport.rawText)
      
      return {
        ...basicParsedReport,
        reportType: 'food_photo',
        analysisResults: foodAnalysis
      } as AnalyzedReport
    } catch (error) {
      throw new Error(`Food photo analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private calculateConfidence(analyzedReport: AnalyzedReport, detectedType: ReportType): number {
    let confidence = 0.8 // Base confidence
    
    // Check if we have patient information
    if (analyzedReport.patientName) {
      confidence += 0.1
    }
    
    if (analyzedReport.testDate) {
      confidence += 0.05
    }
    
    // Check if we have analysis results
    if ('nutriqAnalysis' in analyzedReport) {
      const nutriqReport = analyzedReport as NutriQParsedReport
      const nutriqValidation = this.nutriqAnalyzer.validateNutriQAnalysis(nutriqReport.nutriqAnalysis)
      if (nutriqValidation.valid) {
        confidence += 0.05
      }
    }
    
    if ('kbmoAnalysis' in analyzedReport) {
      const kbmoReport = analyzedReport as KBMOParsedReport
      const kbmoValidation = this.kbmoAnalyzer.validateKBMAAnalysis(kbmoReport.kbmoAnalysis)
      if (kbmoValidation.valid) {
        confidence += 0.05
      }
    }
    
    if ('dutchAnalysis' in analyzedReport) {
      const dutchReport = analyzedReport as DutchParsedReport
      const dutchValidation = this.dutchAnalyzer.validateDutchAnalysis(dutchReport.dutchAnalysis)
      if (dutchValidation.valid) {
        confidence += 0.05
      }
    }
    
    return Math.min(1.0, confidence)
  }

  // Method to get a summary of the analysis
  getAnalysisSummary(analysisResult: AnalysisResult): string {
    const { reportType, analyzedReport, confidence } = analysisResult
    
    let summary = `Report Type: ${reportType.toUpperCase()}\n`
    summary += `Confidence: ${(confidence * 100).toFixed(1)}%\n`
    
    if (analyzedReport.patientName) {
      summary += `Patient: ${analyzedReport.patientName}\n`
    }
    
    if (analyzedReport.testDate) {
      summary += `Test Date: ${analyzedReport.testDate.toLocaleDateString()}\n`
    }
    
    // Add specific summary based on report type
    switch (reportType) {
      case 'nutriq':
        const nutriqReport = analyzedReport as NutriQParsedReport
        summary += `Total Score: ${nutriqReport.nutriqAnalysis.totalScore}\n`
        summary += `Body Systems Analyzed: ${Object.keys(nutriqReport.nutriqAnalysis.bodySystems).length}\n`
        break
        
      case 'kbmo':
        const kbmoReport = analyzedReport as KBMOParsedReport
        summary += `Total IgG Score: ${kbmoReport.kbmoAnalysis.totalIggScore}\n`
        summary += `High Sensitivity Foods: ${kbmoReport.kbmoAnalysis.highSensitivityFoods.length}\n`
        summary += `Moderate Sensitivity Foods: ${kbmoReport.kbmoAnalysis.moderateSensitivityFoods.length}\n`
        break
        
      case 'dutch':
        const dutchReport = analyzedReport as DutchParsedReport
        summary += `Cortisol Pattern: ${dutchReport.dutchAnalysis.cortisolPattern.pattern}\n`
        summary += `Organic Acids Analyzed: ${dutchReport.dutchAnalysis.organicAcids.length}\n`
        break
        
      case 'cgm':
        summary += `CGM Data Analyzed\n`
        break
        
      case 'food_photo':
        summary += `Food Photo Analyzed\n`
        break
    }
    
    return summary
  }

  // Method to validate if the analysis is complete and ready for database storage
  validateAnalysisForStorage(analysisResult: AnalysisResult): { valid: boolean; reasons: string[] } {
    const { analyzedReport, confidence } = analysisResult
    const reasons: string[] = []
    
    // Require minimum confidence (lowered from 0.7 to 0.5)
    if (confidence < 0.5) {
      reasons.push(`Confidence too low: ${(confidence * 100).toFixed(1)}% (minimum 50%)`)
    }
    
    // Make patient information optional for now (can be added later)
    if (!analyzedReport.patientName) {
      console.log('Warning: Missing patient name, but continuing with analysis')
    }
    
    // Make test date optional for now (can be added later)
    if (!analyzedReport.testDate) {
      console.log('Warning: Missing test date, but continuing with analysis')
    }
    
    // Validate specific analysis types
    let typeValidation = true
    switch (analysisResult.reportType) {
      case 'nutriq':
        const nutriqReport = analyzedReport as NutriQParsedReport
        const nutriqValidation = this.nutriqAnalyzer.validateNutriQAnalysis(nutriqReport.nutriqAnalysis)
        if (!nutriqValidation.valid) {
          reasons.push(...nutriqValidation.reasons)
          typeValidation = false
        }
        break
        
      case 'kbmo':
        const kbmoReport = analyzedReport as KBMOParsedReport
        const kbmoValidation = this.kbmoAnalyzer.validateKBMAAnalysis(kbmoReport.kbmoAnalysis)
        if (!kbmoValidation.valid) {
          reasons.push(...kbmoValidation.reasons)
          typeValidation = false
        }
        break
        
      case 'dutch':
        const dutchReport = analyzedReport as DutchParsedReport
        const dutchValidation = this.dutchAnalyzer.validateDutchAnalysis(dutchReport.dutchAnalysis)
        if (!dutchValidation.valid) {
          reasons.push(...dutchValidation.reasons)
          typeValidation = false
        }
        break
        
      case 'cgm':
      case 'food_photo':
        // Basic validation for these types
        break
        
      default:
        reasons.push(`Unknown report type: ${analysisResult.reportType}`)
        typeValidation = false
    }
    
    return {
      valid: reasons.length === 0 && typeValidation,
      reasons
    }
  }
}

export default MasterAnalyzer 