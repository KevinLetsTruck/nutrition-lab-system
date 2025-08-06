import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check all environment variables related to the issue
  const diagnosis = {
    timestamp: new Date().toISOString(),
    runtime: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    
    // Check if running in Edge Runtime
    isEdgeRuntime: typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis,
    
    // Check various forms the key might be in
    anthropicKey: {
      standard: !!process.env.ANTHROPIC_API_KEY,
      withPrefix: !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
      lowercase: !!process.env.anthropic_api_key,
      uppercase: !!process.env.ANTHROPIC_API_KEY,
    },
    
    // Check all env vars that start with ANTHROPIC
    anthropicVars: Object.keys(process.env)
      .filter(key => key.toLowerCase().includes('anthropic'))
      .map(key => ({
        name: key,
        exists: true,
        length: process.env[key]?.length || 0,
        startsWithSkAnt: process.env[key]?.startsWith('sk-ant-') || false
      })),
    
    // Check Supabase vars (to ensure env vars work in general)
    supabaseVars: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    
    // List ALL environment variable names (not values)
    allEnvVarNames: Object.keys(process.env)
      .filter(key => !key.includes('SECRET') && !key.includes('KEY'))
      .sort(),
    
    // Check if it's a build-time vs runtime issue
    buildId: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'unknown',
    
    // Recommendations based on findings
    recommendations: []
  }
  
  // Add recommendations based on what we find
  if (!diagnosis.anthropicKey.standard) {
    diagnosis.recommendations.push('ANTHROPIC_API_KEY not found in standard form')
    
    if (diagnosis.anthropicKey.withPrefix) {
      diagnosis.recommendations.push('Found NEXT_PUBLIC_ANTHROPIC_API_KEY - remove NEXT_PUBLIC_ prefix in Vercel')
    }
    
    if (diagnosis.anthropicVars.length === 0) {
      diagnosis.recommendations.push('No environment variables containing "anthropic" found at all')
      diagnosis.recommendations.push('Double-check the exact variable name in Vercel Dashboard')
      diagnosis.recommendations.push('Ensure there are no extra spaces or special characters')
    }
  }
  
  if (diagnosis.isEdgeRuntime) {
    diagnosis.recommendations.push('Running in Edge Runtime - some env vars might not be available')
  }
  
  return NextResponse.json(diagnosis, { 
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  })
}