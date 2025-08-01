'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ClientSuccessPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      const result = await response.json()
      
      if (!response.ok || result.user?.role !== 'client') {
        router.push('/auth')
        return
      }

      // Get user profile for name
      const profileResponse = await fetch('/api/auth/profile')
      const profileResult = await profileResponse.json()
      
      if (profileResponse.ok && profileResult.profile) {
        setUserName(profileResult.profile.first_name)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth')
    }
  }, [router])

  useEffect(() => {
    // Check if user is authenticated and is a client
    checkAuth()
  }, [checkAuth])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/auth')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-3xl font-bold text-white">
              Welcome to DestinationHealth!
            </CardTitle>
            <CardDescription className="text-slate-400 text-lg">
              Your onboarding is complete and your health journey begins now
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
              <h3 className="text-green-300 font-semibold mb-3">What happens next?</h3>
              <div className="space-y-3 text-green-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Review & Analysis</p>
                    <p className="text-sm text-green-300">Kevin will review your information and create personalized recommendations</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Welcome Email</p>
                    <p className="text-sm text-green-300">You&apos;ll receive a detailed welcome email with next steps and resources</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Schedule Consultation</p>
                    <p className="text-sm text-green-300">Book your first consultation to discuss your personalized health plan</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Begin Your Journey</p>
                    <p className="text-sm text-green-300">Start implementing your health protocol and track your progress</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
              <h3 className="text-blue-300 font-semibold mb-3">Important Information</h3>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>• Check your email for a confirmation and next steps</li>
                <li>• Kevin will contact you within 24-48 hours</li>
                <li>• Your information has been securely saved</li>
                <li>• You&apos;ll receive a personalized health plan soon</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <p className="text-slate-300">
                Thank you for choosing DestinationHealth for your health journey!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Logout
                </Button>
                
                <Button
                  onClick={() => window.open('mailto:kevin@destinationhealth.com', '_blank')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Contact Kevin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 