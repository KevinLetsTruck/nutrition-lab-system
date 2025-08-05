import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface User {
  id: string
  email: string
  role: string
}

export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  try {
    // Check for token in cookies
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      // Check Authorization header as fallback
      const authHeader = request.headers.get('authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return null
      }
      const headerToken = authHeader.substring(7)
      return verifyToken(headerToken)
    }
    
    return verifyToken(token)
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

function verifyToken(token: string): User | null {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as any
    
    if (!decoded.userId || !decoded.email) {
      return null
    }
    
    return {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role || 'user'
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function generateAuthToken(user: { id: string; email: string; role?: string }): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key'
  
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    secret,
    { expiresIn: '7d' }
  )
}