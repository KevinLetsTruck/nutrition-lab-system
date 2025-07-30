import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    resendConfigured: !!process.env.RESEND_API_KEY,
    databaseUrl: !!process.env.DATABASE_URL,
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: !!process.env.NEXTAUTH_URL,
    appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
  }

  const allHealthy = Object.values(checks).every(check => check)

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
} 