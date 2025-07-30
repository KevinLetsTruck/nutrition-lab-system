import { NextRequest, NextResponse } from 'next/server'
import { StreamlinedOnboardingService } from '@/lib/streamlined-onboarding-service'

const onboardingService = new StreamlinedOnboardingService()

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json()
    
    const session = await onboardingService.createSession(clientId)
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating onboarding session:', error)
    return NextResponse.json(
      { error: 'Failed to create onboarding session' },
      { status: 500 }
    )
  }
}

 