'use client'

import { StreamlinedOnboardingWizard } from '@/components/onboarding/streamlined-onboarding-wizard'
import { CompleteOnboardingData } from '@/lib/onboarding-schemas'

export default function StreamlinedOnboardingPage() {
  const handleOnboardingComplete = (data: CompleteOnboardingData) => {
    // Handle completion - could redirect to dashboard or show success message
    console.log('Onboarding completed:', data)
  }

  return (
    <StreamlinedOnboardingWizard 
      onComplete={handleOnboardingComplete}
    />
  )
} 