import { supabase } from '../supabase'

export interface ClientProfile {
  id: string
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  occupation?: string
  primaryHealthConcern?: string
  truckDriver: boolean
  createdAt: string
}

export interface Assessment {
  id: string
  type: 'nutriq' | 'structured' | 'quick'
  date: string
  responses?: any
  results?: any
  totalScore?: number
  bodySystems?: any
  recommendations?: string[]
  priorityActions?: string[]
}

export interface SessionNote {
  id: string
  type: 'interview' | 'coaching_call' | 'assistant' | 'admin' | 'follow_up'
  content: string
  author?: string
  createdAt: string
}

export interface Document {
  id: string
  name: string
  type: 'lab_result' | 'intake_form' | 'protocol' | 'other'
  fileUrl?: string
  extractedText?: string
  uploadedAt: string
}

export interface LabResult {
  id: string
  reportType: string
  reportDate: string
  status: string
  results: any
  notes?: string
}

export interface Protocol {
  id: string
  phase: string
  startDate: string
  content: string
  compliance?: number
  status: 'active' | 'completed' | 'paused'
  createdAt: string
}

export interface ProgressMetric {
  date: string
  type: string
  value: number
  notes?: string
}

export interface ComprehensiveAnalysis {
  id: string
  clientId: string
  analysisDate: string
  executiveSummary: ExecutiveSummary
  rootCauseAnalysis: RootCause[]
  systemsPriority: Record<string, number>
  systemsPriorityRationale?: Record<string, string>
  progressComparison?: ProgressComparison
  supplementProtocol: SupplementProtocol
  treatmentPhases: TreatmentPhases
  lifestyleIntegration: LifestyleIntegration
  monitoringPlan: MonitoringPlan
  urgentConcerns: string[]
  expectedTimeline: ExpectedTimeline
  practitionerNotes: PractitionerNotes
}

export interface ExecutiveSummary {
  primaryFocus: string
  criticalRootCauses: CriticalRootCause[]
  protocolTimeline: string
  expectedOutcomes: string[]
}

export interface CriticalRootCause {
  name: string
  severity: 'Critical' | 'Moderate' | 'Mild'
  score: number
  explanation: string
}

export interface LifestyleIntegration {
  sleepOptimization: string[]
  stressManagement: string[]
  movement: string[]
  environmentalFactors: string[]
}

export interface MonitoringPlan {
  weeklyCheckpoints: MonitoringMetric[]
  monthlyAssessments: MonitoringMetric[]
  redFlags: RedFlag[]
}

export interface MonitoringMetric {
  metric: string
  measurement: string
  target: string
}

export interface RedFlag {
  category: string
  symptoms: string[]
  action: string
}

export interface ExpectedTimeline {
  week2to4: string[]
  month2to3: string[]
  month3to6: string[]
}

export interface PractitionerNotes {
  protocolRationale: string
  keySuccessFactors: string[]
  potentialChallenges: string[]
  modificationsForLifestyle: string[]
  followUpRecommendations: string
}

export interface RootCause {
  name: string
  confidence: number
  severity: 'Critical' | 'Moderate' | 'Mild'
  explanation: string
  affectedSystems: string[]
  lifestyleFactors: string[]
  clinicalEvidence: string
}

export interface ProgressComparison {
  improvementAreas: ProgressArea[]
  worsenedAreas: ProgressArea[]
  stableAreas: string[]
  protocolEffectiveness: Record<string, number>
  complianceCorrelation: Record<string, number>
  nextRecommendations: string[]
}

export interface ProgressArea {
  system: string
  improvement?: number
  decline?: number
  likelyFactors?: string[]
  possibleCauses?: string[]
}

export interface SupplementProtocol {
  phase1: SupplementRecommendation[]
  phase2: SupplementRecommendation[]
  phase3: SupplementRecommendation[]
  totalMonthlyCost: number
}

export interface SupplementRecommendation {
  name: string
  dosage: string
  timing: string
  source: 'LetsTrack' | 'Biotics' | 'Fullscript'
  productUrl?: string
  price?: number
  inStock?: boolean
  practitionerCode?: string
  phase: number
  rationale: string
  truckCompatible: boolean
  instructions: string
}

export interface TreatmentPhases {
  phase1: TreatmentPhase
  phase2: TreatmentPhase
  phase3: TreatmentPhase
}

export interface TreatmentPhase {
  duration: string
  goal: string
  dietaryChanges: string[]
  lifestyleModifications: string[]
  focusAreas: string[]
  supplements: SupplementRecommendation[]
}

export interface SuccessMetric {
  name: string
  target: string
  timeline: string
  measurement: string
}

export interface ClientDataAggregate {
  clientId: string
  personalInfo: ClientProfile
  assessmentHistory: Assessment[]
  sessionNotes: SessionNote[]
  uploadedDocuments: Document[]
  labResults: LabResult[]
  protocolHistory: Protocol[]
  progressMetrics: ProgressMetric[]
  lastAnalysis?: ComprehensiveAnalysis
}

export class ClientDataAggregator {
  async aggregateAllClientData(clientId: string): Promise<ClientDataAggregate> {
    const [
      clientProfile,
      assessments,
      sessionNotes,
      documents,
      labResults,
      protocols,
      progressMetrics,
      lastAnalysis
    ] = await Promise.all([
      this.getClientProfile(clientId),
      this.getAllAssessments(clientId),
      this.getAllSessionNotes(clientId),
      this.getAllUploadedDocuments(clientId),
      this.getAllLabResults(clientId),
      this.getAllProtocols(clientId),
      this.getProgressMetrics(clientId),
      this.getLastAnalysis(clientId)
    ]);

    return {
      clientId,
      personalInfo: clientProfile,
      assessmentHistory: assessments.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
      sessionNotes: sessionNotes.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      uploadedDocuments: documents,
      labResults: labResults,
      protocolHistory: protocols,
      progressMetrics: progressMetrics,
      lastAnalysis: lastAnalysis
    };
  }

  private async getClientProfile(clientId: string): Promise<ClientProfile> {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch client profile: ${error.message}`);
    }

    return {
      id: client.id,
      name: `${client.first_name} ${client.last_name}`,
      email: client.email,
      phone: client.phone,
      dateOfBirth: client.date_of_birth,
      occupation: client.occupation,
      primaryHealthConcern: client.primary_health_concern,
      truckDriver: client.occupation?.toLowerCase().includes('truck') || 
                   client.occupation?.toLowerCase().includes('driver') || false,
      createdAt: client.created_at
    };
  }

  private async getAllAssessments(clientId: string): Promise<Assessment[]> {
    const assessments: Assessment[] = [];

    // Get NutriQ assessments
    const { data: nutriqResults, error: nutriqError } = await supabase
      .from('nutriq_results')
      .select(`
        *,
        lab_reports!inner(
          client_id,
          report_date,
          analysis_results
        )
      `)
      .eq('lab_reports.client_id', clientId)
      .order('created_at', { ascending: false });

    if (!nutriqError && nutriqResults) {
      for (const result of nutriqResults) {
        // Try to get a valid date
        let assessmentDate = result.created_at;
        if (result.lab_reports?.report_date) {
          const reportDate = new Date(result.lab_reports.report_date);
          if (!isNaN(reportDate.getTime())) {
            assessmentDate = result.lab_reports.report_date;
          }
        }
        
        assessments.push({
          id: result.id,
          type: 'nutriq',
          date: assessmentDate,
          totalScore: result.total_score,
          bodySystems: result.lab_reports.analysis_results?.bodySystems || result.body_systems,
          recommendations: result.lab_reports.analysis_results?.overallRecommendations || result.recommendations,
          priorityActions: result.lab_reports.analysis_results?.priorityActions || result.lab_reports.analysis_results?.priority_actions
        });
      }
    }

    // Get structured assessments from ai_conversations
    try {
      const { data: structuredAssessments, error: structuredError } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          conversation_messages!inner(
            id,
            content,
            structured_response,
            question_id,
            section
          )
        `)
        .eq('client_id', clientId)
        .eq('assessment_type', 'structured')
        .order('created_at', { ascending: false });

      if (!structuredError && structuredAssessments) {
        for (const assessment of structuredAssessments) {
          // Extract responses from conversation messages
          const responses = assessment.conversation_messages
            .filter((msg: any) => msg.structured_response)
            .map((msg: any) => ({
              questionId: msg.question_id,
              section: msg.section,
              response: msg.structured_response,
              content: msg.content
            }));

          assessments.push({
            id: assessment.id,
            type: 'structured',
            date: assessment.created_at,
            responses: responses,
            results: {
              status: assessment.status,
              questionsAnswered: assessment.questions_answered,
              currentSection: assessment.current_section
            }
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not fetch structured assessments: ${error}`);
    }

    // Get quick analysis assessments
    try {
      const { data: quickAnalyses, error: quickError } = await supabase
        .from('quick_analyses')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (!quickError && quickAnalyses) {
        for (const analysis of quickAnalyses) {
          assessments.push({
            id: analysis.id,
            type: 'quick',
            date: analysis.created_at,
            results: analysis.analysis_results
          });
        }
      }
    } catch (error) {
      console.warn(`Warning: Quick analyses table may not exist: ${error}`);
    }

    return assessments;
  }

  private async getAllSessionNotes(clientId: string): Promise<SessionNote[]> {
    const { data: notes, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch session notes: ${error.message}`);
    }

    return notes.map(note => ({
      id: note.id,
      type: note.type as SessionNote['type'],
      content: note.content,
      author: note.author,
      createdAt: note.created_at
    }));
  }

  private async getAllUploadedDocuments(clientId: string): Promise<Document[]> {
    try {
      const { data: documents, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.warn(`Warning: Could not fetch documents: ${error.message}`);
        return [];
      }

      return documents.map(doc => ({
        id: doc.id,
        name: doc.document_name,
        type: doc.document_type as Document['type'],
        fileUrl: doc.file_url,
        uploadedAt: doc.uploaded_at
      }));
    } catch (error) {
      console.warn(`Warning: Documents table may not exist: ${error}`);
      return [];
    }
  }

  private async getAllLabResults(clientId: string): Promise<LabResult[]> {
    const { data: labReports, error } = await supabase
      .from('lab_reports')
      .select(`
        *,
        nutriq_results (
          total_score,
          body_systems,
          symptom_data,
          recommendations,
          ai_analysis
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch lab results: ${error.message}`);
    }

    return labReports.map(report => {
      // For NutriQ reports, also include nutriq_results data
      let results = report.analysis_results || {};
      
      // Check if this is a NutriQ report and merge additional data
      if (report.report_type?.toLowerCase() === 'nutriq' && report.nutriq_results) {
        // nutriq_results is an array, get the first item
        const nutriqData = Array.isArray(report.nutriq_results) ? report.nutriq_results[0] : report.nutriq_results;
        if (nutriqData) {
          results = {
            ...results,
            bodySystems: results.bodySystems || nutriqData.body_systems,
            totalScore: results.totalScore || nutriqData.total_score,
            nutriqAnalysis: nutriqData.ai_analysis,
            recommendations: results.overallRecommendations || nutriqData.recommendations,
            priorityActions: results.priorityActions || results.priority_actions,
            symptomData: nutriqData.symptom_data
          };
        }
      }
      
      return {
        id: report.id,
        reportType: report.report_type,
        reportDate: report.report_date,
        status: report.status,
        results: results,
        notes: report.notes
      };
    });
  }

  private async getAllProtocols(clientId: string): Promise<Protocol[]> {
    const { data: protocols, error } = await supabase
      .from('protocols')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch protocols: ${error.message}`);
    }

    return protocols.map(protocol => ({
      id: protocol.id,
      phase: protocol.phase,
      startDate: protocol.start_date,
      content: protocol.content,
      compliance: protocol.compliance,
      status: protocol.status as Protocol['status'],
      createdAt: protocol.created_at
    }));
  }

  private async getProgressMetrics(clientId: string): Promise<ProgressMetric[]> {
    // For now, we'll create progress metrics based on assessment history
    // In the future, this could be a dedicated table
    const assessments = await this.getAllAssessments(clientId);
    const metrics: ProgressMetric[] = [];

    // Create metrics from assessment history
    for (const assessment of assessments) {
      if (assessment.totalScore) {
        metrics.push({
          date: assessment.date,
          type: 'nutriq_score',
          value: assessment.totalScore,
          notes: `Assessment score from ${assessment.type} assessment`
        });
      }
    }

    return metrics;
  }

  private async getLastAnalysis(clientId: string): Promise<ComprehensiveAnalysis | undefined> {
    try {
      const { data: analyses, error } = await supabase
        .from('comprehensive_analyses')
        .select('*')
        .eq('client_id', clientId)
        .order('analysis_date', { ascending: false })
        .limit(1);

      if (error || !analyses || analyses.length === 0) {
        return undefined;
      }

      const analysis = analyses[0];
      return {
        id: analysis.id,
        clientId: analysis.client_id,
        analysisDate: analysis.analysis_date,
        executiveSummary: analysis.executive_summary || {
          primaryFocus: 'Health optimization',
          criticalRootCauses: [],
          protocolTimeline: '90-day intensive phase',
          expectedOutcomes: []
        },
        rootCauseAnalysis: analysis.root_causes || [],
        systemsPriority: analysis.systems_priority || {},
        progressComparison: analysis.progress_comparison,
        supplementProtocol: analysis.supplement_protocol || {
          phase1: [],
          phase2: [],
          phase3: [],
          totalMonthlyCost: 0
        },
        treatmentPhases: analysis.treatment_phases || {
          phase1: { duration: '', goal: '', dietaryChanges: [], lifestyleModifications: [], focusAreas: [], supplements: [] },
          phase2: { duration: '', goal: '', dietaryChanges: [], lifestyleModifications: [], focusAreas: [], supplements: [] },
          phase3: { duration: '', goal: '', dietaryChanges: [], lifestyleModifications: [], focusAreas: [], supplements: [] }
        },
        lifestyleIntegration: analysis.lifestyle_integration || {
          sleepOptimization: [],
          stressManagement: [],
          movement: [],
          environmentalFactors: []
        },
        monitoringPlan: analysis.monitoring_plan || {
          weeklyCheckpoints: [],
          monthlyAssessments: [],
          redFlags: []
        },
        urgentConcerns: analysis.urgent_concerns || [],
        expectedTimeline: analysis.expected_timeline || {
          week2to4: [],
          month2to3: [],
          month3to6: []
        },
        practitionerNotes: analysis.practitioner_notes || {
          protocolRationale: '',
          keySuccessFactors: [],
          potentialChallenges: [],
          modificationsForLifestyle: [],
          followUpRecommendations: ''
        }
      };
    } catch (error) {
      console.warn(`Warning: Comprehensive analyses table may not exist: ${error}`);
      return undefined;
    }
  }
} 