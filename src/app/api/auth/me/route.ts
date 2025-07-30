import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/lib/auth-service'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify token and get user
    const tokenResult = await authService.verifyToken(token)
    
    if (!tokenResult.valid || !tokenResult.user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Get user profile
    const profileResult = await authService.getUserProfile(tokenResult.user.id)

    if (!profileResult.success) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: tokenResult.user,
      profile: profileResult.profile
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    )
  }
} 