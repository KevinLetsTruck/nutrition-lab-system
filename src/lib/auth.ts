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
    console.log('[Auth] Token from cookie:', token ? 'exists' : 'missing')

    if (!token) {
      return null
    }

    // Verify token and get user
    const tokenResult = await authService.verifyToken(token)
    console.log('[Auth] Token verification result:', tokenResult)
    
    if (!tokenResult.valid || !tokenResult.user) {
      return null
    }

    const session = {
      userId: tokenResult.user.id,
      email: tokenResult.user.email,
      role: tokenResult.user.role.toUpperCase() as 'CLIENT' | 'ADMIN'
    }
    console.log('[Auth] Returning session:', session)
    return session
  } catch (error) {
    console.error('[Auth] Session verification error:', error)
    return null
  }
}