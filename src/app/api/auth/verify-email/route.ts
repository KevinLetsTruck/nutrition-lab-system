import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Verify the token and get the user
    const { data: userData, error: verifyError } = await supabase
      .from('email_verifications')
      .select('user_id, email')
      .eq('token', token)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (verifyError || !userData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update user's email_verified status
    const { error: updateError } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', userData.user_id)

    if (updateError) {
      console.error('Error updating user verification status:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Mark the token as used
    await supabase
      .from('email_verifications')
      .update({ used: true })
      .eq('token', token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    )
  }
}