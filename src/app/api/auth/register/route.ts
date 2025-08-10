import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-service'
import { emailService } from '@/lib/email-service'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('Registration request received')
  
  try {
    // Parse request body
    const body = await request.json()
    console.log('Request body parsed:', { 
      firstName: body.firstName ? 'present' : 'missing',
      lastName: body.lastName ? 'present' : 'missing', 
      email: body.email ? 'present' : 'missing',
      phone: body.phone ? 'present' : 'missing',
      password: body.password ? 'present' : 'missing'
    })
    
    const { firstName, lastName, email, phone, password, role } = body

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !password) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format')
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Phone format validation (relaxed - allow any format)
    // Just ensure it has at least some digits if provided
    if (phone && phone.replace(/\D/g, '').length < 5) {
      console.log('Validation failed: phone too short')
      return NextResponse.json(
        { error: 'Please enter a valid phone number (at least 5 digits)' },
        { status: 400 }
      )
    }

    // Use the new Prisma-based registration endpoint instead
    console.log('Redirecting to Prisma-based registration...')
    
    // This endpoint is deprecated - redirect to the new one
    return NextResponse.json(
      { error: 'Please use /api/auth/register-prisma endpoint' },
      { status: 410 } // Gone
    )

    // Register user
    console.log('Attempting user registration...')
    const result = await authService.register({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: role || 'admin' // Default to admin if not specified
    })

    console.log('Registration result:', { 
      success: result.success, 
      error: result.error,
      userId: result.user?.id 
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Send email verification
    if (result.user) {
      console.log('Sending verification email...')
      try {
        const verificationToken = authService.generateEmailVerificationToken(result.user.id)
        const emailResult = await emailService.sendVerificationEmail(result.user.email, verificationToken, firstName)
        
        if (!emailResult) {
          console.warn('Email verification failed, but registration succeeded')
        } else {
          console.log('Verification email sent successfully')
        }
      } catch (emailError) {
        console.error('Email verification error:', emailError)
        // Don't fail registration if email fails
      }
    }

    console.log('Registration completed successfully')
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: result.user?.id,
        email: result.user?.email,
        role: result.user?.role
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Provide more specific error messages
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request format. Please check your data and try again.' },
        { status: 400 }
      )
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Registration failed. Please try again.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
} 