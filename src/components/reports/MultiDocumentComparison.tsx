import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Line, Radar, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MultiDocumentComparisonProps {
  results: any
}

export default function MultiDocumentComparison({ results }: MultiDocumentComparisonProps) {
  // Prepare data for symptom burden timeline
  const prepareTimelineData = () => {
    const systems = Object.keys(results.combinedReport?.aggregatedSymptomBurden || {})
    const datasets = systems.map((system, index) => {
      const data = results.combinedReport.aggregatedSymptomBurden[system].allScores
      
      return {
        label: system,
        data: data,
        borderColor: `hsl(${index * 360 / systems.length}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 360 / systems.length}, 70%, 50%, 0.2)`,
        tension: 0.1
      }
    })

    return {
      labels: results.metadata.files.map((_: any, i: number) => `Report ${i + 1}`),
      datasets
    }
  }

  // Prepare data for pattern frequency chart
  const preparePatternData = () => {
    const patterns = results.combinedReport?.crossReportPatterns?.patternFrequency || {}
    
    return {
      labels: Object.keys(patterns),
      datasets: [{
        label: 'Pattern Frequency',
        data: Object.values(patterns),
        backgroundColor: Object.keys(patterns).map((_, i) => 
          `hsla(${i * 360 / Object.keys(patterns).length}, 70%, 50%, 0.6)`
        ),
        borderColor: Object.keys(patterns).map((_, i) => 
          `hsl(${i * 360 / Object.keys(patterns).length}, 70%, 50%)`
        ),
        borderWidth: 1
      }]
    }
  }

  // Prepare radar chart for average confidence
  const prepareSeverityRadar = () => {
    const avgConfidence = results.combinedReport?.crossReportPatterns?.averageConfidence || {}
    
    return {
      labels: Object.keys(avgConfidence),
      datasets: [{
        label: 'Average Pattern Confidence',
        data: Object.values(avgConfidence),
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        borderColor: 'rgba(220, 38, 38, 1)',
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(220, 38, 38, 1)'
      }]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  }

  const radarOptions = {
    ...chartOptions,
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 10
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Symptom Burden Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Symptom Burden Timeline</CardTitle>
          <CardDescription>
            Track how symptom burden changes across multiple assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={prepareTimelineData()} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pattern Frequency</CardTitle>
            <CardDescription>
              How often each pattern appears across reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Bar data={preparePatternData()} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Pattern Confidence</CardTitle>
            <CardDescription>
              Mean confidence levels of patterns across all reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Radar data={prepareSeverityRadar()} options={radarOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Summary</CardTitle>
          <CardDescription>
            Overall health progression based on multi-document analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(results.combinedReport?.aggregatedSymptomBurden || {}).map(([system, data]: [string, any]) => {
              const trend = data.trend
              const trendColor = trend === 'improving' ? 'text-green-600' : 
                              trend === 'worsening' ? 'text-red-600' : 
                              'text-yellow-600'
              
              return (
                <div key={system} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{system}</span>
                    <Badge variant={trend === 'improving' ? 'success' : trend === 'worsening' ? 'destructive' : 'secondary'}>
                      {trend}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Range: {data.min.toFixed(1)} - {data.max.toFixed(1)} (Avg: {data.average.toFixed(1)})
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Multi-Document Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Timeline Analysis</h4>
            <p className="text-sm text-muted-foreground">
              Analyzed {results.metadata.totalFiles} documents spanning from{' '}
              {new Date(results.combinedReport?.timelineAnalysis?.dateRange?.earliest).toLocaleDateString() || 'N/A'} to{' '}
              {new Date(results.combinedReport?.timelineAnalysis?.dateRange?.latest).toLocaleDateString() || 'N/A'}
            </p>
          </div>

          {results.combinedReport?.consolidatedRootCauses?.primaryCauses?.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Consistent Root Causes</h4>
              <div className="flex flex-wrap gap-2">
                {results.combinedReport.consolidatedRootCauses.primaryCauses.map((cause: string) => (
                  <Badge key={cause} variant="outline">{cause}</Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-2">Analysis Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Patterns Found:</span>
                <span className="ml-2 font-medium">{results.totalPatterns?.length || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Unique Patterns:</span>
                <span className="ml-2 font-medium">{results.uniquePatterns?.length || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Persistent Patterns:</span>
                <span className="ml-2 font-medium">
                  {results.combinedReport?.crossReportPatterns?.persistentPatterns?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Emerging Patterns:</span>
                <span className="ml-2 font-medium">
                  {results.combinedReport?.crossReportPatterns?.emergingPatterns?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}