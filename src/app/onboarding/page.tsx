import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export const metadata = {
  title: 'Client Onboarding - Nutrition Lab System',
  description: 'Complete your comprehensive health assessment and onboarding process',
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <OnboardingWizard />
      </div>
    </div>
  )
} 