import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyLength: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length : 0,
    keyPrefix: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 7) + '...' : 'not set',
    nodeEnv: process.env.NODE_ENV,
    availableEnvKeys: Object.keys(process.env).filter(k => 
      k.includes('ANTHROPIC') || 
      k.includes('SUPABASE') || 
      k.includes('VERCEL')
    ).sort()
  })
}