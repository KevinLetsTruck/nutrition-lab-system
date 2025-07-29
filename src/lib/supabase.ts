import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database utility functions
export class DatabaseUtils {
  private client: any

  constructor(useServiceRole = false) {
    this.client = useServiceRole ? createServerSupabaseClient() : supabase
  }

  // Connection testing
  async testConnection() {
    try {
      const { data, error } = await this.client.from('clients').select('count').limit(1)
      if (error) throw error
      return { success: true, message: 'Database connection successful' }
    } catch (error) {
      return { success: false, message: `Connection failed: ${error}` }
    }
  }

  // Client operations
  async getClients(limit = 50, offset = 0) {
    const { data, error } = await this.client
      .from('clients')
      .select('*')
      .order('last_name', { ascending: true })
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    return data
  }

  async getClientById(id: string) {
    const { data, error } = await this.client
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async createClient(clientData: {
    email: string
    first_name: string
    last_name: string
    date_of_birth?: string
    phone?: string
    address?: string
    emergency_contact?: string
    medical_history?: string
    allergies?: string
    current_medications?: string
  }) {
    const { data, error } = await this.client
      .from('clients')
      .insert(clientData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateClient(id: string, updates: Partial<{
    email: string
    first_name: string
    last_name: string
    date_of_birth: string
    phone: string
    address: string
    emergency_contact: string
    medical_history: string
    allergies: string
    current_medications: string
  }>) {
    const { data, error } = await this.client
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async deleteClient(id: string) {
    const { error } = await this.client
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  }

  // Lab report operations
  async getLabReports(clientId?: string, limit = 50, offset = 0) {
    let query = this.client
      .from('lab_reports')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (clientId) {
      query = query.eq('client_id', clientId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  async getLabReportById(id: string) {
    const { data, error } = await this.client
      .from('lab_reports')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  async createLabReport(reportData: {
    client_id: string
    report_type: 'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo'
    report_date: string
    file_path?: string
    file_size?: number
    analysis_results?: any
    notes?: string
  }) {
    const { data, error } = await this.client
      .from('lab_reports')
      .insert(reportData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateLabReport(id: string, updates: Partial<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    analysis_results: any
    notes: string
  }>) {
    const { data, error } = await this.client
      .from('lab_reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // NutriQ results operations
  async getNutriQResults(labReportId: string) {
    const { data, error } = await this.client
      .from('nutriq_results')
      .select('*')
      .eq('lab_report_id', labReportId)
      .single()
    
    if (error) throw error
    return data
  }

  async createNutriQResults(resultsData: {
    lab_report_id: string
    total_score?: number
    energy_score?: number
    mood_score?: number
    sleep_score?: number
    stress_score?: number
    digestion_score?: number
    immunity_score?: number
    detailed_answers?: any
    recommendations?: string
  }) {
    const { data, error } = await this.client
      .from('nutriq_results')
      .insert(resultsData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // KBMO results operations
  async getKBMOResults(labReportId: string) {
    const { data, error } = await this.client
      .from('kbmo_results')
      .select('*')
      .eq('lab_report_id', labReportId)
      .single()
    
    if (error) throw error
    return data
  }

  async createKBMOResults(resultsData: {
    lab_report_id: string
    total_igg_score?: number
    high_sensitivity_foods?: any
    moderate_sensitivity_foods?: any
    low_sensitivity_foods?: any
    elimination_diet_recommendations?: string
    reintroduction_plan?: string
  }) {
    const { data, error } = await this.client
      .from('kbmo_results')
      .insert(resultsData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Dutch results operations
  async getDutchResults(labReportId: string) {
    const { data, error } = await this.client
      .from('dutch_results')
      .select('*')
      .eq('lab_report_id', labReportId)
      .single()
    
    if (error) throw error
    return data
  }

  async createDutchResults(resultsData: {
    lab_report_id: string
    cortisol_am?: number
    cortisol_pm?: number
    dhea?: number
    testosterone_total?: number
    testosterone_free?: number
    estradiol?: number
    progesterone?: number
    melatonin?: number
    organic_acid_metabolites?: any
    hormone_analysis?: string
    recommendations?: string
  }) {
    const { data, error } = await this.client
      .from('dutch_results')
      .insert(resultsData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // CGM data operations
  async getCGMData(labReportId: string, limit = 100) {
    const { data, error } = await this.client
      .from('cgm_data')
      .select('*')
      .eq('lab_report_id', labReportId)
      .order('timestamp', { ascending: true })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  async createCGMDataPoint(dataPoint: {
    lab_report_id: string
    timestamp: string
    glucose_level?: number
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    food_description?: string
    insulin_dose?: number
    activity_level?: string
    stress_level?: number
    sleep_hours?: number
    notes?: string
  }) {
    const { data, error } = await this.client
      .from('cgm_data')
      .insert(dataPoint)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Food photos operations
  async getFoodPhotos(labReportId: string) {
    const { data, error } = await this.client
      .from('food_photos')
      .select('*')
      .eq('lab_report_id', labReportId)
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data
  }

  async createFoodPhoto(photoData: {
    lab_report_id: string
    image_path: string
    meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    food_description?: string
    estimated_calories?: number
    macro_breakdown?: any
    ai_analysis_results?: any
  }) {
    const { data, error } = await this.client
      .from('food_photos')
      .insert(photoData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Processing queue operations
  async getProcessingQueue(status?: 'pending' | 'processing' | 'completed' | 'failed') {
    let query = this.client
      .from('processing_queue')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }

  async addToProcessingQueue(queueItem: {
    lab_report_id?: string
    task_type: string
    priority?: number
    payload?: any
  }) {
    const { data, error } = await this.client
      .from('processing_queue')
      .insert(queueItem)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async updateProcessingQueueStatus(id: string, status: 'pending' | 'processing' | 'completed' | 'failed', errorMessage?: string) {
    const updates: any = { status }
    if (status === 'processing') {
      updates.started_at = new Date().toISOString()
    } else if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString()
      if (errorMessage) updates.error_message = errorMessage
    }
    
    const { data, error } = await this.client
      .from('processing_queue')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // File storage utilities
  async uploadFile(bucket: string, path: string, file: File | Buffer, contentType?: string) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, {
        contentType,
        upsert: true
      })
    
    if (error) throw error
    return data
  }

  async getFileUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  async deleteFile(bucket: string, path: string) {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
    return { success: true }
  }

  // Utility functions
  async getClientReportsSummary() {
    const { data, error } = await this.client
      .from('client_reports_summary')
      .select('*')
      .order('last_name', { ascending: true })
    
    if (error) throw error
    return data
  }

  async searchClients(searchTerm: string) {
    const { data, error } = await this.client
      .from('clients')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('last_name', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getReportsByType(reportType: 'nutriq' | 'kbmo' | 'dutch' | 'cgm' | 'food_photo') {
    const { data, error } = await this.client
      .from('lab_reports')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('report_type', reportType)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Export utility instances
export const db = new DatabaseUtils()
export const dbAdmin = new DatabaseUtils(true) // Uses service role for admin operations
