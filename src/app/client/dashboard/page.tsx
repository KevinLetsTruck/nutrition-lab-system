'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  FileText,
  Activity,
  Calendar,
  TrendingUp,
  Upload,
  MessageSquare,
  LogOut,
  Loader2
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  role: string
  profile?: {
    firstName: string
    lastName: string
  }
}

interface DashboardStats {
  totalReports: number
  pendingReports: number
  completedAssessments: number
  upcomingAppointments: number
}

export default function ClientDashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    pendingReports: 0,
    completedAssessments: 0,
    upcomingAppointments: 0
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      setUser(data.user)
      
      // Fetch dashboard stats
      // In production, this would be a separate API call
      setStats({
        totalReports: 3,
        pendingReports: 1,
        completedAssessments: 2,
        upcomingAppointments: 1
      })
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) return null

  const quickActions = [
    {
      title: 'Upload Lab Results',
      description: 'Submit new lab documents for analysis',
      icon: Upload,
      href: '/lab-upload',
      color: 'bg-blue-500'
    },
    {
      title: 'View Reports',
      description: 'Access your health analysis reports',
      icon: FileText,
      href: '/reports',
      color: 'bg-green-500'
    },
    {
      title: 'Health Assessment',
      description: 'Complete health questionnaires',
      icon: Activity,
      href: '/assessments',
      color: 'bg-purple-500'
    },
    {
      title: 'Schedule Consultation',
      description: 'Book time with your practitioner',
      icon: Calendar,
      href: '/appointments',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome, {user.profile?.firstName || 'Client'}!
                </h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Analysis</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingReports}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Assessments</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completedAssessments}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Appointments</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-lg ${action.color} text-white mb-4`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Lab results uploaded</p>
                  <p className="text-sm text-gray-500">January 15, 2024 - Analysis complete</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Health assessment completed</p>
                  <p className="text-sm text-gray-500">January 10, 2024 - NAQ questionnaire</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Consultation notes added</p>
                  <p className="text-sm text-gray-500">January 5, 2024 - Follow-up recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
