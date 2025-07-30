'use client'

import { StreamlinedOnboardingWizard } from '@/components/onboarding/streamlined-onboarding-wizard'
import { CompleteOnboardingData } from '@/lib/onboarding-schemas'

export default function StreamlinedOnboardingPage() {
  const handleOnboardingComplete = (data: CompleteOnboardingData) => {
    // Handle completion - could redirect to dashboard or show success message
    console.log('Onboarding completed:', data)
  }

  // Generate a temporary client ID for demo purposes
  // In production, this would come from authentication or URL params
  const clientId = 'demo-client-' + Date.now()

  return (
    <StreamlinedOnboardingWizard 
      clientId={clientId}
      onComplete={handleOnboardingComplete}
    />
  )
} 