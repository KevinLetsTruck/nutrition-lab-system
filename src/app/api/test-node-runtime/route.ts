import { NextRequest, NextResponse } from 'next/server'

// Force Node.js runtime to ensure all env vars are available
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Direct check of the API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  const result = {
    runtime: 'nodejs',
    timestamp: new Date().toISOString(),
    
    // Check the key multiple ways
    directCheck: {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      firstChars: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT_FOUND',
      isValidFormat: apiKey?.startsWith('sk-ant-') || false
    },
    
    // Check process.env directly
    processEnvCheck: {
      hasAnthropicKey: 'ANTHROPIC_API_KEY' in process.env,
      anthropicKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC'))
    },
    
    // Try to initialize Claude
    claudeInitTest: {
      success: false,
      error: null as string | null
    }
  }
  
  // Try to actually use the key
  if (apiKey) {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })
      
      // Try a minimal API call
      const response = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: 'Reply with just "OK"'
        }]
      })
      
      result.claudeInitTest.success = true
      result.claudeInitTest.error = null
    } catch (error: any) {
      result.claudeInitTest.success = false
      result.claudeInitTest.error = error.message || 'Unknown error'
    }
  } else {
    result.claudeInitTest.error = 'No API key found'
  }
  
  return NextResponse.json(result)
}