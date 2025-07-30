import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'

export async function GET() {
  const checks = {
    environment: {
      databaseUrl: !!process.env.DATABASE_URL,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendApiKey: !!process.env.RESEND_API_KEY,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthUrl: !!process.env.NEXTAUTH_URL,
      appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      jwtSecret: !!process.env.JWT_SECRET,
    },
    database: {
      connection: false,
      tables: {
        users: false,
        client_profiles: false,
        user_sessions: false,
        rate_limits: false
      },
      error: null as string | null
    },
    email: {
      configured: false,
      testSend: false,
      error: null as string | null
    },
    timestamp: new Date().toISOString()
  }

  // Test database connection
  try {
    const supabase = createServerSupabaseClient()
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (testError) {
      checks.database.connection = false
      checks.database.error = testError.message
    } else {
      checks.database.connection = true
    }

    // Test individual tables
    const tables = ['users', 'client_profiles', 'user_sessions', 'rate_limits']
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        checks.database.tables[table as keyof typeof checks.database.tables] = !error
      } catch (error) {
        checks.database.tables[table as keyof typeof checks.database.tables] = false
      }
    }

  } catch (error) {
    checks.database.connection = false
    checks.database.error = error instanceof Error ? error.message : 'Unknown database error'
  }

  // Test email service
  try {
    if (process.env.RESEND_API_KEY) {
      checks.email.configured = true
      
      // Test Resend client creation (don't actually send)
      const resend = new Resend(process.env.RESEND_API_KEY)
      checks.email.testSend = true
    } else {
      checks.email.configured = false
      checks.email.error = 'RESEND_API_KEY not configured'
    }
  } catch (error) {
    checks.email.configured = false
    checks.email.error = error instanceof Error ? error.message : 'Email service error'
  }

  // Determine overall health
  const allHealthy = checks.database.connection && 
                    Object.values(checks.database.tables).every(Boolean) &&
                    checks.environment.databaseUrl &&
                    checks.environment.supabaseUrl &&
                    checks.environment.supabaseAnonKey

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    recommendations: allHealthy ? [] : [
      !checks.environment.databaseUrl && 'DATABASE_URL environment variable is missing',
      !checks.environment.supabaseUrl && 'NEXT_PUBLIC_SUPABASE_URL environment variable is missing',
      !checks.environment.supabaseAnonKey && 'NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is missing',
      !checks.database.connection && 'Database connection failed - check your Supabase configuration',
      !checks.database.tables.users && 'Users table is not accessible - check database permissions',
      !checks.database.tables.client_profiles && 'Client profiles table is not accessible - check database permissions',
      !checks.email.configured && 'Email service not configured - RESEND_API_KEY missing'
    ].filter(Boolean)
  }, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
} 