'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Activity, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  MessageSquare,
  BarChart,
  Brain
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalClients: number
  activeClients: number
  assessmentsToday: number
  pendingReviews: number
  protocolsGenerated: number
  successRate: number
}

interface RecentActivity {
  id: string
  type: 'assessment' | 'protocol' | 'upload' | 'note'
  clientName: string
  description: string
  timestamp: string
  status?: 'completed' | 'pending' | 'in_progress'
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    assessmentsToday: 0,
    pendingReviews: 0,
    protocolsGenerated: 0,
    successRate: 94
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      // Redirect admin users directly to clients
      if (user.role === 'admin') {
        router.push('/clients')
        return
      }
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      // Fetch clients count
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })

      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .is('archived_at', null)

      // Fetch today's assessments
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { count: assessmentsToday } = await supabase
        .from('structured_assessments')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Fetch recent activity (mock data for now)
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'assessment',
          clientName: 'John Smith',
          description: 'Completed NAQ assessment',
          timestamp: '2 min ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'protocol',
          clientName: 'Sarah Johnson',
          description: 'Protocol updated',
          timestamp: '1 hour ago',
          status: 'completed'
        },
        {
          id: '3',
          type: 'upload',
          clientName: 'Mike Davis',
          description: 'Lab results uploaded',
          timestamp: '3 hours ago',
          status: 'pending'
        },
        {
          id: '4',
          type: 'note',
          clientName: 'Emma Wilson',
          description: 'Added consultation notes',
          timestamp: '5 hours ago',
          status: 'completed'
        }
      ]

      setStats({
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        assessmentsToday: assessmentsToday || 0,
        pendingReviews: 2,
        protocolsGenerated: 23,
        successRate: 94
      })
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assessment':
        return <FileText className="w-4 h-4" />
      case 'protocol':
        return <Brain className="w-4 h-4" />
      case 'upload':
        return <Upload className="w-4 h-4" />
      case 'note':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'assessment':
        return 'bg-emerald-500'
      case 'protocol':
        return 'bg-blue-500'
      case 'upload':
        return 'bg-purple-500'
      case 'note':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground-secondary">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold gradient-text mb-2">
            Welcome back, Kevin
          </h1>
          <p className="text-foreground-secondary text-lg">
            Here&apos;s your practice overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{stats.activeClients}</div>
              <Badge className="mt-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                +12 this month
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">Assessments Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{stats.assessmentsToday}</div>
              <Badge className="mt-2 bg-blue-500/10 text-blue-400 border-blue-500/20">
                {stats.pendingReviews} pending review
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">Protocols Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">{stats.protocolsGenerated}</div>
              <Badge className="mt-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                This week
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{stats.successRate}%</div>
              <Badge className="mt-2 bg-orange-500/10 text-orange-400 border-orange-500/20">
                Client satisfaction
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="gradient-text">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" size="lg" asChild>
                <Link href="/upload">
                  <Upload className="mr-3 w-5 h-5" />
                  Upload Lab Results
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" size="lg" asChild>
                <Link href="/notes">
                  <MessageSquare className="mr-3 w-5 h-5" />
                  Client Notes
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" size="lg" asChild>
                <Link href="/reports">
                  <BarChart className="mr-3 w-5 h-5" />
                  View Reports
                </Link>
              </Button>
              <Button variant="secondary" className="w-full justify-start" size="lg" asChild>
                <Link href="/start-assessment">
                  <Brain className="mr-3 w-5 h-5" />
                  Start Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="gradient-text">Recent Activity</CardTitle>
              <CardDescription>Latest client assessments and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-card-hover">
                  <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.clientName}</p>
                    <p className="text-sm text-foreground-secondary flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-foreground-muted">{activity.timestamp}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="gradient-text">Performance Overview</CardTitle>
            <CardDescription>Your practice metrics for the past 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">127</div>
                <p className="text-sm text-foreground-secondary">Total Clients</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">89%</div>
                <p className="text-sm text-foreground-secondary">Completion Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-purple mb-2">4.8</div>
                <p className="text-sm text-foreground-secondary">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}