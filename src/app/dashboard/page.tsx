'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <h1 className="text-xl font-bold text-white">DestinationHealth Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.email}</span>
              <Button onClick={handleLogout} variant="outline" className="text-gray-300 border-gray-600 hover:bg-gray-700">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Welcome to Your Dashboard</CardTitle>
              <CardDescription className="text-gray-400">
                Your health transformation journey starts here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-300">Email: {user.email}</p>
                <p className="text-gray-300">Role: {user.role}</p>
                <p className="text-gray-300">Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
                <p className="text-gray-300">Onboarding Completed: {user.onboardingCompleted ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Get started with your health journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push('/streamlined-onboarding')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Start Onboarding
              </Button>
              <Button 
                onClick={() => router.push('/')}
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Upload Lab Results
              </Button>
              <Button 
                onClick={() => router.push('/reports')}
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Account Status</CardTitle>
              <CardDescription className="text-gray-400">
                Your current account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Account Created:</span>
                  <span className="text-gray-400">{user.createdAt?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Last Login:</span>
                  <span className="text-gray-400">{user.lastLogin?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status:</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
} 