import { NextRequest, NextResponse } from 'next/server'
import ClaudeClientProduction from '@/lib/claude-client-production'

// Force Node.js runtime
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  console.log('[TEST-PROD] Starting production Claude test...')
  
  // Create the production client
  const client = ClaudeClientProduction.create()
  
  // Get API key status
  const keyStatus = client.getApiKeyStatus()
  
  // Test the connection
  let connectionTest: { success: boolean; error?: string } = { success: false, error: 'Not tested' }
  if (keyStatus.found) {
    connectionTest = await client.testConnection()
  }
  
  // List all env vars (names only, no values)
  const envVars = Object.keys(process.env)
    .filter(k => !k.includes('SECRET') && !k.includes('PRIVATE'))
    .sort()
  
  // Check specific expected vars
  const expectedVars = {
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_ANTHROPIC_API_KEY: !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
  }
  
  // Try a simple analysis if connection succeeded
  let analysisTest = { success: false, result: null as string | null, error: null as string | null }
  if (connectionTest.success) {
    try {
      const result = await client.analyzePractitionerReport(
        'Test: Reply with "Production Claude is working!"',
        'You are a helpful assistant. Reply to the test request.'
      )
      analysisTest = { success: true, result, error: null }
    } catch (error: any) {
      analysisTest = { success: false, result: null, error: error.message }
    }
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    runtime: 'nodejs',
    keyStatus,
    connectionTest,
    analysisTest,
    environment: {
      expectedVars,
      totalEnvVars: envVars.length,
      envVarNames: envVars,
      vercelInfo: {
        isVercel: !!process.env.VERCEL,
        vercelEnv: process.env.VERCEL_ENV,
        region: process.env.VERCEL_REGION,
      }
    },
    recommendations: generateRecommendations(keyStatus, connectionTest)
  })
}

function generateRecommendations(
  keyStatus: { found: boolean; method: string }, 
  connectionTest: { success: boolean; error?: string }
): string[] {
  const recs: string[] = []
  
  if (!keyStatus.found) {
    recs.push('❌ API key not found by any method')
    recs.push('1. Check Vercel Dashboard > Settings > Environment Variables')
    recs.push('2. Ensure ANTHROPIC_API_KEY is set for Production')
    recs.push('3. Redeploy after adding/updating the key')
  } else if (!connectionTest.success) {
    recs.push('⚠️ API key found but connection failed')
    recs.push(`Error: ${connectionTest.error}`)
    recs.push('1. Verify the API key is valid and starts with "sk-ant-"')
    recs.push('2. Check if the key has expired or been revoked')
    recs.push('3. Ensure your Anthropic account is active')
  } else {
    recs.push('✅ Everything is working correctly!')
    recs.push('The production Claude client can find and use your API key')
  }
  
  return recs
}