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

    const { data, error } = await this.supabase
      .from('client_onboarding')
      .insert({
        client_id: clientId,
        session_token: sessionToken,
        current_step: 'demographics',
        progress_percentage: 0,
        expires_at: expiresAt.toISOString(),
        last_activity: new Date().toISOString()
      })
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

  // Save step data
  async saveStepData(sessionToken: string, step: string, data: Partial<CompleteOnboardingData>): Promise<void> {
    const { error } = await this.supabase
      .from('client_onboarding')
      .update({
        ...data,
        current_step: step,
        last_activity: new Date().toISOString()
      })
      .eq('session_token', sessionToken)

    if (error) {
      throw new Error(`Failed to save step data: ${error.message}`)
    }
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

    return {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      current_diet_approach: data.current_diet_approach,
      diet_duration_months: data.diet_duration_months,
      current_medications: data.current_medications,
      current_supplements: data.current_supplements,
      primary_health_goal: data.primary_health_goal,
      years_driving: data.years_driving,
      route_type: data.route_type,
      schedule_pattern: data.schedule_pattern,
      dot_medical_status: data.dot_medical_status,
      dot_expiry_date: data.dot_expiry_date ? new Date(data.dot_expiry_date) : undefined
    }
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