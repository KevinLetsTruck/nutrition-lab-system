import { createServerSupabaseClient } from './supabase'
import { CompleteOnboardingData } from './onboarding-schemas'
import { randomUUID } from 'crypto'

export interface OnboardingSession {
  id: string
  client_id?: string
  session_token: string
  current_step: string
  progress_percentage: number
  is_completed: boolean
  expires_at: Date
  last_activity: Date
}

export interface OnboardingStepData {
  step: string
  data: Partial<CompleteOnboardingData>
  completed: boolean
}

export class StreamlinedOnboardingService {
  private supabase

  constructor() {
    this.supabase = createServerSupabaseClient()
  }

  // Create a new onboarding session
  async createSession(clientId?: string): Promise<OnboardingSession> {
    const sessionToken = randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    console.log('Creating session with data:', {
      client_id: clientId,
      session_token: sessionToken,
      current_step: 'demographics',
      progress_percentage: 0,
      expires_at: expiresAt.toISOString(),
      last_activity: new Date().toISOString()
    })

    // Create minimal session data - demographic fields will be filled in later
    const sessionData: any = {
      session_token: sessionToken,
      current_step: 'demographics',
      progress_percentage: 0,
      expires_at: expiresAt.toISOString(),
      last_activity: new Date().toISOString()
    }

    // Only add client_id if it's provided and is a valid UUID
    if (clientId) {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (uuidRegex.test(clientId)) {
        sessionData.client_id = clientId
      } else {
        console.warn('Invalid UUID format for clientId:', clientId)
      }
    }

    // Add placeholder values for required fields (will be updated when user fills out demographics)
    sessionData.first_name = 'Pending'
    sessionData.last_name = 'Pending'
    sessionData.email = 'pending@example.com'
    sessionData.phone = '000-000-0000'
    sessionData.current_diet_approach = 'pending'
    sessionData.primary_health_goal = 'pending'

    console.log('Final session data to insert:', sessionData)

    const { data, error } = await this.supabase
      .from('client_onboarding')
      .insert(sessionData)
      .select()
      .single()

    console.log('Supabase response:', { data, error })

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: error
      })
      throw new Error(`Failed to create onboarding session: ${error.message || error.details || error.hint || 'Unknown error'}`)
    }

    return {
      id: data.id,
      client_id: data.client_id,
      session_token: data.session_token,
      current_step: data.current_step,
      progress_percentage: data.progress_percentage,
      is_completed: data.is_completed,
      expires_at: new Date(data.expires_at),
      last_activity: new Date(data.last_activity)
    }
  }

  // Get session by token
  async getSession(sessionToken: string): Promise<OnboardingSession | null> {
    const { data, error } = await this.supabase
      .from('client_onboarding')
      .select('*')
      .eq('session_token', sessionToken)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      client_id: data.client_id,
      session_token: data.session_token,
      current_step: data.current_step,
      progress_percentage: data.progress_percentage,
      is_completed: data.is_completed,
      expires_at: new Date(data.expires_at),
      last_activity: new Date(data.last_activity)
    }
  }

  // Update session activity
  async updateSessionActivity(sessionToken: string): Promise<void> {
    const { error } = await this.supabase
      .from('client_onboarding')
      .update({
        last_activity: new Date().toISOString()
      })
      .eq('session_token', sessionToken)

    if (error) {
      throw new Error(`Failed to update session activity: ${error.message}`)
    }
  }

  // Map form field names to database column names
  private mapFormDataToDatabase(data: any): any {
    // Only map to columns that actually exist in the database
    const fieldMapping: Record<string, string | undefined> = {
      // Diet fields - map to existing columns
      dietType: 'current_diet_approach',
      
      // Goals fields - map to existing columns
      healthGoals: 'primary_health_goal',
      
      // Medications fields - map to existing columns
      currentMedications: 'current_medications',
      supplements: 'current_supplements',
      
      // Other fields that might be sent but don't have database columns
      // These will be filtered out since they don't exist in the database
      dateOfBirth: undefined, // Removed from database
      medications: 'current_medications', // Alias for currentMedications
      
      // Fields that don't exist in database - will be filtered out
      dietaryRestrictions: undefined,
      foodAllergies: undefined,
      mealFrequency: undefined,
      waterIntake: undefined,
      primaryConcern: undefined,
      timeline: undefined,
      medicalConditions: undefined
    }

    const mappedData: any = {}
    
    // Map fields that need conversion and exist in database
    Object.entries(data).forEach(([key, value]) => {
      const databaseField = fieldMapping[key]
      
      if (databaseField === undefined) {
        // Field doesn't exist in database, skip it
        console.log(`Skipping field '${key}' - no database column`)
        return
      }
      
      const finalField = databaseField || key
      mappedData[finalField] = value
    })
    
    console.log('Field mapping:', { original: data, mapped: mappedData })
    return mappedData
  }

  // Save step data
  async saveStepData(sessionToken: string, step: string, data: Partial<CompleteOnboardingData>): Promise<void> {
    console.log('Saving step data:', { sessionToken, step, data })
    
    // Map form field names to database column names
    const mappedData = this.mapFormDataToDatabase(data)
    
    const updateData = {
      ...mappedData,
      current_step: step,
      last_activity: new Date().toISOString()
    }
    
    console.log('Update data:', updateData)
    
    const { error } = await this.supabase
      .from('client_onboarding')
      .update(updateData)
      .eq('session_token', sessionToken)

    if (error) {
      console.error('Supabase error in saveStepData:', error)
      throw new Error(`Failed to save step data: ${error.message}`)
    }
    
    console.log('Step data saved successfully')
  }

  // Map database column names back to form field names
  private mapDatabaseToFormData(data: any): any {
    // Only map columns that actually exist in the database
    const reverseFieldMapping: Record<string, string> = {
      // Diet fields - map from existing columns
      current_diet_approach: 'dietType',
      
      // Goals fields - map from existing columns
      primary_health_goal: 'healthGoals',
      
      // Medications fields - map from existing columns
      current_medications: 'currentMedications',
      current_supplements: 'supplements'
      
      // Note: We don't map back fields that don't exist in the database
      // like date_of_birth, dietary_restrictions, etc.
    }

    const mappedData: any = {}
    
    // Map fields that need conversion and exist in database
    Object.entries(data).forEach(([key, value]) => {
      const formField = reverseFieldMapping[key] || key
      mappedData[formField] = value
    })
    
    return mappedData
  }

  // Get current onboarding data
  async getOnboardingData(sessionToken: string): Promise<Partial<CompleteOnboardingData> | null> {
    const { data, error } = await this.supabase
      .from('client_onboarding')
      .select('*')
      .eq('session_token', sessionToken)
      .single()

    if (error || !data) {
      return null
    }

    // Map database fields back to form field names
    return this.mapDatabaseToFormData(data)
  }

  // Complete onboarding
  async completeOnboarding(sessionToken: string, clientId?: string): Promise<void> {
    const { error } = await this.supabase
      .from('client_onboarding')
      .update({
        current_step: 'complete',
        progress_percentage: 100,
        is_completed: true,
        completed_at: new Date().toISOString(),
        client_id: clientId,
        last_activity: new Date().toISOString()
      })
      .eq('session_token', sessionToken)

    if (error) {
      throw new Error(`Failed to complete onboarding: ${error.message}`)
    }
  }

  // Get session from cookies (client-side implementation)
  async getSessionFromCookies(): Promise<OnboardingSession | null> {
    // This will be handled by the client component using localStorage or cookies
    return null
  }

  // Set session cookie (client-side implementation)
  async setSessionCookie(sessionToken: string): Promise<void> {
    // This will be handled by the client component
    console.log('Session token for client storage:', sessionToken)
  }

  // Clear session cookie (client-side implementation)
  async clearSessionCookie(): Promise<void> {
    // This will be handled by the client component
    console.log('Clearing session token')
  }

  // Check if session is expired
  isSessionExpired(session: OnboardingSession): boolean {
    return new Date() > session.expires_at
  }

  // Calculate progress percentage
  calculateProgress(currentStep: string): number {
    const steps = ['demographics', 'diet', 'medications', 'goals', 'truck_info', 'dot_status']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex >= 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0
  }

  // Get next step
  getNextStep(currentStep: string): string | null {
    const steps = ['demographics', 'diet', 'medications', 'goals', 'truck_info', 'dot_status']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex >= 0 && currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null
  }

  // Get previous step
  getPreviousStep(currentStep: string): string | null {
    const steps = ['demographics', 'diet', 'medications', 'goals', 'truck_info', 'dot_status']
    const currentIndex = steps.indexOf(currentStep)
    return currentIndex > 0 ? steps[currentIndex - 1] : null
  }

  // Get step title
  getStepTitle(step: string): string {
    const titles: Record<string, string> = {
      demographics: 'Basic Information',
      diet: 'Current Diet',
      medications: 'Medications & Supplements',
      goals: 'Health Goals',
      truck_info: 'Truck Driver Info',
      dot_status: 'DOT Medical Status'
    }
    return titles[step] || step
  }

  // Get step description
  getStepDescription(step: string): string {
    const descriptions: Record<string, string> = {
      demographics: 'Tell us about yourself',
      diet: 'What diet are you currently following?',
      medications: 'List your current medications and supplements',
      goals: 'What is your primary health goal?',
      truck_info: 'Tell us about your driving schedule',
      dot_status: 'What is your DOT medical status?'
    }
    return descriptions[step] || ''
  }
} 