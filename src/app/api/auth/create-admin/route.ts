import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, secretKey } = await request.json()

    // Require a secret key to create admin accounts
    if (secretKey !== process.env.ADMIN_CREATE_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret key' },
        { status: 403 }
      )
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)
    const userId = uuidv4()

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        role: 'admin',
        email_verified: true,
        onboarding_completed: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      return NextResponse.json(
        { error: 'Failed to create user', details: userError.message },
        { status: 500 }
      )
    }

    // Create admin profile
    const { error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        id: uuidv4(),
        user_id: userId,
        name: name,
        title: 'Administrator',
        specializations: ['General'],
        client_capacity: 100,
        active_sessions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      // Rollback user creation
      await supabase.from('users').delete().eq('id', userId)
      return NextResponse.json(
        { error: 'Failed to create admin profile', details: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        id: userId,
        email: newUser.email,
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    )
  }
}
