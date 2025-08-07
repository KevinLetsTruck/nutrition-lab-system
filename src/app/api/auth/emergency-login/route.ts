import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, emergencyCode } = await request.json()

    // Only allow in development or with emergency code
    const isDev = process.env.NODE_ENV === 'development'
    const validEmergencyCode = emergencyCode === process.env.EMERGENCY_ACCESS_CODE
    
    if (!isDev && !validEmergencyCode) {
      return NextResponse.json(
        { error: 'Emergency access not available' },
        { status: 403 }
      )
    }

    // Check if it's the admin email
    if (email !== 'admin@emergency.com') {
      return NextResponse.json(
        { error: 'Invalid emergency credentials' },
        { status: 401 }
      )
    }

    // Create emergency session
    const userId = uuidv4()
    const sessionId = uuidv4()
    const JWT_SECRET = process.env.JWT_SECRET || 'emergency-jwt-secret'

    const token = jwt.sign(
      {
        userId,
        email,
        role: 'admin',
        sessionId,
        emergency: true
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const response = NextResponse.json({
      success: true,
      message: 'Emergency login successful',
      user: {
        id: userId,
        email,
        role: 'admin',
        emailVerified: true,
        onboardingCompleted: true
      },
      warning: 'This is an emergency session. Database is not connected.'
    })

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Emergency login error:', error)
    return NextResponse.json(
      { error: 'Emergency login failed' },
      { status: 500 }
    )
  }
}
