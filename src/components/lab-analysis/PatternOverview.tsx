'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  AlertCircle, 
  TrendingUp, 
  Activity,
  Brain,
  Zap,
  Heart,
  ShieldAlert
} from 'lucide-react'

interface Pattern {
  id: string
  pattern_name: string
  pattern_category: string
  confidence_score: number
  supporting_markers: any[]
  clinical_significance?: string
  truck_driver_impact?: string
  priority_level: string
  lab_results?: {
    collection_date: string
  }
}

interface PatternOverviewProps {
  patterns: Pattern[]
}

export default function PatternOverview({ patterns }: PatternOverviewProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'metabolic':
        return <Zap className="h-5 w-5 text-yellow-500" />
      case 'hormonal':
        return <Brain className="h-5 w-5 text-purple-500" />
      case 'inflammatory':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'nutritional':
        return <Heart className="h-5 w-5 text-green-500" />
      default:
        return <Activity className="h-5 w-5 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate':
        return 'destructive'
      case 'high':
        return 'warning'
      case 'moderate':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const groupedPatterns = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.pattern_category]) {
      acc[pattern.pattern_category] = []
    }
    acc[pattern.pattern_category].push(pattern)
    return acc
  }, {} as Record<string, Pattern[]>)

  if (!patterns.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No patterns detected yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Upload lab results to identify health patterns
          </p>
        </CardContent>
      </Card>
    )
  }

  const immediatePatterns = patterns.filter(p => p.priority_level === 'immediate')

  return (
    <div className="space-y-6">
      {/* Alert for immediate attention patterns */}
      {immediatePatterns.length > 0 && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Immediate Attention Required</AlertTitle>
          <AlertDescription>
            {immediatePatterns.length} pattern{immediatePatterns.length !== 1 ? 's' : ''} require{immediatePatterns.length === 1 ? 's' : ''} immediate attention:
            <ul className="mt-2 list-disc list-inside">
              {immediatePatterns.map(pattern => (
                <li key={pattern.id}>{pattern.pattern_name}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Pattern Categories */}
      {Object.entries(groupedPatterns).map(([category, categoryPatterns]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {category.charAt(0).toUpperCase() + category.slice(1)} Patterns
            </CardTitle>
            <CardDescription>
              {categoryPatterns.length} pattern{categoryPatterns.length !== 1 ? 's' : ''} detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPatterns.map(pattern => (
                <div key={pattern.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{pattern.pattern_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getPriorityColor(pattern.priority_level)}>
                          {pattern.priority_level} priority
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {(pattern.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={pattern.confidence_score * 100} className="w-24" />
                  </div>

                  {pattern.clinical_significance && (
                    <div>
                      <p className="text-sm font-medium mb-1">Clinical Significance:</p>
                      <p className="text-sm text-muted-foreground">{pattern.clinical_significance}</p>
                    </div>
                  )}

                  {pattern.truck_driver_impact && (
                    <div>
                      <p className="text-sm font-medium mb-1">Truck Driver Impact:</p>
                      <p className="text-sm text-muted-foreground">{pattern.truck_driver_impact}</p>
                    </div>
                  )}

                  {pattern.supporting_markers && pattern.supporting_markers.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Supporting Markers:</p>
                      <div className="flex flex-wrap gap-2">
                        {pattern.supporting_markers.map((marker: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {marker.test_name}: {marker.value} {marker.unit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pattern Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Pattern Summary</CardTitle>
          <CardDescription>Overview of all detected patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{patterns.length}</p>
              <p className="text-sm text-muted-foreground">Total Patterns</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {patterns.filter(p => p.priority_level === 'immediate').length}
              </p>
              <p className="text-sm text-muted-foreground">Immediate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {patterns.filter(p => p.priority_level === 'high').length}
              </p>
              <p className="text-sm text-muted-foreground">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {(patterns.reduce((sum, p) => sum + p.confidence_score, 0) / patterns.length * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Confidence</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}