import { NextRequest, NextResponse } from 'next/server'
import { StreamlinedOnboardingService } from '@/lib/streamlined-onboarding-service'

const onboardingService = new StreamlinedOnboardingService()

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  return handleStepRequest(request, params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  return handleStepRequest(request, params)
}

async function handleStepRequest(
  request: NextRequest,
  params: Promise<{ token: string }>
) {
  const { token } = await params
  try {
    const { step, data } = await request.json()
    
    await onboardingService.saveStepData(token, step, data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving step data:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    })
    return NextResponse.json(
      { error: 'Failed to save step data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 