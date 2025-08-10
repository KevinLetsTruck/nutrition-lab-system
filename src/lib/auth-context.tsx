'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, redirectTo?: string | null) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshToken: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isClient: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Computed properties
  const isAuthenticated = !!user
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const isClient = user?.role?.toLowerCase() === 'client'

  // Auto refresh token every 30 minutes
  useEffect(() => {
    checkAuth()
    
    // Set up token refresh interval
    const interval = setInterval(() => {
      if (user) {
        refreshToken()
      }
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, redirectTo?: string) => {
    // Use Prisma-based login endpoint
    const response = await fetch('/api/auth/login-prisma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    console.log('Login successful, setting user:', data.user)
    setUser(data.user)
    
    // Force a small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Use provided redirect or check URL parameter
    let destination = redirectTo
    if (!destination) {
      const params = new URLSearchParams(window.location.search)
      destination = params.get('from') || null
    }
    
    // Redirect based on role
    if (destination) {
      router.push(destination)
    } else {
      const defaultRoute = data.user.role === 'admin' ? '/clients' : '/client/dashboard'
      router.push(defaultRoute)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      router.push('/auth')
    }
  }

  // Refresh token to extend session
  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 401) {
        // Token expired, logout
        await logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      checkAuth,
      refreshToken,
      isAuthenticated,
      isAdmin,
      isClient
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}