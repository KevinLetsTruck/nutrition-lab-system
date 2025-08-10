// import { supabase } from '@/lib/supabase' // TODO: Replace with Prisma

export interface LabReport {
  id: string
  user_id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface LabResult {
  id: string
  lab_report_id: string
  test_name: string
  value: string
  unit: string
  reference_range: string
  status: 'normal' | 'high' | 'low' | 'critical'
  raw_text: string
  created_at: string
}

export interface AIAnalysis {
  id: string
  lab_report_id: string
  analysis_type: string
  content: any
  created_at: string
}

// Lab Reports Queries
export async function createLabReport(report: Omit<LabReport, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('lab_reports')
    .insert(report)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLabReportsByUserId(userId: string) {
  const { data, error } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getLabReportById(id: string) {
  const { data, error } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateLabReportStatus(id: string, status: LabReport['status']) {
  const { data, error } = await supabase
    .from('lab_reports')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Lab Results Queries
export async function createLabResults(results: Omit<LabResult, 'id' | 'created_at'>[]) {
  const { data, error } = await supabase
    .from('lab_results')
    .insert(results)
    .select()

  if (error) throw error
  return data
}

export async function getLabResultsByReportId(reportId: string) {
  const { data, error } = await supabase
    .from('lab_results')
    .select('*')
    .eq('lab_report_id', reportId)
    .order('test_name')

  if (error) throw error
  return data
}

// AI Analysis Queries
export async function createAIAnalysis(analysis: Omit<AIAnalysis, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('ai_analysis')
    .insert(analysis)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAIAnalysisByReportId(reportId: string) {
  const { data, error } = await supabase
    .from('ai_analysis')
    .select('*')
    .eq('lab_report_id', reportId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Combined Queries
export async function getCompleteLabReport(id: string) {
  const { data, error } = await supabase
    .from('lab_reports')
    .select(`
      *,
      lab_results (*),
      ai_analysis (*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
