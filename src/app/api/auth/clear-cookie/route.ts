import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({ message: 'Cookie cleared' })
  
  // Clear the auth token cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // This will delete the cookie
    path: '/'
  })
  
  return response
}
