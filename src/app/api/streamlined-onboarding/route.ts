import { NextRequest, NextResponse } from 'next/server'
import { StreamlinedOnboardingService } from '@/lib/streamlined-onboarding-service'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { action, data, clientId } = await request.json()
    const onboardingService = new StreamlinedOnboardingService()

    switch (action) {
      case 'create_session':
        const session = await onboardingService.createSession(clientId)
        await onboardingService.setSessionCookie(session.session_token)
        return NextResponse.json({ success: true, session })

      case 'get_session':
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('onboarding_session')?.value
        if (!sessionToken) {
          return NextResponse.json({ success: false, error: 'No session found' }, { status: 404 })
        }
        const existingSession = await onboardingService.getSession(sessionToken)
        if (!existingSession) {
          return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, session: existingSession })

      case 'save_step':
        const { step, stepData } = data
        const saveCookieStore = await cookies()
        const saveSessionToken = saveCookieStore.get('onboarding_session')?.value
        if (!saveSessionToken) {
          return NextResponse.json({ success: false, error: 'No session found' }, { status: 404 })
        }
        await onboardingService.saveStepData(saveSessionToken, step, stepData)
        await onboardingService.updateSessionActivity(saveSessionToken)
        return NextResponse.json({ success: true })

      case 'complete_onboarding':
        const completeCookieStore = await cookies()
        const completeSessionToken = completeCookieStore.get('onboarding_session')?.value
        if (!completeSessionToken) {
          return NextResponse.json({ success: false, error: 'No session found' }, { status: 404 })
        }
        await onboardingService.completeOnboarding(completeSessionToken, clientId)
        await onboardingService.clearSessionCookie()
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Streamlined onboarding API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const onboardingService = new StreamlinedOnboardingService()

    switch (action) {
      case 'get_session':
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get('onboarding_session')?.value
        if (!sessionToken) {
          return NextResponse.json({ success: false, error: 'No session found' }, { status: 404 })
        }
        const session = await onboardingService.getSession(sessionToken)
        if (!session) {
          return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, session })

      case 'get_data':
        const dataCookieStore = await cookies()
        const dataSessionToken = dataCookieStore.get('onboarding_session')?.value
        if (!dataSessionToken) {
          return NextResponse.json({ success: false, error: 'No session found' }, { status: 404 })
        }
        const onboardingData = await onboardingService.getOnboardingData(dataSessionToken)
        if (!onboardingData) {
          return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: onboardingData })

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Streamlined onboarding API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 