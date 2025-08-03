import PDFLabParser, { ParsedLabReport } from './pdf-parser'
import ClaudeClient from '../claude-client'
import NutriQAnalyzer, { NutriQParsedReport } from './nutriq-analyzer'
import KBMAAnalyzer, { KBMOParsedReport } from './kbmo-analyzer'
import DutchAnalyzer, { DutchParsedReport } from './dutch-analyzer'
import { EnhancedDocumentClassifier, DocumentType } from '../document-processors/enhanced-document-classifier'
import { FITTestAnalyzer, FITTestResult } from './fit-test-analyzer'
import { FormData } from '../client-data-priority'

export type ReportType = 'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo' | 'fit_test' | 'stool_test' | 'blood_test' | 'urine_test' | 'saliva_test' | 'lab_report'

export type AnalyzedReport = 
  | NutriQParsedReport 
  | KBMOParsedReport 
  | DutchParsedReport
  | FITTestResult
  | (ParsedLabReport & { reportType: 'cgm' | 'food_photo' | 'stool_test' | 'blood_test' | 'urine_test' | 'saliva_test' | 'lab_report' })

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
  private fitTestAnalyzer: FITTestAnalyzer
  private documentClassifier: EnhancedDocumentClassifier

  private constructor() {
    this.pdfParser = PDFLabParser.getInstance()
    this.claudeClient = ClaudeClient.getInstance()
    this.nutriqAnalyzer = NutriQAnalyzer.getInstance()
    this.kbmoAnalyzer = KBMAAnalyzer.getInstance()
    this.dutchAnalyzer = DutchAnalyzer.getInstance()
    this.fitTestAnalyzer = FITTestAnalyzer.getInstance()
    this.documentClassifier = EnhancedDocumentClassifier.getInstance()
  }

  static getInstance(): MasterAnalyzer {
    if (!MasterAnalyzer.instance) {
      MasterAnalyzer.instance = new MasterAnalyzer()
    }
    return MasterAnalyzer.instance
  }

  async analyzeReport(pdfBuffer: Buffer, documentName?: string): Promise<AnalysisResult> {
    console.log('[MASTER-ANALYZER] ===== Starting enhanced analysis pipeline =====')
    const startTime = Date.now()
    
    try {
      // Step 1: Parse PDF to extract text (now includes vision analysis)
      console.log('[MASTER-ANALYZER] Step 1: Parsing PDF to extract text...')
      const basicParsedReport = await this.pdfParser.parseLabReport(pdfBuffer)
      console.log('[MASTER-ANALYZER] PDF parsed successfully, text length:', basicParsedReport.rawText.length)
      
      // Log vision analysis usage
      if (basicParsedReport.hasImageContent) {
        console.log('[MASTER-ANALYZER] PDF contains image content, vision analysis was used')
        console.log('[MASTER-ANALYZER] Vision text length:', basicParsedReport.visionAnalysisText?.length || 0)
      }
      
      // Step 2: Enhanced document classification
      console.log('[MASTER-ANALYZER] Step 2: Enhanced document classification...')
      const textForClassification = basicParsedReport.combinedText || basicParsedReport.rawText
      const classification = await this.documentClassifier.classifyDocument(textForClassification, documentName)
      const detectedType: ReportType = classification.type as ReportType
      
      console.log('[MASTER-ANALYZER] Document classified as:', detectedType, 'with confidence:', classification.confidence)
      console.log('[MASTER-ANALYZER] Classification description:', classification.description)
      
      // Step 3: Route to appropriate analyzer
      console.log('[MASTER-ANALYZER] Step 3: Routing to specific analyzer for type:', detectedType)
      let analyzedReport: AnalyzedReport
      
      switch (detectedType) {
        case 'nutriq':
          console.log('[MASTER-ANALYZER] Analyzing as NutriQ report...')
          try {
            analyzedReport = await this.nutriqAnalyzer.analyzeNutriQReport(pdfBuffer)
            console.log('[MASTER-ANALYZER] NutriQ analysis complete')
          } catch (nutriqError) {
            console.error('[MASTER-ANALYZER] NutriQ analysis failed:', nutriqError)
            throw new Error(`NutriQ analysis failed: ${nutriqError instanceof Error ? nutriqError.message : 'Unknown error'}`)
          }
          break
          
        case 'kbmo':
          console.log('[MASTER-ANALYZER] Analyzing as KBMO report...')
          try {
            analyzedReport = await this.kbmoAnalyzer.analyzeKBMReport(pdfBuffer)
            console.log('[MASTER-ANALYZER] KBMO analysis complete')
          } catch (kbmoError) {
            console.error('[MASTER-ANALYZER] KBMO analysis failed:', kbmoError)
            throw new Error(`KBMO analysis failed: ${kbmoError instanceof Error ? kbmoError.message : 'Unknown error'}`)
          }
          break
          
        case 'dutch':
          console.log('[MASTER-ANALYZER] Analyzing as Dutch report...')
          try {
            analyzedReport = await this.dutchAnalyzer.analyzeDutchReport(pdfBuffer)
            console.log('[MASTER-ANALYZER] Dutch analysis complete')
          } catch (dutchError) {
            console.error('[MASTER-ANALYZER] Dutch analysis failed:', dutchError)
            throw new Error(`Dutch analysis failed: ${dutchError instanceof Error ? dutchError.message : 'Unknown error'}`)
          }
          break
          
        case 'fit_test':
          console.log('[MASTER-ANALYZER] Analyzing as FIT test...')
          try {
            analyzedReport = await this.fitTestAnalyzer.analyzeFITTest(textForClassification)
            console.log('[MASTER-ANALYZER] FIT test analysis complete')
          } catch (fitError) {
            console.error('[MASTER-ANALYZER] FIT test analysis failed:', fitError)
            throw new Error(`FIT test analysis failed: ${fitError instanceof Error ? fitError.message : 'Unknown error'}`)
          }
          break
          
        case 'cgm':
          console.log('[MASTER-ANALYZER] Analyzing as CGM report...')
          try {
            analyzedReport = await this.analyzeCGMReport(pdfBuffer, basicParsedReport)
            console.log('[MASTER-ANALYZER] CGM analysis complete')
          } catch (cgmError) {
            console.error('[MASTER-ANALYZER] CGM analysis failed:', cgmError)
            throw new Error(`CGM analysis failed: ${cgmError instanceof Error ? cgmError.message : 'Unknown error'}`)
          }
          break
          
        case 'food_photo':
          console.log('[MASTER-ANALYZER] Analyzing as food photo...')
          try {
            analyzedReport = await this.analyzeFoodPhotoReport(pdfBuffer, basicParsedReport)
            console.log('[MASTER-ANALYZER] Food photo analysis complete')
          } catch (foodError) {
            console.error('[MASTER-ANALYZER] Food photo analysis failed:', foodError)
            throw new Error(`Food photo analysis failed: ${foodError instanceof Error ? foodError.message : 'Unknown error'}`)
          }
          break
          
        case 'stool_test':
        case 'blood_test':
        case 'urine_test':
        case 'saliva_test':
        case 'lab_report':
          console.log(`[MASTER-ANALYZER] Analyzing as ${detectedType}...`)
          try {
            analyzedReport = await this.analyzeGenericLabReport(pdfBuffer, basicParsedReport, detectedType)
            console.log(`[MASTER-ANALYZER] ${detectedType} analysis complete`)
          } catch (labError) {
            console.error(`[MASTER-ANALYZER] ${detectedType} analysis failed:`, labError)
            throw new Error(`${detectedType} analysis failed: ${labError instanceof Error ? labError.message : 'Unknown error'}`)
          }
          break
          
        default:
          console.warn('[MASTER-ANALYZER] Unknown report type, defaulting to generic analysis')
          try {
            analyzedReport = await this.analyzeGenericLabReport(pdfBuffer, basicParsedReport, 'lab_report')
            console.log('[MASTER-ANALYZER] Generic analysis complete')
          } catch (genericError) {
            console.error('[MASTER-ANALYZER] Generic analysis failed:', genericError)
            throw new Error(`Generic analysis failed: ${genericError instanceof Error ? genericError.message : 'Unknown error'}`)
          }
      }
      
      // Step 4: Calculate confidence and processing time
      const processingTime = Date.now() - startTime
      const confidence = this.calculateConfidence(analyzedReport, detectedType, basicParsedReport, classification.confidence)
      
      console.log('[MASTER-ANALYZER] ===== Analysis pipeline complete =====')
      console.log('[MASTER-ANALYZER] Processing time:', processingTime, 'ms')
      console.log('[MASTER-ANALYZER] Final confidence:', confidence)
      
      return {
        reportType: detectedType,
        analyzedReport,
        processingTime,
        confidence
      }
      
    } catch (error) {
      const errorTime = Date.now() - startTime
      console.error('[MASTER-ANALYZER] ===== Analysis pipeline failed =====')
      console.error('[MASTER-ANALYZER] Error after', errorTime, 'ms:', error)
      throw new Error(`Master analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async analyzeCGMReport(pdfBuffer: Buffer, basicParsedReport: ParsedLabReport): Promise<AnalyzedReport> {
    try {
      console.log('[MASTER-ANALYZER] Sending CGM data to Claude for analysis...')
      // For CGM reports, use the combined text if available
      const textForAnalysis = basicParsedReport.combinedText || basicParsedReport.rawText
      const cgmAnalysis = await this.claudeClient.analyzeCGM(textForAnalysis)
      console.log('[MASTER-ANALYZER] Claude CGM analysis received')
      
      return {
        ...basicParsedReport,
        reportType: 'cgm',
        analysisResults: cgmAnalysis
      } as AnalyzedReport
    } catch (error) {
      console.error('[MASTER-ANALYZER] CGM Claude analysis error:', error)
      throw new Error(`CGM analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async analyzeFoodPhotoReport(pdfBuffer: Buffer, basicParsedReport: ParsedLabReport): Promise<AnalyzedReport> {
    try {
      console.log('[MASTER-ANALYZER] Sending food photo data to Claude for analysis...')
      // For food photos, use the combined text if available
      const textForAnalysis = basicParsedReport.combinedText || basicParsedReport.rawText
      const foodAnalysis = await this.claudeClient.analyzeFoodPhoto(textForAnalysis)
      console.log('[MASTER-ANALYZER] Claude food photo analysis received')
      
      return {
        ...basicParsedReport,
        reportType: 'food_photo',
        analysisResults: foodAnalysis
      } as AnalyzedReport
    } catch (error) {
      console.error('[MASTER-ANALYZER] Food photo Claude analysis error:', error)
      throw new Error(`Food photo analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async analyzeGenericLabReport(pdfBuffer: Buffer, basicParsedReport: ParsedLabReport, reportType: ReportType): Promise<AnalyzedReport> {
    // For generic lab reports, use the basic parsed report and add type information
    if (reportType === 'cgm' || reportType === 'food_photo' || reportType === 'stool_test' || reportType === 'blood_test' || reportType === 'urine_test' || reportType === 'saliva_test' || reportType === 'lab_report') {
      return {
        ...basicParsedReport,
        reportType
      }
    }
    // Fallback to lab_report if type is not supported
    return {
      ...basicParsedReport,
      reportType: 'lab_report'
    }
  }

  private calculateConfidence(analyzedReport: AnalyzedReport, detectedType: ReportType, parsedReport?: ParsedLabReport, classificationConfidence: number = 0.5): number {
    let confidence = classificationConfidence * 0.4 // 40% weight to classification confidence
    
    // Add confidence based on successful type detection
    confidence += 0.2 // 20% for successful type detection
    
    // Add confidence based on data quality
    if (parsedReport) {
      if (parsedReport.rawText.length > 100) {
        confidence += 0.1 // 10% for sufficient text
      }
      if (parsedReport.hasImageContent && parsedReport.visionAnalysisText) {
        confidence += 0.1 // 10% for successful vision analysis
      }
    }
    
    // Add confidence based on analysis completeness
    if (analyzedReport && typeof analyzedReport === 'object') {
      const keys = Object.keys(analyzedReport)
      if (keys.length > 3) {
        confidence += 0.1 // 10% for comprehensive analysis
      }
    }
    
    // Cap confidence at 1.0
    return Math.min(confidence, 1.0)
  }

  // Method to get a summary of the analysis
  getAnalysisSummary(analysisResult: AnalysisResult): string {
    const { reportType, analyzedReport, confidence } = analysisResult
    
    let summary = `Report Type: ${reportType.toUpperCase()}\n`
    summary += `Confidence: ${(confidence * 100).toFixed(1)}%\n`
    
    if (analyzedReport.patientName) {
      summary += `Patient: ${analyzedReport.patientName}\n`
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
    
    // Test date validation removed for now
    
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