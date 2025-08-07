import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    const response: any = {
      step: 'starting',
      email: email,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }

    try {
      response.step = 'creating_supabase_client'
      const supabase = createServerSupabaseClient()
      response.supabaseClientCreated = true
    } catch (error: any) {
      response.supabaseError = error.message
      return NextResponse.json(response)
    }

    try {
      response.step = 'querying_users_table'
      const supabase = createServerSupabaseClient()
      
      // Try to fetch the user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single()
      
      if (userError) {
        response.queryError = userError.message
        response.queryErrorCode = userError.code
        response.queryErrorHint = userError.hint
        return NextResponse.json(response)
      }

      response.userFound = !!user
      
      if (user) {
        response.step = 'verifying_password'
        response.userEmail = user.email
        response.userRole = user.role
        
        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password_hash)
        response.passwordValid = passwordValid
        
        if (!passwordValid) {
          // Let's also test the hash directly
          response.providedPassword = password
          response.storedHashFirst10 = user.password_hash.substring(0, 10)
          response.testHash = await bcrypt.hash(password, 12)
          response.testHashFirst10 = response.testHash.substring(0, 10)
        }
      }
      
      return NextResponse.json(response)
      
    } catch (error: any) {
      response.unexpectedError = error.message
      return NextResponse.json(response)
    }
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Test login failed',
      message: error.message
    })
  }
}
