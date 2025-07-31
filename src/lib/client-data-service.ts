import { supabase } from './supabase'
import { ReportData, ClientData, NutriQData, LabData, NoteData, ProtocolData, AnalysisVersion } from '@/components/reports/PractitionerAnalysis'

export async function fetchClientData(clientId: string): Promise<ReportData> {
  try {
    // Fetch client basic information
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientError) {
      throw new Error(`Failed to fetch client: ${clientError.message}`)
    }

    // Fetch NutriQ results
    const { data: nutriqResults, error: nutriqError } = await supabase
      .from('lab_reports')
      .select(`
        *,
        nutriq_results (*)
      `)
      .eq('client_id', clientId)
      .eq('report_type', 'nutriq')
      .order('created_at', { ascending: false })
      .limit(1)

    if (nutriqError) {
      throw new Error(`Failed to fetch NutriQ results: ${nutriqError.message}`)
    }

    // Fetch all lab reports
    const { data: labReports, error: labError } = await supabase
      .from('lab_reports')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (labError) {
      throw new Error(`Failed to fetch lab reports: ${labError.message}`)
    }

    // Fetch client notes
    const { data: notes, error: notesError } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (notesError) {
      throw new Error(`Failed to fetch notes: ${notesError.message}`)
    }

    // Fetch protocols
    const { data: protocols, error: protocolsError } = await supabase
      .from('protocols')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (protocolsError) {
      throw new Error(`Failed to fetch protocols: ${protocolsError.message}`)
    }

    // Transform client data
    const clientData: ClientData = {
      id: client.id,
      name: `${client.first_name} ${client.last_name}`,
      email: client.email,
      phone: client.phone || '',
      dateOfBirth: client.date_of_birth,
      occupation: client.occupation || 'Unknown',
      primaryHealthConcern: client.primary_health_concern || 'Not specified',
      truckDriver: client.occupation?.toLowerCase().includes('truck') || 
                   client.occupation?.toLowerCase().includes('driver') || false,
      createdAt: client.created_at
    }

    // Transform NutriQ data
    let nutriqData: NutriQData | null = null
    if (nutriqResults && nutriqResults.length > 0 && nutriqResults[0].nutriq_results) {
      const nutriqResult = nutriqResults[0].nutriq_results[0]
      const analysisResults = nutriqResults[0].analysis_results
      
      nutriqData = {
        totalScore: nutriqResult.total_score || 0,
        bodySystems: {
          energy: {
            score: nutriqResult.energy_score || 0,
            issues: analysisResults?.bodySystems?.energy?.issues || [],
            recommendations: analysisResults?.bodySystems?.energy?.recommendations || []
          },
          mood: {
            score: nutriqResult.mood_score || 0,
            issues: analysisResults?.bodySystems?.mood?.issues || [],
            recommendations: analysisResults?.bodySystems?.mood?.recommendations || []
          },
          sleep: {
            score: nutriqResult.sleep_score || 0,
            issues: analysisResults?.bodySystems?.sleep?.issues || [],
            recommendations: analysisResults?.bodySystems?.sleep?.recommendations || []
          },
          stress: {
            score: nutriqResult.stress_score || 0,
            issues: analysisResults?.bodySystems?.stress?.issues || [],
            recommendations: analysisResults?.bodySystems?.stress?.recommendations || []
          },
          digestion: {
            score: nutriqResult.digestion_score || 0,
            issues: analysisResults?.bodySystems?.digestion?.issues || [],
            recommendations: analysisResults?.bodySystems?.digestion?.recommendations || []
          },
          immunity: {
            score: nutriqResult.immunity_score || 0,
            issues: analysisResults?.bodySystems?.immunity?.issues || [],
            recommendations: analysisResults?.bodySystems?.immunity?.recommendations || []
          }
        },
        overallRecommendations: analysisResults?.overallRecommendations || [],
        priorityActions: analysisResults?.priorityActions || [],
        assessmentDate: nutriqResults[0].report_date
      }
    }

    // Transform lab data
    const labData: LabData[] = labReports.map(report => ({
      id: report.id,
      reportType: report.report_type,
      reportDate: report.report_date,
      status: report.status,
      results: report.analysis_results || {},
      notes: report.notes
    }))

    // Transform notes data
    const notesData: NoteData[] = notes.map(note => ({
      id: note.id,
      type: note.type as 'interview' | 'group_coaching' | 'coaching_call' | 'assistant',
      content: note.content,
      date: note.created_at,
      author: note.author
    }))

    // Transform protocols data
    const protocolsData: ProtocolData[] = protocols.map(protocol => ({
      id: protocol.id,
      phase: protocol.phase,
      startDate: protocol.start_date,
      content: protocol.content,
      compliance: protocol.compliance,
      status: protocol.status as 'active' | 'completed' | 'paused'
    }))

    // Create initial version
    const version: AnalysisVersion = {
      id: crypto.randomUUID(),
      generatedAt: new Date(),
      generatedBy: 'manual',
      snapshot: {} as ReportData
    }

    // Create the complete report data
    const reportData: ReportData = {
      client: clientData,
      nutriqData: nutriqData || {
        totalScore: 0,
        bodySystems: {
          energy: { score: 0, issues: [], recommendations: [] },
          mood: { score: 0, issues: [], recommendations: [] },
          sleep: { score: 0, issues: [], recommendations: [] },
          stress: { score: 0, issues: [], recommendations: [] },
          digestion: { score: 0, issues: [], recommendations: [] },
          immunity: { score: 0, issues: [], recommendations: [] }
        },
        overallRecommendations: [],
        priorityActions: [],
        assessmentDate: new Date().toISOString().split('T')[0]
      },
      labData,
      notes: notesData,
      protocols: protocolsData,
      analysis: {
        rootCauses: [],
        systemInterconnections: [],
        truckDriverConsiderations: [],
        interventionProtocol: {
          immediate: {
            supplements: [],
            dietary: [],
            lifestyle: []
          },
          phased: {
            week2_4: [],
            week4_8: []
          },
          truckDriverMods: []
        },
        expectedTimeline: '',
        complianceStrategies: [],
        generatedAt: new Date().toISOString()
      },
      version
    }

    return reportData
  } catch (error) {
    console.error('Error fetching client data:', error)
    throw new Error(`Failed to fetch client data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function saveAnalysisVersion(clientId: string, version: AnalysisVersion): Promise<void> {
  try {
    const { error } = await supabase
      .from('analysis_versions')
      .insert({
        client_id: clientId,
        version_id: version.id,
        generated_at: version.generatedAt.toISOString(),
        generated_by: version.generatedBy,
        snapshot: version.snapshot,
        changes: version.changes
      })

    if (error) {
      throw new Error(`Failed to save analysis version: ${error.message}`)
    }
  } catch (error) {
    console.error('Error saving analysis version:', error)
    throw new Error(`Failed to save analysis version: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getAnalysisVersions(clientId: string): Promise<AnalysisVersion[]> {
  try {
    const { data, error } = await supabase
      .from('analysis_versions')
      .select('*')
      .eq('client_id', clientId)
      .order('generated_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch analysis versions: ${error.message}`)
    }

    return data.map(row => ({
      id: row.version_id,
      generatedAt: new Date(row.generated_at),
      generatedBy: row.generated_by,
      snapshot: row.snapshot,
      changes: row.changes
    }))
  } catch (error) {
    console.error('Error fetching analysis versions:', error)
    throw new Error(`Failed to fetch analysis versions: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 