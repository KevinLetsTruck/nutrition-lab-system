'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: string[]
  redirectTo?: string
}

// Define route configurations
const routeConfig = {
  // Admin only routes
  admin: [
    '/clients',
    '/admin',
    '/settings',
    '/lab-reports',
    '/api-health'
  ],
  // Client only routes  
  client: [
    '/client',
    '/protocols',
    '/lab-upload',
    '/lab-results',
    '/assessments',
    '/reports'
  ],
  // Public routes (no auth required)
  public: [
    '/',
    '/login',
    '/register',
    '/auth',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy'
  ]
}

export function RouteGuard({ children, allowedRoles, redirectTo }: RouteGuardProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Don't check auth on public routes
    const isPublicRoute = routeConfig.public.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    )

    if (isPublicRoute) {
      setAuthorized(true)
      return
    }

    // Wait for auth to load
    if (authLoading) return

    // No user = redirect to login
    if (!user) {
      setAuthorized(false)
      router.push(`/auth?from=${encodeURIComponent(pathname)}`)
      return
    }

    // Check role-based access
    const userRole = user.role?.toLowerCase()
    
    // Check admin routes
    const isAdminRoute = routeConfig.admin.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    )
    
    // Check client routes
    const isClientRoute = routeConfig.client.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    )

    // Admin trying to access client route
    if (userRole === 'admin' && isClientRoute && !pathname.includes('/client/')) {
      setAuthorized(false)
      router.push('/clients')
      return
    }

    // Client trying to access admin route
    if (userRole === 'client' && isAdminRoute) {
      setAuthorized(false)
      router.push('/client/dashboard')
      return
    }

    // Check specific allowed roles if provided
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole)) {
        setAuthorized(false)
        router.push(redirectTo || (userRole === 'admin' ? '/clients' : '/client/dashboard'))
        return
      }
    }

    // All checks passed
    setAuthorized(true)
  }, [user, authLoading, pathname, router, allowedRoles, redirectTo])

  // Show loading during auth check
  if (authLoading || (!authorized && !routeConfig.public.includes(pathname))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!authorized) {
    return null
  }

  // Authorized
  return <>{children}</>
}

// HOC for easier page wrapping
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    allowedRoles?: string[]
    redirectTo?: string
  }
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    )
  }
}
