import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // Database health checks are better handled at the API level
  // rather than in Edge Runtime middleware
  return NextResponse.next()
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