import { NextRequest, NextResponse } from 'next/server'
import { StreamlinedOnboardingService } from '@/lib/streamlined-onboarding-service'

const onboardingService = new StreamlinedOnboardingService()

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json()
    
    console.log('Creating session for clientId:', clientId)
    const session = await onboardingService.createSession(clientId)
    console.log('Session created successfully:', session)
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating onboarding session:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { error: 'Failed to create onboarding session', details: error.message },
      { status: 500 }
    )
  }
}

 