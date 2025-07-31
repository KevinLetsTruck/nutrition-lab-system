'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, ClientProfile, AdminProfile } from './auth-service'

interface AuthContextType {
  user: User | null
  profile: ClientProfile | AdminProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ClientProfile | AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setProfile(data.profile)
      } else {
        setUser(null)
        setProfile(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('📥 Login response status:', response.status)
      
      const data = await response.json()
      console.log('📥 Login response data:', data)

      if (response.ok) {
        console.log('✅ Login successful, setting user data')
        setUser(data.user)
        
        // Don't call checkAuth() here as it might cause issues
        // Instead, manually set the profile if available
        if (data.profile) {
          setProfile(data.profile)
        }
        
        return { success: true }
      } else {
        console.log('❌ Login failed:', data.error)
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('🚨 Login error:', error)
      return { success: false, error: 'Login failed. Please try again.' }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Email verification error:', error)
      return { success: false, error: 'Email verification failed.' }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    verifyEmail,
  }

  return (
    <AuthContext.Provider value={value}>
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

// Hook for protected routes
export function useRequireAuth() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login page
      window.location.href = '/auth'
    }
  }, [user, loading])

  return { user, loading }
}

// Hook for admin-only routes
export function useRequireAdmin() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      // Redirect to home page
      window.location.href = '/'
    }
  }, [user, loading])

  return { user, loading }
} 