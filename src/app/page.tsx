'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to clients page for clinical workflow
    router.push('/clients')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to clinical dashboard...</p>
        </div>
      </div>
    </div>
  )
}
