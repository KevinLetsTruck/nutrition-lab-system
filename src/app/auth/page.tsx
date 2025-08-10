'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  const [mode, setMode] = useState<'register' | 'login'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)
  const { login, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  // Check if this is a client registration link
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('client') === 'true') {
      setIsClient(true)
      setMode('register')
    }
  }, [])

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push('/clients')
      } else if (user.role === 'client') {
        router.push('/client/success')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, authLoading, router])

  // Don't render the form if user is authenticated or still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-secondary">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated at this point, they should have been redirected already
  // This ensures we don't show the login form if the user is already logged in
  if (user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        const userData = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          isClient: isClient
        }

        // Call registration API directly
        const response = await fetch('/api/auth/register-prisma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        })
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Registration failed')
        }
        
        // Show success message
        return (
          <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-6">
            <Card className="w-full max-w-md border-success/20">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-2xl gradient-text">Registration Successful!</CardTitle>
                <CardDescription>
                  Please check your email to verify your account.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )
      } else {
        // Login will handle navigation in auth context
        const redirectTo = searchParams.get('from') || undefined
        await login(formData.email, formData.password, redirectTo)
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand">
              <span className="text-white font-bold text-lg">NL</span>
            </div>
            <span className="text-2xl font-heading font-bold gradient-text">
              Nutrition Lab System
            </span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {mode === 'login' ? 'Welcome Back' : isClient ? 'Create Your Health Account' : 'Create Practitioner Account'}
          </h1>
          <p className="text-foreground-secondary">
            {mode === 'login' 
              ? 'Sign in to access your health dashboard' 
              : isClient 
              ? 'Start your journey to better health' 
              : 'Join our network of health professionals'}
          </p>
        </div>

        {/* Auth Form */}
        <Card className="border-border shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-sm text-primary hover:text-primary-hover transition-colors"
                >
                  {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground-muted">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:text-primary-hover">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-hover">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}