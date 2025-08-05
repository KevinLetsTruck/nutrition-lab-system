import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get all cookies
  const cookieStore = request.cookies
  const allCookies: Record<string, string> = {}
  
  cookieStore.getAll().forEach(cookie => {
    allCookies[cookie.name] = cookie.value
  })
  
  // Get auth token specifically
  const authToken = cookieStore.get('auth-token')
  
  // Get headers
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    if (key.toLowerCase().includes('cookie') || key.toLowerCase().includes('auth')) {
      headers[key] = value
    }
  })
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasAuthToken: !!authToken,
    authTokenLength: authToken?.value?.length || 0,
    cookieCount: cookieStore.getAll().length,
    cookies: allCookies,
    headers,
    url: request.url,
    isProduction: process.env.NODE_ENV === 'production',
    isVercel: !!process.env.VERCEL
  })
}