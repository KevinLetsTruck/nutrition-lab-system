import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// Define client-allowed routes
const CLIENT_ALLOWED_ROUTES = [
  '/client/onboarding',
  '/client/success',
  '/auth',
  '/api/auth',
  '/api/client/onboarding'
]

// Define admin-only routes
const ADMIN_ONLY_ROUTES = [
  '/admin',
  '/api/admin'
]

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

  // Check if route requires authentication
  const requiresAuth = !PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  
  if (!requiresAuth) {
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
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const { role, onboarding_completed } = userData

    // Handle client access restrictions
    if (role === 'client') {
      // Check if client is trying to access admin routes
      if (ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/client/onboarding', request.url))
      }

      // Check if client is trying to access non-allowed routes
      const isAllowedRoute = CLIENT_ALLOWED_ROUTES.some(route => pathname.startsWith(route))
      
      if (!isAllowedRoute) {
        // Redirect clients to onboarding if not completed, otherwise to success page
        if (!onboarding_completed) {
          return NextResponse.redirect(new URL('/client/onboarding', request.url))
        } else {
          return NextResponse.redirect(new URL('/client/success', request.url))
        }
      }

      // If client is accessing onboarding but has already completed it, redirect to success
      if (pathname === '/client/onboarding' && onboarding_completed) {
        return NextResponse.redirect(new URL('/client/success', request.url))
      }
    }

    // Handle admin access
    if (role === 'admin') {
      // Admins can access all routes
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