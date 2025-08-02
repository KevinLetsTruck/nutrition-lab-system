'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader2 } from 'lucide-react'

export default function StartAssessmentPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to auth page
        router.push('/auth')
      } else if (user.role === 'client') {
        // Client user - need to get their client ID
        fetchClientIdAndRedirect()
      } else {
        // Admin user - redirect to clients page
        router.push('/clients')
      }
    }
  }, [user, loading, router])

  const fetchClientIdAndRedirect = async () => {
    try {
      // First try to get client ID from the clients table
      const response = await fetch('/api/clients')
      
      if (response.ok) {
        const data = await response.json()
        
        // Find the client matching the logged-in user's email
        const client = data.clients?.find((c: any) => c.email === user?.email)
        
        if (client) {
          // Redirect to structured assessment with client ID
          router.push(`/assessments/structured/${client.id}`)
        } else {
          // No client found, create a message or redirect to onboarding
          alert('Client profile not found. Please contact support.')
          router.push('/')
        }
      } else {
        console.error('Failed to fetch clients')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching client ID:', error)
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-600">Preparing your assessment...</p>
      </div>
    </div>
  )
}