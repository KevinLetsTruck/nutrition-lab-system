'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, MapPin, User, RefreshCw } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'

interface AnalysisRecord {
  id: string
  caller_name: string
  caller_location: string
  file_name: string
  analysis_results: {
    summary: string
    recommendations: string[]
    keyFindings: string[]
    reportType: string
  }
  created_at: string
}

export default function RadioAnalysisPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null)

  const fetchAnalyses = async () => {
    try {
      setLoading(true)
      
      // For now, we'll use localStorage to store recent analyses
      // In production, you'd want to save these to the database
      const storedAnalyses = localStorage.getItem('radioShowAnalyses')
      if (storedAnalyses) {
        const parsed = JSON.parse(storedAnalyses)
        // Sort by most recent first
        parsed.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setAnalyses(parsed)
        
        // Auto-select the most recent one
        if (parsed.length > 0 && !selectedAnalysis) {
          setSelectedAnalysis(parsed[0])
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching analyses:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyses()
    
    // Set up interval to refresh every 30 seconds
    const interval = setInterval(fetchAnalyses, 30000)
    
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Radio Show Analysis View</h1>
            <p className="text-gray-400">Real-time analysis results for on-air presentation</p>
          </div>
          <button
            onClick={fetchAnalyses}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Analyses List */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Analyses</h2>
            
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : analyses.length === 0 ? (
              <div className="text-gray-400">No analyses yet. Upload documents from the Quick Analysis page.</div>
            ) : (
              <div className="space-y-3">
                {analyses.slice(0, 10).map((analysis) => (
                  <button
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedAnalysis?.id === analysis.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{analysis.caller_name}</span>
                      <span className="text-xs opacity-75">{formatTime(analysis.created_at)}</span>
                    </div>
                    <div className="flex items-center text-xs opacity-75">
                      <MapPin className="w-3 h-3 mr-1" />
                      {analysis.caller_location}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Analysis Details */}
          <div className="lg:col-span-2">
            {selectedAnalysis ? (
              <div className="bg-slate-800 rounded-lg p-6">
                {/* Caller Header */}
                <div className="bg-slate-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="w-8 h-8 text-blue-400 mr-3" />
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {selectedAnalysis.caller_name}
                        </h3>
                        <p className="text-gray-400 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {selectedAnalysis.caller_location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{formatDate(selectedAnalysis.created_at)}</p>
                      <p className="text-xs text-gray-500">{formatTime(selectedAnalysis.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Document Info */}
                <div className="mb-6">
                  <div className="flex items-center text-gray-400 mb-2">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="text-sm">{selectedAnalysis.file_name}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Report Type: {selectedAnalysis.analysis_results.reportType}
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-3">Summary</h4>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {selectedAnalysis.analysis_results.summary}
                  </p>
                </div>

                {/* Key Findings */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-white mb-3">Key Findings</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.analysis_results.keyFindings.map((finding, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-blue-400 mr-3 text-lg">•</span>
                        <p className="text-gray-300 text-lg">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.analysis_results.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-green-400 mr-3">✓</span>
                        <p className="text-gray-300 text-lg">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  Select an analysis from the list to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}