import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'ANTHROPIC_API_KEY environment variable is missing',
        available: false
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      available: true,
      keyLength: apiKey.length,
      keyFormat: apiKey.startsWith('sk-ant-'),
      keyPrefix: apiKey.substring(0, 10) + '...',
      message: 'API key is available and properly formatted'
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      available: false
    }, { status: 500 })
  }
} 