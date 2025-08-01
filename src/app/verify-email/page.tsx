'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    // Get email from session storage or URL params
    const storedEmail = sessionStorage.getItem('pendingVerificationEmail')
    const urlEmail = searchParams.get('email')
    
    if (storedEmail) {
      setEmail(storedEmail)
    } else if (urlEmail) {
      setEmail(urlEmail)
    }

    // Check if there's a verification token in the URL
    const token = searchParams.get('token')
    if (token) {
      verifyEmail(token)
    }
  }, [searchParams])

  const verifyEmail = async (token: string) => {
    setVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        sessionStorage.removeItem('pendingVerificationEmail')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth')
        }, 3000)
      } else {
        setError(data.error || 'Verification failed. Please try again.')
      }
    } catch (error) {
      setError('An error occurred during verification. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setError('No email address found. Please register again.')
      return
    }

    setVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setError('')
        alert('Verification email resent! Please check your inbox.')
      } else {
        setError(data.error || 'Failed to resend verification email.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Email Verified!</h1>
          <p className="text-gray-400 mb-6">
            Your email has been successfully verified. Redirecting to login...
          </p>
          <Link 
            href="/auth" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
            <p className="text-gray-400 mt-2">
              We've sent a verification link to {email || 'your email address'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {verifying ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Verifying your email...</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 text-center">
                <p className="text-gray-300">
                  Please check your email and click the verification link to continue.
                </p>
                
                <div className="bg-slate-700 rounded-lg p-4 text-left">
                  <h3 className="text-white font-semibold mb-2">Didn't receive the email?</h3>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• Check your spam folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Wait a few minutes and try again</li>
                  </ul>
                </div>

                <button
                  onClick={resendVerification}
                  disabled={!email || verifying}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend Verification Email
                </button>

                <Link 
                  href="/auth"
                  className="block text-green-400 hover:text-green-300 text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}