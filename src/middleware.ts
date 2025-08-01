import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'



// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/health'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes (let them handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow email verification routes
  if (pathname.startsWith('/verify-email') || pathname.startsWith('/api/auth/verify-email') || pathname.startsWith('/api/auth/resend-verification')) {
    return NextResponse.next()
  }

  try {
    // Get user from session
    const supabase = createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Get user role from database
    const { data: userData } = await supabase
      .from('users')
      .select('role, onboarding_completed, email_verified')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const { role, onboarding_completed, email_verified } = userData

    // Check if email is verified
    if (!email_verified) {
      // Allow access to verification page and logout
      if (pathname === '/verify-email' || pathname === '/api/auth/logout') {
        return NextResponse.next()
      }
      // Redirect to verification page
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }

    // Handle client access restrictions
    if (role === 'client') {
      // Clients who completed onboarding should only see success page
      if (onboarding_completed) {
        if (pathname !== '/client/success' && pathname !== '/api/auth/logout') {
          return NextResponse.redirect(new URL('/client/success', request.url))
        }
      } else {
        // Clients who haven't completed onboarding go to onboarding
        if (pathname !== '/client/onboarding' && !pathname.startsWith('/api/client/onboarding')) {
          return NextResponse.redirect(new URL('/client/onboarding', request.url))
        }
      }
    }

    // Handle admin access
    if (role === 'admin') {
      // Prevent admins from accessing client-specific routes
      if (pathname.startsWith('/client/')) {
        return NextResponse.redirect(new URL('/clients', request.url))
      }
      // Admins can access all other routes
      return NextResponse.next()
    }

    // Default: allow access
    return NextResponse.next()

  } catch (error) {
    console.error('Middleware error:', error)
    // On error, redirect to login
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 