import { NextRequest, NextResponse } from 'next/server'
import { StreamlinedOnboardingService } from '@/lib/streamlined-onboarding-service'

const onboardingService = new StreamlinedOnboardingService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId } = body
    
    console.log('Creating session for clientId:', clientId)
    
    // Create session - clientId is optional for new users
    const session = await onboardingService.createSession(clientId)
    console.log('Session created successfully:', session)
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating onboarding session:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    return NextResponse.json(
      { error: 'Failed to create onboarding session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }
    
    console.log('Getting session for ID:', sessionId)
    const session = await onboardingService.getSession(sessionId)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error getting onboarding session:', error)
    return NextResponse.json(
      { error: 'Failed to get onboarding session' },
      { status: 500 }
    )
  }
} 