import { NextRequest, NextResponse } from 'next/server'
import { databaseHealthMiddleware } from '@/middleware/database-health'

export async function middleware(request: NextRequest) {
  // Skip database health checks in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }
  
  // Apply database health middleware for production
  return databaseHealthMiddleware(request)
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