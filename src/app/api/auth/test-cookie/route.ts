import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookies = request.cookies
  const authToken = cookies.get('auth-token')
  
  return NextResponse.json({
    hasAuthToken: !!authToken,
    authTokenValue: authToken ? authToken.value.substring(0, 20) + '...' : null,
    cookieNames: cookies.getAll().map(cookie => cookie.name)
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { token } = body
  
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }
  
  const response = NextResponse.json({ success: true, message: 'Cookie set' })
  
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  })
  
  return response
} 