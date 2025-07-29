'use client'

import React, { useState, useEffect } from 'react'
import { Button } from './button'
import { Loader2, FileText, Calendar, User, TrendingUp, AlertCircle } from 'lucide-react'

interface AnalysisResult {
  id: string
  report_type: string
  client_email: string
  client_first_name: string
  client_last_name: string
  created_at: string
  status: string
  confidence: number
  processing_time: number
}

export function RecentResults() {
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentResults()
  }, [])

  const fetchRecentResults = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/analyze')
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent results')
      }
      
      const data = await response.json()
      
      if (data.success && data.pendingAnalyses) {
        setResults(data.pendingAnalyses.slice(0, 5)) // Show last 5 results
      } else {
        setResults([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-400 bg-green-500/20'
      case 'processing':
        return 'text-primary-400 bg-primary-500/20'
      case 'failed':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-dark-400 bg-dark-500/20'
    }
  }

  const getReportTypeIcon = (reportType: string) => {
    switch (reportType.toLowerCase()) {
      case 'nutriq':
        return '📊'
      case 'kbmo':
        return '🔬'
      case 'dutch':
        return '🧬'
      case 'cgm':
        return '📈'
      case 'food_photo':
        return '📷'
      default:
        return '📄'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-primary-400 animate-spin mr-2" />
        <span className="text-dark-300">Loading recent results...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
        <Button onClick={fetchRecentResults} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-dark-400">
        <FileText className="h-12 w-12 mx-auto mb-4 text-dark-600" />
        <p className="text-lg font-medium mb-2">No recent analyses</p>
        <p className="text-sm">Upload a lab report to see results here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Recent Analyses</h3>
        <Button onClick={fetchRecentResults} variant="ghost" size="sm">
          Refresh
        </Button>
      </div>
      
      <div className="space-y-3">
        {results.map((result) => (
          <div
            key={result.id}
            className="border border-dark-600 rounded-lg p-4 hover:bg-dark-750 transition-colors bg-dark-800/50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getReportTypeIcon(result.report_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-white">
                      {result.report_type.toUpperCase()} Report
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-dark-300">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>
                        {result.client_first_name} {result.client_last_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(result.created_at)}</span>
                    </div>
                    {result.confidence && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{result.confidence}% confidence</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right text-sm text-dark-400">
                {result.processing_time && (
                  <div>{result.processing_time}ms</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {results.length >= 5 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            View All Results
          </Button>
        </div>
      )}
    </div>
  )
} 