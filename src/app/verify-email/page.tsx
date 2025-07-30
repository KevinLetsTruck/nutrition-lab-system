'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { verifyEmail } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const handleVerifyEmail = async () => {
    if (!token) {
      setError('No verification token found')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await verifyEmail(token)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth?mode=login')
        }, 3000)
      } else {
        setError(result.error || 'Email verification failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = () => {
    // TODO: Implement resend email functionality
    setError('Resend functionality coming soon')
  }

  // If token is present, auto-verify
  if (token && !loading && !success && !error) {
    handleVerifyEmail()
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          {success ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">Email Verified!</h2>
              <p className="text-gray-400 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-400 text-sm">
                Redirecting to login page...
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
              <p className="text-gray-400 mb-6">
                We&apos;ve sent a verification link to your email address. 
                Please click the link to verify your account and continue.
              </p>
              
              {loading && (
                <div className="mb-6">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-blue-400 text-sm">Verifying your email...</p>
                </div>
              )}
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <button 
                onClick={handleResendEmail}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                Didn&apos;t receive the email? Resend
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 