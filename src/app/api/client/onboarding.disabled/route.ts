import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'
import { AuthService } from '@/lib/auth-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const authService = new AuthService()

    // Get the current user from the session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user is a client
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'client') {
      return NextResponse.json(
        { error: 'Access denied. Clients only.' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      age,
      occupation,
      primaryHealthConcern,
      currentMedications,
      dietaryRestrictions,
      sleepQuality,
      stressLevel,
      exerciseFrequency,
      goals,
      truckDriver,
      dotCompliance
    } = body

    // Validate required fields
    if (!age || !occupation || !primaryHealthConcern || !goals) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update client profile with onboarding data
    const { error: updateError } = await supabase
      .from('client_profiles')
      .update({
        onboarding_data: {
          age,
          occupation,
          primaryHealthConcern,
          currentMedications,
          dietaryRestrictions,
          sleepQuality,
          stressLevel,
          exerciseFrequency,
          goals,
          truckDriver,
          dotCompliance,
          onboardingCompleted: true,
          completedAt: new Date().toISOString()
        }
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating client profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to save onboarding data' },
        { status: 500 }
      )
    }

    // Mark user as having completed onboarding
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        onboarding_completed: true
      })
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('Error updating user onboarding status:', userUpdateError)
      // Don't fail the request if this fails
    }

    // Create a note about onboarding completion
    try {
      await supabase
        .from('client_notes')
        .insert({
          client_id: user.id,
          type: 'assistant',
          content: `Client completed onboarding questionnaire. Primary concern: ${primaryHealthConcern}. Goals: ${goals}. Truck driver: ${truckDriver ? 'Yes' : 'No'}.`,
          author: 'System'
        })
    } catch (noteError) {
      console.error('Error creating onboarding note:', noteError)
      // Don't fail the request if note creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully'
    })

  } catch (error) {
    console.error('Error in client onboarding:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 