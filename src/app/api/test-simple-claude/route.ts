import { NextRequest, NextResponse } from 'next/server'
import ClaudeClient from '@/lib/claude-client'

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST-SIMPLE-CLAUDE] Starting test...')
    
    // Check if API key exists
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('[TEST-SIMPLE-CLAUDE] No API key found')
      return NextResponse.json({
        error: 'ANTHROPIC_API_KEY not configured',
        hasKey: false
      }, { status: 500 })
    }
    
    console.log('[TEST-SIMPLE-CLAUDE] API key found, length:', apiKey.length)
    
    // Get Claude client instance
    const claudeClient = ClaudeClient.getInstance()
    console.log('[TEST-SIMPLE-CLAUDE] Claude client created')
    
    // Simple test prompt
    const testPrompt = 'What is 2 + 2? Please respond with just the number.'
    const systemPrompt = 'You are a helpful assistant. Answer concisely.'
    
    console.log('[TEST-SIMPLE-CLAUDE] Sending test prompt...')
    
    // Try to call Claude
    const response = await claudeClient.analyzePractitionerReport(testPrompt, systemPrompt)
    
    console.log('[TEST-SIMPLE-CLAUDE] Response received:', response)
    
    return NextResponse.json({
      success: true,
      response,
      apiKeyLength: apiKey.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('[TEST-SIMPLE-CLAUDE] Error:', error)
    
    return NextResponse.json({
      error: 'Claude test failed',
      details: error.message || 'Unknown error',
      stack: error.stack,
      type: error.constructor.name
    }, { status: 500 })
  }
}