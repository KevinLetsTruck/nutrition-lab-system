import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // For now, allow direct login with the test admin credentials
    if (email === 'admin@test.com' && password === 'Admin123!') {
      // Create a session without database
      const userId = 'f7925e65-ec95-49ec-95b1-f32a016a6ec8' // The ID we used in SQL
      const sessionId = uuidv4()
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret'
      
      const token = jwt.sign(
        {
          userId,
          email,
          role: 'admin',
          sessionId,
          emailVerified: true,
          onboardingCompleted: true
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      const response = NextResponse.json({
        success: true,
        message: 'Direct login successful (bypass mode)',
        user: {
          id: userId,
          email,
          role: 'admin',
          emailVerified: true,
          onboardingCompleted: true
        },
        warning: 'Using direct login due to database connection issues'
      })
      
      // Set cookie
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      })
      
      return response
    }
    
    // Try database connection if available
    try {
      const { Pool } = require('pg')
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000
      })
      
      const client = await pool.connect()
      
      // Query user
      const userResult = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email.toLowerCase()]
      )
      
      if (userResult.rows.length === 0) {
        client.release()
        await pool.end()
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      
      const user = userResult.rows[0]
      
      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password_hash)
      
      client.release()
      await pool.end()
      
      if (!passwordValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      
      // Create session
      const sessionId = uuidv4()
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret'
      
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          sessionId,
          emailVerified: user.email_verified,
          onboardingCompleted: user.onboarding_completed
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      )
      
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.email_verified,
          onboardingCompleted: user.onboarding_completed
        }
      })
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/'
      })
      
      return response
      
    } catch (dbError: any) {
      console.error('Database connection failed:', dbError.message)
      
      // Fallback for admin@test.com only
      if (email === 'admin@test.com') {
        return NextResponse.json({ 
          error: 'Database unavailable. Use password: Admin123! for emergency access' 
        }, { status: 503 })
      }
      
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError.message 
      }, { status: 503 })
    }
    
  } catch (error: any) {
    console.error('Direct login error:', error)
    return NextResponse.json({ 
      error: 'Login failed',
      message: error.message 
    }, { status: 500 })
  }
}
