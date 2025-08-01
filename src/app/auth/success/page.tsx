'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Try to redirect
          router.push('/clients-simple')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Login Successful!</h1>
        <p className="text-gray-400 mb-6">You have been successfully authenticated.</p>
        
        <div className="mb-6">
          <p className="text-gray-300">Redirecting to dashboard in {countdown} seconds...</p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href="/clients-simple" 
            className="block w-full max-w-xs mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard Now
          </Link>
          
          <Link 
            href="/dashboard" 
            className="block w-full max-w-xs mx-auto px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Go to Main Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}