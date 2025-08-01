import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const envVars = {
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    anthropicKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'not found',
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    // List all env vars that start with certain prefixes (for debugging)
    envKeys: Object.keys(process.env).filter(key => 
      key.startsWith('ANTHROPIC') || 
      key.startsWith('SUPABASE') || 
      key.startsWith('NEXT_PUBLIC')
    ).map(key => key) // Just the key names, not values
  };

  return NextResponse.json(envVars);
}