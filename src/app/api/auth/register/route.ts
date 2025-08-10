import { NextRequest, NextResponse } from 'next/server'

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