import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

interface RouteConfig {
  requireAuth: boolean
  requireRole?: 'CLIENT' | 'ADMIN'
  redirectTo?: string
}

const routeConfig: Record<string, RouteConfig> = {
  // Public routes
  '/': { requireAuth: false },
  '/login': { requireAuth: false },
  '/register': { requireAuth: false },
  '/reset-password': { requireAuth: false },
  '/verify-email': { requireAuth: false },
  '/terms': { requireAuth: false },
  '/privacy': { requireAuth: false },
  
  // Client routes
  '/client/dashboard': { requireAuth: true, requireRole: 'CLIENT' },
  '/lab-upload': { requireAuth: true, requireRole: 'CLIENT' },
  '/lab-results': { requireAuth: true, requireRole: 'CLIENT' },
  '/reports': { requireAuth: true, requireRole: 'CLIENT' },
  '/assessments': { requireAuth: true, requireRole: 'CLIENT' },
  '/protocols': { requireAuth: true, requireRole: 'CLIENT' },
  
  // Admin routes
  '/dashboard': { requireAuth: true, requireRole: 'ADMIN' },
  '/clients': { requireAuth: true, requireRole: 'ADMIN' },
  '/admin': { requireAuth: true, requireRole: 'ADMIN' },
  
  // Shared authenticated routes
  '/profile': { requireAuth: true },
  '/settings': { requireAuth: true },
}

export async function authMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Find matching route config
  let config: RouteConfig | undefined
  let matchedPath = ''
  
  // Check exact match first
  if (routeConfig[path]) {
    config = routeConfig[path]
    matchedPath = path
  } else {
    // Check for pattern matches (e.g., /lab-results/[id])
    for (const [route, routeConf] of Object.entries(routeConfig)) {
      if (pathMatches(path, route)) {
        config = routeConf
        matchedPath = route
        break
      }
    }
  }
  
  // If no config found, allow access (default open)
  if (!config) {
    return NextResponse.next()
  }
  
  // If route doesn't require auth, allow access
  if (!config.requireAuth) {
    return NextResponse.next()
  }
  
  // Check authentication
  const session = await getServerSession(request)
  
  // If no session and auth required, redirect to login
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', path)
    return NextResponse.redirect(url)
  }
  
  // Check role requirements
  if (config.requireRole && session.role !== config.requireRole) {
    // Redirect to appropriate dashboard
    const url = request.nextUrl.clone()
    if (session.role === 'CLIENT') {
      url.pathname = '/client/dashboard'
    } else if (session.role === 'ADMIN') {
      url.pathname = '/dashboard'
    } else {
      url.pathname = '/'
    }
    return NextResponse.redirect(url)
  }
  
  // Check if user is trying to access login/register while authenticated
  if (session && (path === '/login' || path === '/register')) {
    const url = request.nextUrl.clone()
    if (session.role === 'CLIENT') {
      url.pathname = '/client/dashboard'
    } else if (session.role === 'ADMIN') {
      url.pathname = '/dashboard'
    }
    return NextResponse.redirect(url)
  }
  
  // All checks passed, allow access
  return NextResponse.next()
}

function pathMatches(path: string, pattern: string): boolean {
  // Simple pattern matching for dynamic routes
  // e.g., /lab-results/[id] matches /lab-results/123
  if (pattern.includes('[')) {
    const regex = new RegExp('^' + pattern.replace(/\[.*?\]/g, '[^/]+') + '$')
    return regex.test(path)
  }
  
  // Check if path starts with pattern (for nested routes)
  return path.startsWith(pattern)
}
