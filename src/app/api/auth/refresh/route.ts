import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    // Verify existing token
    let decoded: any
    try {
      decoded = jwt.verify(token.value, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Find existing session
    const existingSession = await prisma.userSession.findFirst({
      where: {
        userId: decoded.userId,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 401 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        clientProfile: true,
        adminProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Create new token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Update session
    await prisma.userSession.update({
      where: { id: existingSession.id },
      data: {
        tokenHash: randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    // Set new cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role.toLowerCase(),
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted
      }
    })

    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 })
  }
}
