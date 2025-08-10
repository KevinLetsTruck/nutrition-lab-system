'use client'

import { RouteGuard } from './RouteGuard'

// HOC for admin pages
export function AdminPage({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedRoles={['admin']}>{children}</RouteGuard>
}

// HOC for client pages
export function ClientPage({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedRoles={['client']}>{children}</RouteGuard>
}

// HOC for any authenticated user
export function AuthenticatedPage({ children }: { children: React.ReactNode }) {
  return <RouteGuard>{children}</RouteGuard>
}
