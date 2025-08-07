import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword } = await request.json()

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      )
    }

    // Basic password validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update the user's password
    const { data, error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('email', email.toLowerCase())
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'User not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        email: data.email,
        role: data.role
      }
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
