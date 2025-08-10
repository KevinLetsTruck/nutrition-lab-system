import { NextRequest, NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'
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
    
    // Decode JWT to get session info
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const userId = decoded.userId
    const sessionId = decoded.sessionId
    
    const supabase = createServerSupabaseClient()
    
    // Check if session exists
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (sessionError) {
      return NextResponse.json({
        error: 'Database error',
        details: sessionError
      }, { status: 500 })
    }
    
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (userError) {
      return NextResponse.json({
        error: 'User not found',
        details: userError
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      jwtDecoded: {
        userId,
        sessionId,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp
      },
      sessionExists: session && session.length > 0,
      sessionData: session,
      userExists: !!user,
      userData: {
        id: user.id,
        email: user.email,
        role: user.role,
        email_verified: user.email_verified
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Request failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 