'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  FileText, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  Brain,
  Zap,
  Shield,
  Pill,
  Apple,
  Dumbbell
} from 'lucide-react'
import LabUploadDialog from '@/components/lab-analysis/LabUploadDialog'
import LabResultsList from '@/components/lab-analysis/LabResultsList'
import PatternOverview from '@/components/lab-analysis/PatternOverview'
import ProtocolSummary from '@/components/lab-analysis/ProtocolSummary'
import HealthScoreCard from '@/components/lab-analysis/HealthScoreCard'
import { useAuth } from '@/lib/auth-context'

export default function LabAnalysisPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user, selectedClient, fetchDashboardData])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch lab results
      const labResultsRes = await fetch(`/api/lab-results${selectedClient ? `?client_id=${selectedClient}` : ''}`)
      const labResults = await labResultsRes.json()

      // Fetch patterns
      const patternsRes = await fetch(`/api/lab-analysis/patterns${selectedClient ? `?client_id=${selectedClient}` : ''}`)
      const patterns = await patternsRes.json()

      // Fetch protocols
      const protocolsRes = await fetch(`/api/lab-analysis/protocols${selectedClient ? `?client_id=${selectedClient}` : ''}`)
      const protocols = await protocolsRes.json()

      setDashboardData({
        labResults: labResults.data || [],
        patterns: patterns.patterns || [],
        protocols: protocols.protocols || [],
        groupedPatterns: patterns.grouped_patterns || {}
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedClient])

  const getHealthScore = () => {
    if (!dashboardData?.labResults?.length) return 0
    
    const latestResult = dashboardData.labResults[0]
    return latestResult?.ai_analysis?.functional_assessment?.overall_vitality?.score || 0
  }

  const getPatternCounts = () => {
    const counts = {
      immediate: 0,
      high: 0,
      moderate: 0,
      low: 0
    }

    dashboardData?.patterns?.forEach((pattern: any) => {
      counts[pattern.priority_level as keyof typeof counts]++
    })

    return counts
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Progress className="w-64 mb-4" value={33} />
          <p className="text-muted-foreground">Loading lab analysis data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Lab Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive functional medicine lab analysis with AI-powered insights
            </p>
          </div>
          <Button onClick={() => setUploadOpen(true)} size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Upload Lab Results
          </Button>
        </div>
      </div>

      {/* Health Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <HealthScoreCard
          title="Overall Health"
          score={getHealthScore()}
          icon={Heart}
          description="Functional vitality score"
        />
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patterns</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.patterns?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {getPatternCounts().immediate} immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protocols</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.protocols?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DOT Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="success">Compliant</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Medical certification OK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Lab Results</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Pattern Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Metabolic Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.groupedPatterns?.metabolic?.map((pattern: any) => (
                    <Badge key={pattern.id} variant="warning">
                      {pattern.pattern_name}
                    </Badge>
                  ))}
                  {!dashboardData?.groupedPatterns?.metabolic?.length && (
                    <p className="text-sm text-muted-foreground">No metabolic issues detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-500" />
                  Hormonal Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.groupedPatterns?.hormonal?.map((pattern: any) => (
                    <Badge key={pattern.id} variant="secondary">
                      {pattern.pattern_name}
                    </Badge>
                  ))}
                  {!dashboardData?.groupedPatterns?.hormonal?.length && (
                    <p className="text-sm text-muted-foreground">Hormones in balance</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                  Inflammatory Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.groupedPatterns?.inflammatory?.map((pattern: any) => (
                    <Badge key={pattern.id} variant="destructive">
                      {pattern.pattern_name}
                    </Badge>
                  ))}
                  {!dashboardData?.groupedPatterns?.inflammatory?.length && (
                    <p className="text-sm text-muted-foreground">Low inflammation</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Apple className="h-5 w-5 mr-2 text-green-500" />
                  Nutritional Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dashboardData?.groupedPatterns?.nutritional?.map((pattern: any) => (
                    <Badge key={pattern.id} variant="outline">
                      {pattern.pattern_name}
                    </Badge>
                  ))}
                  {!dashboardData?.groupedPatterns?.nutritional?.length && (
                    <p className="text-sm text-muted-foreground">Well nourished</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Lab Results</CardTitle>
              <CardDescription>Latest uploaded lab documents and their analysis status</CardDescription>
            </CardHeader>
            <CardContent>
              <LabResultsList 
                results={dashboardData?.labResults?.slice(0, 5) || []} 
                compact={true}
              />
            </CardContent>
          </Card>

          {/* Active Protocols Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Active Protocols</CardTitle>
              <CardDescription>Current recommendations based on your lab patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Pill className="h-4 w-4 mr-2" />
                    Supplements
                  </div>
                  <p className="text-2xl font-bold">
                    {dashboardData?.protocols?.filter((p: any) => p.protocol_type === 'supplement').length || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Apple className="h-4 w-4 mr-2" />
                    Dietary
                  </div>
                  <p className="text-2xl font-bold">
                    {dashboardData?.protocols?.filter((p: any) => p.protocol_type === 'dietary').length || 0}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Lifestyle
                  </div>
                  <p className="text-2xl font-bold">
                    {dashboardData?.protocols?.filter((p: any) => p.protocol_type === 'lifestyle').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <LabResultsList results={dashboardData?.labResults || []} />
        </TabsContent>

        <TabsContent value="patterns">
          <PatternOverview patterns={dashboardData?.patterns || []} />
        </TabsContent>

        <TabsContent value="protocols">
          <ProtocolSummary protocols={dashboardData?.protocols || []} />
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>Track your health markers over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Trend analysis will show how your lab values change over time with interactive charts.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <LabUploadDialog 
        open={uploadOpen} 
        onOpenChange={setUploadOpen}
        onUploadComplete={() => {
          setUploadOpen(false)
          fetchDashboardData()
        }}
      />
    </div>
  )
}