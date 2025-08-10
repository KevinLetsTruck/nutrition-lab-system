import { NextResponse } from 'next/server'
// import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    
    // Test 1: Basic connection test
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' })
    
    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message,
        hint: testError.hint,
        code: testError.code
      })
    }
    
    // Test 2: Check if we can query users
    const { data: users, error: usersError, count } = await supabase
      .from('users')
      .select('email, role, created_at', { count: 'exact' })
      .limit(5)
      .order('created_at', { ascending: false })
    
    // Test 3: Check environment variables
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET
    }
    
    return NextResponse.json({
      success: !usersError,
      environment: envCheck,
      database: {
        connected: !testError && !usersError,
        userCount: count,
        recentUsers: users || [],
        error: usersError?.message
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
