import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  const status = {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    expectedLength: 41, // Anthropic API keys are typically 41 characters
    isValidFormat: apiKey?.startsWith('sk-ant-') || false,
    recommendation: ''
  }
  
  if (!status.hasApiKey) {
    status.recommendation = 'ANTHROPIC_API_KEY is not set. Add it in Vercel Dashboard > Settings > Environment Variables'
  } else if (!status.isValidFormat) {
    status.recommendation = 'API key exists but may be invalid. Anthropic keys should start with "sk-ant-"'
  } else if (status.apiKeyLength !== status.expectedLength) {
    status.recommendation = `API key length (${status.apiKeyLength}) doesn't match expected (${status.expectedLength}). Please verify the key.`
  } else {
    status.recommendation = '✅ AI setup looks good! You should get real AI analysis.'
  }
  
  return NextResponse.json(status)
}