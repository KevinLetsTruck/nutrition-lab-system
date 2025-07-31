'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, register, user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      console.log('🔄 User already authenticated, redirecting to /clients')
      router.push('/clients')
    }
  }, [user, authLoading, router])

  // Don't render the form if user is authenticated or still loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 FORM SUBMITTED - handleSubmit called!')
    console.log('📝 Form data:', { email: formData.email, password: formData.password ? '[HIDDEN]' : '[EMPTY]' })
    
    setLoading(true)
    setError('')

    console.log('🚀 Form submitted, mode:', mode)
    console.log('📧 Email:', formData.email)

    try {
      if (mode === 'register') {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setLoading(false)
          return
        }

        // Validate password strength
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long')
          setLoading(false)
          return
        }

        const result = await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })

        if (result.success) {
          // Redirect to email verification page
          router.push('/verify-email')
        } else {
          setError(result.error || 'Registration failed')
        }
      } else {
        console.log('🔐 Calling login function...')
        console.log('🔐 Login params:', { email: formData.email, password: formData.password ? '[HIDDEN]' : '[EMPTY]' })
        
        const result = await login(formData.email, formData.password)
        console.log('📥 Login result:', result)
        
        if (result.success) {
          console.log('✅ Login successful, redirecting to /clients')
          // Redirect to clients page for client selection
          router.push('/clients')
        } else {
          console.log('❌ Login failed:', result.error)
          setError(result.error || 'Login failed')
        }
      }
    } catch (error) {
      console.error('🚨 Unexpected error in handleSubmit:', error)
      setError('An unexpected error occurred')
    } finally {
      console.log('🏁 handleSubmit completed, setting loading to false')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-400 mt-2">
              {mode === 'register' 
                ? 'Start your health transformation journey' 
                : 'Continue your wellness journey'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                  required
                />
              </div>
            )}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
              required
            />

            {mode === 'register' && (
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                required
              />
            )}

            <input
              type="password"
              name="password"
              placeholder={mode === 'register' ? 'Create Password' : 'Password'}
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
              required
            />

            {mode === 'register' && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              onClick={() => console.log('🔘 Submit button clicked!')}
              className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-green-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {mode === 'register' ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                mode === 'register' ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register')
                setError('')
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: ''
                })
              }}
              className="text-green-400 hover:text-green-300 text-sm"
            >
              {mode === 'register' 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {mode === 'login' && (
            <div className="text-center mt-4">
              <button className="text-gray-400 hover:text-gray-300 text-sm">
                Forgot your password?
              </button>
            </div>
          )}
          
          {/* Debug test button */}
          <div className="text-center mt-4 pt-4 border-t border-slate-700">
            <button 
              type="button"
              onClick={async () => {
                console.log('🧪 Test button clicked!')
                console.log('🧪 Testing login with hardcoded credentials...')
                const result = await login('kevin@letstruck.com', 'testpassword123')
                console.log('🧪 Test login result:', result)
                if (result.success) {
                  console.log('🧪 Test login successful!')
                  router.push('/clients')
                } else {
                  console.log('🧪 Test login failed:', result.error)
                  setError('Test login failed: ' + result.error)
                }
              }}
              className="text-blue-400 hover:text-blue-300 text-sm bg-blue-500/10 px-3 py-1 rounded"
            >
              🧪 Test Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 