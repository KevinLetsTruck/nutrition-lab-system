import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'

interface JWTPayload {
  userId: string
  email: string
  role: string
  sessionId: string
  iat: number
  exp: number
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify JWT token
    let decoded: JWTPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        clientProfile: true,
        adminProfile: true
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Check if session is still valid
    const session = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date()
        }
      }
    })
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted
      },
      profile: user.clientProfile || user.adminProfile || null
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    )
  }
}