import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
    },
    ai: {
      anthropic: process.env.ANTHROPIC_API_KEY ? 'SET' : 'MISSING',
      openai: process.env.OPENAI_API_KEY ? 'SET' : 'MISSING',
    }
  }

  return NextResponse.json(checks, { status: 200 })
}