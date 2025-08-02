// Call Recording & Transcription Types

export type CallType = 'onboarding' | 'follow_up' | 'assessment'
export type CallPriority = 'urgent' | 'high' | 'normal' | 'low'
export type NoteType = 'symptom_update' | 'compliance' | 'concern' | 'goal'

export interface CallRecording {
  id: string
  client_id: string
  call_type: CallType
  recording_url?: string
  transcript?: string
  ai_summary?: AICallSummary
  call_date: string
  duration_seconds?: number
  consent_given: boolean
  created_at: string
}

export interface CallNote {
  id: string
  call_recording_id: string
  note_type: NoteType
  content: string
  priority: CallPriority
  created_at: string
}

export interface AICallSummary {
  callSummary: string
  healthUpdates: {
    newSymptoms: string[]
    symptomChanges: string[]
    compliance: string
  }
  lifestyleFactors: {
    driving: string
    sleep: string
    diet: string
    exercise: string
  }
  concerns: string[]
  actionItems: string[]
  nextSteps: string
  priority: CallPriority
}

export interface CallConsentStatus {
  clientId: string
  clientName: string
  consentGiven: boolean
  consentDate?: string
}

export interface CallRecorderProps {
  clientId: string
  callType: CallType
  onRecordingComplete: (recording: Blob, duration: number) => void
}

export interface CallConsentDialogProps {
  clientName: string
  onConsent: () => void
  onDecline: () => void
}

export interface CallNotesSummaryProps {
  callRecording: CallRecording
}

// API Response Types
export interface ProcessRecordingResponse {
  success: boolean
  callRecordingId?: string
  summary?: AICallSummary
  error?: string
}

// Form Data for API
export interface ProcessRecordingFormData {
  audio: File
  clientId: string
  callType: CallType
}