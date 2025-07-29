import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionToken, step, data, completedSteps } = body

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // Get session and client ID
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select('client_id, current_step')
      .eq('session_token', sessionToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const clientId = session.client_id

    // Update session last activity
    await supabase
      .from('onboarding_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        current_step: step 
      })
      .eq('session_token', sessionToken)

    // Save intake data for each section
    if (data) {
      for (const [section, responses] of Object.entries(data)) {
        if (responses && Object.keys(responses as any).length > 0) {
          // Check if intake record already exists
          const { data: existingIntake } = await supabase
            .from('client_intake')
            .select('id')
            .eq('client_id', clientId)
            .eq('section', section)
            .single()

          if (existingIntake) {
            // Update existing record
            await supabase
              .from('client_intake')
              .update({
                responses,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingIntake.id)
          } else {
            // Create new record
            await supabase
              .from('client_intake')
              .insert({
                client_id: clientId,
                section,
                responses,
                completed_at: new Date().toISOString()
              })
          }
        }
      }
    }

    // Update progress for completed steps
    if (completedSteps && Array.isArray(completedSteps)) {
      for (const completedStep of completedSteps) {
        await supabase
          .from('onboarding_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('client_id', clientId)
          .eq('step', completedStep)
      }
    }

    // Update current step progress
    if (step) {
      await supabase
        .from('onboarding_progress')
        .update({
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('client_id', clientId)
        .eq('step', step)
    }

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully'
    })

  } catch (error) {
    console.error('Progress save error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save progress',
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

    // Get session and client ID
    const { data: session, error: sessionError } = await supabase
      .from('onboarding_sessions')
      .select('client_id')
      .eq('session_token', sessionToken)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    const clientId = session.client_id

    // Get progress data
    const { data: progressData, error: progressError } = await supabase
      .from('onboarding_progress')
      .select('step, completed, started_at, completed_at, data')
      .eq('client_id', clientId)
      .order('created_at', { ascending: true })

    if (progressError) {
      throw new Error(`Failed to get progress: ${progressError.message}`)
    }

    // Get intake data
    const { data: intakeData, error: intakeError } = await supabase
      .from('client_intake')
      .select('section, responses, completed_at')
      .eq('client_id', clientId)

    if (intakeError) {
      throw new Error(`Failed to get intake data: ${intakeError.message}`)
    }

    const intakeResponses: any = {}
    if (intakeData) {
      intakeData.forEach(record => {
        intakeResponses[record.section] = record.responses
      })
    }

    return NextResponse.json({
      success: true,
      progress: progressData,
      intakeData: intakeResponses
    })

  } catch (error) {
    console.error('Progress retrieval error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to retrieve progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 