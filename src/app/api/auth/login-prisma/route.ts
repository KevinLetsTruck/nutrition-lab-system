import { NextRequest, NextResponse } from 'next/server'
import { prisma, db } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Skip rate limiting for now - db.rateLimit methods don't exist
    // TODO: Implement rate limiting later

    // Find user with profiles
    const user = await db.user.findByEmail(email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if email is verified (for clients)
    if (user.role === 'CLIENT' && !user.emailVerified && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Please verify your email before logging in' },
        { status: 403 }
      )
    }

    // Update last login
    await db.user.updateLastLogin(user.id)

    // Create session
    const sessionId = uuidv4()
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Create session record
    const tokenHash = await bcrypt.hash(token, 10)
    await db.session.create({
      userId: user.id,
      tokenHash,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })

    // Clean up expired sessions
    await db.session.deleteExpired().catch(console.error)

    // Prepare response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted
      },
      profile: user.clientProfile || user.adminProfile || null
    })

    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response

  } catch (error: any) {
    console.error('Login error:', error)
    
    // Check if it's a database connection error
    if (error.code === 'P2024' || error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Database connection error. Please try again.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
