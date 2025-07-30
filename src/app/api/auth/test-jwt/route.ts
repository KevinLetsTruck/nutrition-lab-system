import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }
    
    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      return NextResponse.json({ error: 'JWT_SECRET not configured' }, { status: 500 })
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      return NextResponse.json({
        success: true,
        decoded: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          sessionId: decoded.sessionId,
          iat: decoded.iat,
          exp: decoded.exp
        },
        isValid: true
      })
    } catch (jwtError) {
      return NextResponse.json({
        success: false,
        error: jwtError instanceof Error ? jwtError.message : 'JWT verification failed',
        isValid: false
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
} 