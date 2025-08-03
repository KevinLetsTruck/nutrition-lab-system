import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

export async function GET(request: NextRequest) {
  try {
    console.log('[TEST-CLAUDE] Testing Claude API connection...');
    
    // Check if API key exists
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'ANTHROPIC_API_KEY not found in environment variables'
      }, { status: 500 });
    }
    
    // Log key info (safely)
    console.log('[TEST-CLAUDE] API key found, length:', apiKey.length);
    console.log('[TEST-CLAUDE] First 10 chars:', apiKey.substring(0, 10));
    console.log('[TEST-CLAUDE] Has spaces:', apiKey.includes(' '));
    
    // Try to initialize Claude
    const anthropic = new Anthropic({
      apiKey: apiKey.trim() // Trim any whitespace
    });
    
    // Make a simple test call
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Say "API test successful" if you can read this.'
      }]
    });
    
    console.log('[TEST-CLAUDE] Claude response received');
    
    return NextResponse.json({
      success: true,
      message: 'Claude API connection successful',
      response: response.content[0].text,
      keyInfo: {
        length: apiKey.length,
        hasSpaces: apiKey.includes(' '),
        trimmedLength: apiKey.trim().length
      }
    });
    
  } catch (error) {
    console.error('[TEST-CLAUDE] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? {
        name: error.name,
        stack: error.stack
      } : {}
    }, { status: 500 });
  }
}