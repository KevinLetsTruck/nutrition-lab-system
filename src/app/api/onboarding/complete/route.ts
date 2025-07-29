import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionToken, data } = body

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

    // Update client record with personal information
    if (data.personal) {
      const personalData = data.personal
      const updateData: any = {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }

      // Map personal data to client fields
      if (personalData.firstName) updateData.first_name = personalData.firstName
      if (personalData.lastName) updateData.last_name = personalData.lastName
      if (personalData.email) updateData.email = personalData.email
      if (personalData.phone) updateData.phone = personalData.phone
      if (personalData.dateOfBirth) updateData.date_of_birth = personalData.dateOfBirth
      if (personalData.gender) updateData.gender = personalData.gender
      if (personalData.occupation) updateData.occupation = personalData.occupation
      if (personalData.emergencyContactName) updateData.emergency_contact_name = personalData.emergencyContactName
      if (personalData.emergencyContactPhone) updateData.emergency_contact_phone = personalData.emergencyContactPhone
      if (personalData.preferredCommunication) updateData.preferred_communication = personalData.preferredCommunication
      if (personalData.insuranceProvider) updateData.insurance_provider = personalData.insuranceProvider
      if (personalData.insuranceId) updateData.insurance_id = personalData.insuranceId

      // Update client record
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', clientId)

      if (clientUpdateError) {
        throw new Error(`Failed to update client: ${clientUpdateError.message}`)
      }
    }

    // Save final intake data
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

    // Mark all steps as completed
    const { error: progressError } = await supabase
      .from('onboarding_progress')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId)

    if (progressError) {
      console.error('Failed to update progress:', progressError)
    }

    // Clean up session
    await supabase
      .from('onboarding_sessions')
      .delete()
      .eq('session_token', sessionToken)

    // Get client information for response
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, email, first_name, last_name, onboarding_completed_at')
      .eq('id', clientId)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      client: clientData
    })

  } catch (error) {
    console.error('Onboarding completion error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to complete onboarding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 