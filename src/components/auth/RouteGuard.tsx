'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles?: ('admin' | 'client')[]
  requireAuth?: boolean
}

export function RouteGuard({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: RouteGuardProps) {
  const { user, loading: authLoading, checkAuth } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const validateRoute = async () => {
      setChecking(true)
      
      // Refresh auth state
      await checkAuth()
      
      // Check if authentication is required
      if (requireAuth && !user) {
        // Save attempted route
        const redirectUrl = encodeURIComponent(pathname)
        router.push(`/auth?from=${redirectUrl}`)
        return
      }

      // Check role-based access
      if (allowedRoles.length > 0 && user) {
        const userRole = user.role.toLowerCase() as 'admin' | 'client'
        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard based on role
          if (userRole === 'admin') {
            router.push('/clients')
          } else {
            router.push('/client/dashboard')
          }
          return
        }
      }

      // User is authorized
      setAuthorized(true)
      setChecking(false)
    }

    validateRoute()
  }, [pathname, user, allowedRoles, requireAuth, router, checkAuth])

  // Show loading state while checking auth
  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Don't render children until authorized
  if (!authorized) {
    return null
  }

  return <>{children}</>
}

// Convenience wrapper components
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['admin']}>
      {children}
    </RouteGuard>
  )
}

export function ClientRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowedRoles={['client']}>
      {children}
    </RouteGuard>
  )
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requireAuth={true}>
      {children}
    </RouteGuard>
  )
}
