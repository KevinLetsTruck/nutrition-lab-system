import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function GET(request: NextRequest) {
  // Test 1: Check environment
  const envCheck = {
    hasKey: !!process.env.ANTHROPIC_API_KEY,
    keyLength: process.env.ANTHROPIC_API_KEY?.length || 0,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 7) || 'not set',
    nodeEnv: process.env.NODE_ENV
  }
  
  // Test 2: Try to create ClaudeClient
  let clientCreated = false
  let clientError = null
  
  try {
    const client = ClaudeClient.getInstance()
    clientCreated = true
  } catch (error) {
    clientError = error instanceof Error ? error.message : 'Unknown error'
  }
  
  // Test 3: Try a simple analysis if client created
  let analysisResult = null
  let analysisError = null
  
  if (clientCreated) {
    try {
      const client = ClaudeClient.getInstance()
      analysisResult = await client.analyzePractitionerReport(
        'Test: Please respond with "Claude integration is working!"',
        'You are a helpful assistant. Respond to the test request.'
      )
    } catch (error) {
      analysisError = error instanceof Error ? error.message : 'Unknown error'
    }
  }
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    clientCreation: {
      success: clientCreated,
      error: clientError
    },
    analysis: {
      success: !!analysisResult,
      result: analysisResult,
      error: analysisError
    },
    recommendation: !envCheck.hasKey 
      ? 'ANTHROPIC_API_KEY is not detected. Check Vercel environment variables.'
      : !clientCreated 
      ? 'API key found but client creation failed. Check the error message.'
      : !analysisResult
      ? 'Client created but analysis failed. Check API key validity.'
      : 'Everything is working! AI analysis is ready.'
  })
}