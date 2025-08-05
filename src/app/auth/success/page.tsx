'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function AuthSuccessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [countdown, setCountdown] = useState(3)
  const [redirectPath, setRedirectPath] = useState('/clients')

  useEffect(() => {
    // Determine redirect path based on user role
    const checkUserAndRedirect = async () => {
      if (!user) return

      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        const data = await response.json()
        
        if (data.user?.role === 'client') {
          // Check if client has completed onboarding
          if (!data.user.onboarding_completed) {
            setRedirectPath('/client/onboarding')
          } else {
            setRedirectPath('/client/success')
          }
        } else if (data.user?.role === 'admin') {
          setRedirectPath('/clients')
          // Redirect admins immediately without countdown
          router.push('/clients')
          return
        }
      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }

    checkUserAndRedirect()
  }, [user, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(redirectPath)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router, redirectPath])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Login Successful!</h1>
        <p className="text-gray-400 mb-6">You have been successfully authenticated.</p>
        
        <div className="mb-6">
          <p className="text-gray-300">
            Redirecting to {redirectPath === '/client/onboarding' ? 'onboarding' : redirectPath === '/client/success' ? 'your dashboard' : 'clients'} in {countdown} seconds...
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href={redirectPath} 
            className="block w-full max-w-xs mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Now
          </Link>
        </div>
      </div>
    </div>
  )
}