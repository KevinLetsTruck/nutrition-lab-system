import { NextRequest, NextResponse } from 'next/server'
import { StreamlinedOnboardingService } from '@/lib/streamlined-onboarding-service'

const onboardingService = new StreamlinedOnboardingService()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  try {
    const { step, data } = await request.json()
    
    await onboardingService.saveStepData(token, step, data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving step data:', error)
    return NextResponse.json(
      { error: 'Failed to save step data' },
      { status: 500 }
    )
  }
} 