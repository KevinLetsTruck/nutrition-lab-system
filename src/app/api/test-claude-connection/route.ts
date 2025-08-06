import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env } from '@/lib/config/env'

export async function GET() {
  try {
    // Check if API key exists
    const apiKey = env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'API key not found',
        env: {
          hasKey: false,
          nodeEnv: env.get('NODE_ENV')
        }
      })
    }

    // Initialize Claude client
    const anthropic = new Anthropic({
      apiKey: apiKey.trim()
    })

    // Test with a simple message
    console.log('[TEST-CLAUDE-CONNECTION] Testing Claude API connection...')
    
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "Connection successful" if you receive this message.'
      }]
    })

    console.log('[TEST-CLAUDE-CONNECTION] Success:', response.content)

    return NextResponse.json({
      success: true,
      message: 'Claude API connection successful',
      response: response.content,
      model: response.model,
      apiKeyInfo: {
        length: apiKey.length,
        prefix: apiKey.substring(0, 10) + '...',
        isValidFormat: apiKey.startsWith('sk-ant-')
      }
    })

  } catch (error) {
    console.error('[TEST-CLAUDE-CONNECTION] Error:', error)
    
    let errorDetails = 'Unknown error'
    let errorType = 'UNKNOWN'
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      if (error.message.includes('401')) {
        errorType = 'INVALID_API_KEY'
      } else if (error.message.includes('429')) {
        errorType = 'RATE_LIMIT'
      } else if (error.message.includes('network')) {
        errorType = 'NETWORK_ERROR'
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorDetails,
      errorType,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}