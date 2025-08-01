'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Brain, MessageSquare, FileText, Calendar, TrendingUp } from 'lucide-react'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  last_assessment?: string
}

interface Assessment {
  id: string
  client_id: string
  type: string
  status: string
  created_at: string
  completed_at?: string
  client?: Client
}

export default function AssessmentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (clientsError) throw clientsError
      setClients(clientsData || [])

      // Fetch recent assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('structured_assessments')
        .select(`
          *,
          client:clients(id, first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      if (assessmentsError) throw assessmentsError
      setRecentAssessments(assessmentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const assessmentTypes = [
    {
      type: 'structured',
      title: 'Structured Health Assessment',
      description: 'Comprehensive 150-question functional medicine evaluation',
      icon: ClipboardList,
      color: 'from-emerald-500/10 to-emerald-600/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      href: '/assessments/select-client?type=structured'
    },
    {
      type: 'ai-conversation',
      title: 'AI Conversational Assessment',
      description: 'Dynamic, conversational health evaluation powered by AI',
      icon: MessageSquare,
      color: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400',
      href: '/assessments/select-client?type=ai-conversation'
    },
    {
      type: 'quick-analysis',
      title: 'Quick Analysis',
      description: 'Rapid health screening for immediate insights',
      icon: Brain,
      color: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400',
      href: '/quick-analysis'
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Completed</Badge>
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">New</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground-secondary">Loading assessments...</p>
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
            Health Assessments
          </h1>
          <p className="text-foreground-secondary text-lg">
            Choose an assessment type to evaluate your clients' health
          </p>
        </div>

        {/* Assessment Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {assessmentTypes.map((assessment) => {
            const Icon = assessment.icon
            return (
              <Card 
                key={assessment.type}
                className={`bg-gradient-to-br ${assessment.color} ${assessment.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer`}
                onClick={() => router.push(assessment.href)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${assessment.iconColor}`} />
                    </div>
                    <TrendingUp className={`w-5 h-5 ${assessment.iconColor} opacity-50`} />
                  </div>
                  <CardTitle className="text-xl">{assessment.title}</CardTitle>
                  <CardDescription className="text-foreground-secondary">
                    {assessment.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="secondary">
                    Start Assessment →
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Assessments */}
        {recentAssessments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold mb-4">Recent Assessments</h2>
            <div className="grid gap-4">
              {recentAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {assessment.client?.first_name} {assessment.client?.last_name}
                          </h3>
                          {getStatusBadge(assessment.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {assessment.type === 'structured' ? 'Structured' : 'AI Conversation'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(assessment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">
                        View Results
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Start */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-heading font-bold mb-4">
              Ready to assess a client's health?
            </h3>
            <p className="text-foreground-secondary mb-6">
              Choose from our comprehensive assessment tools to get started
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/assessments/select-client">
                  Select a Client
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/streamlined-onboarding">
                  Add New Client
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}