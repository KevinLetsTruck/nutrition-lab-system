import { NextRequest } from 'next/server'
import { authService } from './auth-service'

export interface ServerSession {
  userId: string
  email: string
  role: string
}

export async function getServerSession(request?: NextRequest): Promise<ServerSession | null> {
  try {
    // For server components without request object, we can't get the session
    if (!request) {
      console.warn('[Auth] No request object provided to getServerSession')
      return null
    }

    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Verify token and get user
    const tokenResult = await authService.verifyToken(token)
    
    if (!tokenResult.valid || !tokenResult.user) {
      return null
    }

    return {
      userId: tokenResult.user.id,
      email: tokenResult.user.email,
      role: tokenResult.user.role
    }
  } catch (error) {
    console.error('[Auth] Session verification error:', error)
    return null
  }
}