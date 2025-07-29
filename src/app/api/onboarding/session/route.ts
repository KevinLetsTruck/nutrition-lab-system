import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, firstName, lastName } = body

    // Generate a unique session token
    const sessionToken = uuidv4()
    
    // Set session expiration (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Find or create client
    let clientId: string
    
    if (email) {
      // Check if client already exists
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', email)
        .single()

      if (existingClient) {
        clientId = existingClient.id
      } else {
        // Create new client
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            email,
            first_name: firstName || '',
            last_name: lastName || '',
            onboarding_started_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          throw new Error(`Failed to create client: ${createError.message}`)
        }

        clientId = newClient.id
      }
    } else {
      // Create anonymous session (for cases where email is not provided initially)
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          email: `anonymous_${Date.now()}@temp.com`,
          first_name: 'Anonymous',
          last_name: 'User',
          onboarding_started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create anonymous client: ${createError.message}`)
      }

      clientId = newClient.id
    }

    // Create onboarding session
    const { error: sessionError } = await supabase
      .from('onboarding_sessions')
      .insert({
        client_id: clientId,
        session_token: sessionToken,
        current_step: 'welcome',
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Session creation error details:', sessionError)
      throw new Error(`Failed to create session: ${sessionError.message || JSON.stringify(sessionError)}`)
    }

    // Initialize onboarding progress steps
    const onboardingSteps = [
      'welcome',
      'personal', 
      'healthHistory',
      'medications',
      'lifestyle',
      'goals',
      'uploads',
      'review'
    ]

    const progressRecords = onboardingSteps.map(step => ({
      client_id: clientId,
      step,
      completed: step === 'welcome' ? true : false,
      started_at: step === 'welcome' ? new Date().toISOString() : null,
      completed_at: step === 'welcome' ? new Date().toISOString() : null
    }))

    const { error: progressError } = await supabase
      .from('onboarding_progress')
      .insert(progressRecords)

    if (progressError) {
      console.error('Failed to initialize progress records:', progressError)
      // Don't fail the entire request for this
    }

    // Check for existing data
    const { data: existingIntake } = await supabase
      .from('client_intake')
      .select('section, responses')
      .eq('client_id', clientId)

    const existingData: any = {}
    if (existingIntake) {
      existingIntake.forEach(record => {
        existingData[record.section] = record.responses
      })
    }

    // Get completed steps
    const { data: progressData } = await supabase
      .from('onboarding_progress')
      .select('step, completed')
      .eq('client_id', clientId)

    const completedSteps = progressData
      ?.filter(p => p.completed)
      .map(p => p.step) || []

    // Get current step
    const { data: currentStepData } = await supabase
      .from('onboarding_progress')
      .select('step')
      .eq('client_id', clientId)
      .eq('completed', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    const currentStep = currentStepData ? onboardingSteps.indexOf(currentStepData.step) : 0

    return NextResponse.json({
      success: true,
      sessionToken,
      clientId,
      existingData: Object.keys(existingData).length > 0 ? existingData : null,
      completedSteps,
      currentStep,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create onboarding session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('token')

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select(`
        *,
        clients (
          id,
          email,
          first_name,
          last_name,
          onboarding_completed
        )
      `)
      .eq('session_token', sessionToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 404 }
      )
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 401 }
      )
    }

    // Get progress data
    const { data: progressData } = await supabase
      .from('onboarding_progress')
      .select('step, completed, started_at, completed_at')
      .eq('client_id', session.client_id)

    // Get intake data
    const { data: intakeData } = await supabase
      .from('client_intake')
      .select('section, responses')
      .eq('client_id', session.client_id)

    const existingData: any = {}
    if (intakeData) {
      intakeData.forEach(record => {
        existingData[record.section] = record.responses
      })
    }

    const completedSteps = progressData
      ?.filter(p => p.completed)
      .map(p => p.step) || []

    return NextResponse.json({
      success: true,
      session: {
        token: session.session_token,
        currentStep: session.current_step,
        expiresAt: session.expires_at,
        client: session.clients
      },
      existingData: Object.keys(existingData).length > 0 ? existingData : null,
      completedSteps,
      progress: progressData
    })

  } catch (error) {
    console.error('Session retrieval error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve session data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 