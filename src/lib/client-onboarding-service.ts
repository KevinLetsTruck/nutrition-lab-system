import { CompleteOnboardingData } from './onboarding-schemas'

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

export class ClientOnboardingService {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/streamlined-onboarding'
  }

  // Create new onboarding session
  async createSession(clientId?: string): Promise<OnboardingSession> {
    const response = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`)
    }

    const session = await response.json()
    return {
      ...session,
      expires_at: new Date(session.expires_at),
      last_activity: new Date(session.last_activity)
    }
  }

  // Get session by token
  async getSession(sessionToken: string): Promise<OnboardingSession | null> {
    const response = await fetch(`${this.baseUrl}/session/${sessionToken}`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to get session: ${response.statusText}`)
    }

    const session = await response.json()
    return {
      ...session,
      expires_at: new Date(session.expires_at),
      last_activity: new Date(session.last_activity)
    }
  }

  // Update session activity
  async updateSessionActivity(sessionToken: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session/${sessionToken}/activity`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new Error(`Failed to update session activity: ${response.statusText}`)
    }
  }

  // Save step data
  async saveStepData(sessionToken: string, step: string, data: Partial<CompleteOnboardingData>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session/${sessionToken}/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ step, data }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save step data: ${response.statusText}`)
    }
    
    console.log('Client: Step data saved successfully')
  }

  // Get current onboarding data
  async getOnboardingData(sessionToken: string): Promise<Partial<CompleteOnboardingData> | null> {
    const response = await fetch(`${this.baseUrl}/session/${sessionToken}/data`)
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to get onboarding data: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      dietType: data.dietType,
      foodAllergies: data.foodAllergies,
      mealFrequency: data.mealFrequency,
      waterIntake: data.waterIntake,
      currentMedications: data.currentMedications,
      supplements: data.supplements,
      healthGoals: data.healthGoals,
      primaryConcern: data.primaryConcern,
      timeline: data.timeline,
      routeType: data.routeType,
      hoursPerWeek: data.hoursPerWeek,
      sleepSchedule: data.sleepSchedule,
      dotStatus: data.dotStatus,
      hasRestrictions: data.hasRestrictions,
      restrictions: data.restrictions
    }
  }

  // Complete onboarding
  async completeOnboarding(sessionToken: string, clientId?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/session/${sessionToken}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clientId }),
    })

    if (!response.ok) {
      throw new Error(`Failed to complete onboarding: ${response.statusText}`)
    }
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
      diet: 'Diet & Nutrition',
      medications: 'Medications & Supplements',
      goals: 'Health Goals',
      truck_info: 'Truck Driver Information',
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
      goals: 'What are your health goals?',
      truck_info: 'Tell us about your driving schedule',
      dot_status: 'What is your DOT medical status?'
    }
    return descriptions[step] || ''
  }
} 