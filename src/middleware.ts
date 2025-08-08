import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from '@/lib/auth-middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for API routes and static files
  const path = request.nextUrl.pathname
  
  if (path.startsWith('/api/') || path.startsWith('/_next/')) {
    return NextResponse.next()
  }
  
  // Apply auth middleware
  return authMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes
     * Exclude only static assets and Next.js internals
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}