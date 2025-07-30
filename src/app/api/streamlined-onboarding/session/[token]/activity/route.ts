import { NextRequest, NextResponse } from 'next/server'
import { StreamlinedOnboardingService } from '@/lib/streamlined-onboarding-service'

const onboardingService = new StreamlinedOnboardingService()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    await onboardingService.updateSessionActivity(token)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating session activity:', error)
    return NextResponse.json(
      { error: 'Failed to update session activity' },
      { status: 500 }
    )
  }
} 