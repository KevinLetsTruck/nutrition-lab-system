'use client'

import { useRouter } from 'next/navigation'
import { StreamlinedOnboardingWizard } from '@/components/onboarding/streamlined-onboarding-wizard'
import { CompleteOnboardingData } from '@/lib/onboarding-schemas'

export default function StreamlinedOnboardingPage() {
  const router = useRouter()

  const handleOnboardingComplete = (data: CompleteOnboardingData) => {
    // Redirect to clients page after onboarding completion
    console.log('Onboarding completed:', data)
    router.push('/clients')
  }

  const handleOnboardingExit = () => {
    // Redirect to dashboard when user exits onboarding
    console.log('Onboarding exited by user')
    router.push('/client/dashboard')
  }

  // Generate a temporary client ID for demo purposes
  // In production, this would come from authentication or URL params
  const clientId = 'demo-client-' + Date.now()

  return (
    <StreamlinedOnboardingWizard 
      clientId={clientId}
      onComplete={handleOnboardingComplete}
      onExit={handleOnboardingExit}
    />
  )
} 