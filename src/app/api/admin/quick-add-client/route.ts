import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { EmailService } from '@/lib/email-service'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const authService = new AuthService()
    const emailService = new EmailService()

    // Parse form data
    const formData = await request.formData()
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const age = formData.get('age') as string
    const email = formData.get('email') as string
    const healthConcerns = formData.get('healthConcerns') as string
    const goals = formData.get('goals') as string
    const files = formData.getAll('files') as File[]

    // Validate required fields
    if (!firstName || !lastName || !age || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Generate a secure password for the client
    const tempPassword = Math.random().toString(36).slice(-8) + 
                        Math.random().toString(36).toUpperCase().slice(-4) + 
                        Math.floor(Math.random() * 10) + 
                        '!'

    // Hash the password
    const passwordHash = await bcrypt.hash(tempPassword, 12)

    // Create user account
    const userId = uuidv4()
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: passwordHash,
        role: 'client',
        email_verified: false,
        onboarding_completed: false
      })

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create client profile
    const { error: profileError } = await supabase
      .from('client_profiles')
      .insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        onboarding_data: {
          age: parseInt(age),
          healthConcerns,
          goals,
          addedBy: 'admin_quick_add'
        }
      })

    if (profileError) {
      console.error('Error creating client profile:', profileError)
      // Clean up user if profile creation fails
      await supabase.from('users').delete().eq('id', userId)
      return NextResponse.json(
        { error: 'Failed to create client profile' },
        { status: 500 }
      )
    }

    // Upload files if provided
    if (files.length > 0) {
      for (const file of files) {
        try {
          const fileName = `${userId}/${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage
            .from('client-files')
            .upload(fileName, file)

          if (uploadError) {
            console.error('Error uploading file:', uploadError)
            // Continue with other files even if one fails
          }
        } catch (error) {
          console.error('Error processing file upload:', error)
        }
      }
    }

    // Send welcome email with login credentials
    try {
      const welcomeEmailSent = await emailService.sendWelcomeEmail(
        email,
        firstName,
        tempPassword
      )

      if (!welcomeEmailSent) {
        console.warn('Failed to send welcome email, but client was created successfully')
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail the entire operation if email fails
    }

    // Start email sequence
    try {
      await emailService.startEmailSequence(userId, 'welcome')
    } catch (sequenceError) {
      console.error('Error starting email sequence:', sequenceError)
    }

    return NextResponse.json({
      success: true,
      message: 'Client created successfully',
      userId,
      tempPassword // Only return in development
    })

  } catch (error) {
    console.error('Error in quick-add client:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 