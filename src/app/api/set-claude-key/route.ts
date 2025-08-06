import { NextRequest, NextResponse } from 'next/server'

// TEMPORARY WORKAROUND: Allow setting API key via header
// This should ONLY be used if environment variables absolutely won't work
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check if API key is provided in header
    const apiKey = request.headers.get('x-anthropic-api-key')
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key provided in x-anthropic-api-key header'
      }, { status: 400 })
    }
    
    // Validate key format
    if (!apiKey.startsWith('sk-ant-')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key format. Should start with sk-ant-'
      }, { status: 400 })
    }
    
    // Set it in process.env for this request
    process.env.ANTHROPIC_API_KEY = apiKey
    
    // Test if it works
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })
      
      const response = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 50,
        messages: [{
          role: 'user',
          content: 'Reply with "API key successfully configured!"'
        }]
      })
      
      return NextResponse.json({
        success: true,
        message: 'API key set and verified',
        testResponse: response.content[0].type === 'text' ? response.content[0].text : 'No response'
      })
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: `API key set but test failed: ${error.message}`
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint sets the Claude API key temporarily',
    usage: 'POST to this endpoint with x-anthropic-api-key header',
    warning: 'This is a temporary workaround. Environment variables should be used in production.',
    currentStatus: {
      hasEnvKey: !!process.env.ANTHROPIC_API_KEY,
      envKeyLength: process.env.ANTHROPIC_API_KEY?.length || 0
    }
  })
}