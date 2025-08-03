import { supabase } from './supabase'
import { AnalysisResult, AnalyzedReport } from './lab-analyzers/master-analyzer'
import { NutriQParsedReport } from './lab-analyzers/nutriq-analyzer'
import { KBMOParsedReport } from './lab-analyzers/kbmo-analyzer'
import { DutchParsedReport } from './lab-analyzers/dutch-analyzer'

export interface DatabaseAnalysisResult {
  id: string
  clientId: string
  reportType: string
  reportDate: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  filePath: string
  fileSize: number
  analysisResults: any
  notes: string
  createdAt: string
  updatedAt: string
}

export class DatabaseService {
  private static instance: DatabaseService

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async saveAnalysisResult(
    analysisResult: AnalysisResult,
    clientId: string,
    filePath: string,
    fileSize: number
  ): Promise<string> {
    try {
      // First, create the lab report record
      const { data: labReport, error: labReportError } = await supabase
        .from('lab_reports')
        .insert({
          client_id: clientId,
          report_type: analysisResult.reportType,
          report_date: this.extractReportDate(analysisResult.analyzedReport),
          status: 'completed',
          file_path: filePath,
          file_size: fileSize,
          analysis_results: analysisResult.analyzedReport,
          notes: `Analysis completed with ${(analysisResult.confidence * 100).toFixed(1)}% confidence`
        })
        .select()
        .single()

      if (labReportError) {
        throw new Error(`Failed to create lab report: ${labReportError.message}`)
      }

      // Save specific analysis results based on report type
      switch (analysisResult.reportType) {
        case 'nutriq':
          await this.saveNutriQResults(labReport.id, analysisResult.analyzedReport as NutriQParsedReport)
          break
        case 'kbmo':
          await this.saveKBMOResults(labReport.id, analysisResult.analyzedReport as KBMOParsedReport)
          break
        case 'dutch':
          await this.saveDutchResults(labReport.id, analysisResult.analyzedReport as DutchParsedReport)
          break
        case 'cgm':
          await this.saveCGMResults(labReport.id, analysisResult.analyzedReport)
          break
        case 'food_photo':
          await this.saveFoodPhotoResults(labReport.id, analysisResult.analyzedReport)
          break
      }

      return labReport.id
    } catch (error) {
      throw new Error(`Failed to save analysis result: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async saveNutriQResults(labReportId: string, nutriqReport: NutriQParsedReport): Promise<void> {
    const { nutriqAnalysis } = nutriqReport

    const { error } = await supabase
      .from('nutriq_results')
      .insert({
        lab_report_id: labReportId,
        total_score: nutriqAnalysis.totalScore,
        energy_score: nutriqAnalysis.bodySystems.energy.score,
        mood_score: nutriqAnalysis.bodySystems.mood.score,
        sleep_score: nutriqAnalysis.bodySystems.sleep.score,
        stress_score: nutriqAnalysis.bodySystems.stress.score,
        digestion_score: nutriqAnalysis.bodySystems.digestion.score,
        immunity_score: nutriqAnalysis.bodySystems.immunity.score,
        detailed_answers: nutriqAnalysis.bodySystems,
        recommendations: nutriqAnalysis.overallRecommendations.join('\n')
      })

    if (error) {
      throw new Error(`Failed to save NutriQ results: ${error.message}`)
    }
  }

  private async saveKBMOResults(labReportId: string, kbmoReport: KBMOParsedReport): Promise<void> {
    const { kbmoAnalysis } = kbmoReport

    const { error } = await supabase
      .from('kbmo_results')
      .insert({
        lab_report_id: labReportId,
        total_igg_score: kbmoAnalysis.totalIggScore,
        high_sensitivity_foods: kbmoAnalysis.highSensitivityFoods,
        moderate_sensitivity_foods: kbmoAnalysis.moderateSensitivityFoods,
        low_sensitivity_foods: kbmoAnalysis.lowSensitivityFoods,
        elimination_diet_recommendations: kbmoAnalysis.eliminationDietPlan.join('\n'),
        reintroduction_plan: kbmoAnalysis.reintroductionSchedule.join('\n')
      })

    if (error) {
      throw new Error(`Failed to save KBMO results: ${error.message}`)
    }
  }

  private async saveDutchResults(labReportId: string, dutchReport: DutchParsedReport): Promise<void> {
    const { dutchAnalysis } = dutchReport

    const { error } = await supabase
      .from('dutch_results')
      .insert({
        lab_report_id: labReportId,
        cortisol_am: dutchAnalysis.cortisolPattern.am.value,
        cortisol_pm: dutchAnalysis.cortisolPattern.pm.value,
        dhea: dutchAnalysis.sexHormones.dhea.value,
        testosterone_total: dutchAnalysis.sexHormones.testosterone.value,
        testosterone_free: dutchAnalysis.sexHormones.testosterone.value, // Assuming same value for now
        estradiol: dutchAnalysis.sexHormones.estradiol.value,
        progesterone: dutchAnalysis.sexHormones.progesterone.value,
        melatonin: 0, // Not in current analysis
        organic_acid_metabolites: dutchAnalysis.organicAcids,
        hormone_analysis: dutchAnalysis.hormoneAnalysis,
        recommendations: dutchAnalysis.recommendations.join('\n')
      })

    if (error) {
      throw new Error(`Failed to save Dutch results: ${error.message}`)
    }
  }

  private async saveCGMResults(labReportId: string, cgmReport: AnalyzedReport): Promise<void> {
    // For CGM, we'll save the analysis results in the main lab_reports table
    // and potentially create individual CGM data points if needed
    const { error } = await supabase
      .from('lab_reports')
      .update({
        analysis_results: cgmReport
      })
      .eq('id', labReportId)

    if (error) {
      throw new Error(`Failed to save CGM results: ${error.message}`)
    }
  }

  private async saveFoodPhotoResults(labReportId: string, foodPhotoReport: AnalyzedReport): Promise<void> {
    // For food photos, we'll save the analysis results in the main lab_reports table
    const { error } = await supabase
      .from('lab_reports')
      .update({
        analysis_results: foodPhotoReport
      })
      .eq('id', labReportId)

    if (error) {
      throw new Error(`Failed to save food photo results: ${error.message}`)
    }
  }

  private extractReportDate(analyzedReport: AnalyzedReport): string {
    // Try to extract date from different report types
    if ('testDate' in analyzedReport && analyzedReport.testDate) {
      return analyzedReport.testDate.toISOString().split('T')[0];
    }
    
    if ('collectionDate' in analyzedReport && analyzedReport.collectionDate) {
      return analyzedReport.collectionDate;
    }
    
    if ('processingDate' in analyzedReport && analyzedReport.processingDate) {
      return analyzedReport.processingDate;
    }
    
    // Fallback to current date
    return new Date().toISOString().split('T')[0];
  }

  async getAnalysisStatus(labReportId: string): Promise<DatabaseAnalysisResult | null> {
    try {
      const { data, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('id', labReportId)
        .single()

      if (error) {
        throw new Error(`Failed to get analysis status: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error getting analysis status:', error)
      return null
    }
  }

  async getClientReports(clientId: string): Promise<DatabaseAnalysisResult[]> {
    try {
      const { data, error } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get client reports: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error getting client reports:', error)
      return []
    }
  }

  async updateAnalysisStatus(labReportId: string, status: 'pending' | 'processing' | 'completed' | 'failed', notes?: string): Promise<void> {
    try {
      const updateData: any = { status }
      if (notes) {
        updateData.notes = notes
      }

      const { error } = await supabase
        .from('lab_reports')
        .update(updateData)
        .eq('id', labReportId)

      if (error) {
        throw new Error(`Failed to update analysis status: ${error.message}`)
      }
    } catch (error) {
      throw new Error(`Failed to update analysis status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getPendingAnalyses(): Promise<DatabaseAnalysisResult[]> {
    try {
      const { data, error } = await supabase
        .from('lab_reports')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to get pending analyses: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error getting pending analyses:', error)
      return []
    }
  }

  async createClient(email: string, firstName: string, lastName: string, dateOfBirth?: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          email,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dateOfBirth
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create client: ${error.message}`)
      }

      return data.id
    } catch (error) {
      throw new Error(`Failed to create client: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async findOrCreateClient(email: string, firstName?: string, lastName?: string, dateOfBirth?: string): Promise<string> {
    try {
      // First, try to find existing client
      const { data: existingClient, error: findError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single()

      if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw new Error(`Failed to find client: ${findError.message}`)
      }

      if (existingClient) {
        return existingClient.id
      }

      // Create new client if not found
      if (!firstName || !lastName) {
        throw new Error('First name and last name are required to create a new client')
      }

      return await this.createClient(email, firstName, lastName, dateOfBirth)
    } catch (error) {
      throw new Error(`Failed to find or create client: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export default DatabaseService 