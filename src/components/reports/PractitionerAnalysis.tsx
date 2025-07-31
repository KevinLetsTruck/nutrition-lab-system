'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/Navigation'
import ExecutiveSummary from './sections/ExecutiveSummary'
import DataAnalysis from './sections/DataAnalysis'
import ClinicalInsights from './sections/ClinicalInsights'
import InterventionProtocol from './sections/InterventionProtocol'

import { fetchClientData } from '@/lib/client-data-service'
import { exportToPDF } from '@/lib/export-service'

export interface PractitionerAnalysisProps {
  clientId: string
  sessionDate?: Date
  mode: 'full' | 'coaching'
}

export interface ReportData {
  client: ClientData
  nutriqData: NutriQData
  labData: LabData[]
  notes: NoteData[]
  protocols: ProtocolData[]
  analysis: AIAnalysis
  version: AnalysisVersion
}

export interface ClientData {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  occupation: string
  primaryHealthConcern: string
  truckDriver: boolean
  createdAt: string
}

export interface NutriQData {
  totalScore: number
  bodySystems: {
    energy: { score: number; issues: string[]; recommendations: string[] }
    mood: { score: number; issues: string[]; recommendations: string[] }
    sleep: { score: number; issues: string[]; recommendations: string[] }
    stress: { score: number; issues: string[]; recommendations: string[] }
    digestion: { score: number; issues: string[]; recommendations: string[] }
    immunity: { score: number; issues: string[]; recommendations: string[] }
  }
  overallRecommendations: string[]
  priorityActions: string[]
  assessmentDate: string
}

export interface LabData {
  id: string
  reportType: string
  reportDate: string
  status: string
  results: any
  notes?: string
}

export interface NoteData {
  id: string
  type: 'interview' | 'coaching_call' | 'assistant'
  content: string
  date: string
  author?: string
}

export interface ProtocolData {
  id: string
  phase: string
  startDate: string
  content: string
  compliance?: number
  status: 'active' | 'completed' | 'paused'
}

export interface AIAnalysis {
  rootCauses: string[]
  systemInterconnections: string[]
  truckDriverConsiderations: string[]
  interventionProtocol: InterventionProtocol
  expectedTimeline: string
  complianceStrategies: string[]
  generatedAt: string
}

export interface InterventionProtocol {
  immediate: {
    supplements: SupplementRecommendation[]
    dietary: string[]
    lifestyle: string[]
  }
  phased: {
    week2_4: SupplementRecommendation[]
    week4_8: SupplementRecommendation[]
  }
  truckDriverMods: string[]
}

export interface SupplementRecommendation {
  product: string
  source: 'letstruck' | 'biotics' | 'fullscript'
  dosage: string
  timing: string
  duration: string
  truckCompatible: boolean
  notes?: string
}

export interface AnalysisVersion {
  id: string
  generatedAt: Date
  generatedBy: 'manual' | 'ai'
  snapshot: ReportData
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export interface HighlightData {
  id: string
  text: string
  color: 'yellow' | 'green' | 'blue' | 'red'
  timestamp: Date
}

const PractitionerAnalysis: React.FC<PractitionerAnalysisProps> = ({ 
  clientId, 
  sessionDate = new Date(), 
  mode: initialMode = 'full' 
}) => {
  const [mode, setMode] = useState<'full' | 'coaching'>(initialMode)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [highlights, setHighlights] = useState<HighlightData[]>([])
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadClientData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const clientData = await fetchClientData(clientId)
      setReport(clientData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client data')
    } finally {
      setIsLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    loadClientData()
  }, [clientId, loadClientData])

  const handleGenerateAIAnalysis = async () => {
    if (!report) return
    
    try {
      setIsGenerating(true)
      setError(null)
      
      const response = await fetch('/api/generate-ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportData: report })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate AI analysis')
      }
      
      const { analysis } = await response.json()
      
      setReport(prev => prev ? {
        ...prev,
        analysis,
        version: {
          id: crypto.randomUUID(),
          generatedAt: new Date(),
          generatedBy: 'ai',
          snapshot: prev
        }
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI analysis')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    if (!report) return
    
    try {
      await exportToPDF(report, mode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export PDF')
    }
  }

  const addHighlight = (text: string, color: HighlightData['color'] = 'yellow') => {
    const newHighlight: HighlightData = {
      id: crypto.randomUUID(),
      text,
      color,
      timestamp: new Date()
    }
    setHighlights(prev => [...prev, newHighlight])
  }

  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading practitioner analysis...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-400 mb-4">Error: {error}</p>
            <Button onClick={loadClientData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-gray-400">No report data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header with controls */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Practitioner Analysis Report
              </h1>
              <p className="text-gray-400">
                {report.client.name} • Session: {sessionDate.toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleGenerateAIAnalysis}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? 'Generating...' : 'Generate AI Analysis'}
              </Button>
              
              <div className="flex border border-gray-600 rounded-lg">
                <button
                  onClick={() => setMode('full')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    mode === 'full' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Full Report
                </button>
                <button
                  onClick={() => setMode('coaching')}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    mode === 'coaching' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Coaching View
                </button>
              </div>
              
              <Button 
                onClick={handleExportPDF}
                variant="outline"
              >
                Export PDF
              </Button>
            </div>
          </div>

          {/* Version info */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Version: {report.version.generatedAt.toLocaleDateString()}</span>
            <Badge variant={report.version.generatedBy === 'ai' ? 'blue' : 'default'}>
              {report.version.generatedBy === 'ai' ? 'AI Generated' : 'Manual'}
            </Badge>
            {report.client.truckDriver && (
              <Badge variant="orange" className="text-orange-400 border-orange-400">
                Truck Driver
              </Badge>
            )}
          </div>
        </div>

        {/* Report sections */}
        <div className="space-y-6">
          <ExecutiveSummary 
            data={report} 
            mode={mode} 
            onHighlight={addHighlight}
          />
          
          <DataAnalysis 
            data={report} 
            mode={mode}
            onHighlight={addHighlight}
          />
          
          <ClinicalInsights 
            data={report} 
            mode={mode}
            onHighlight={addHighlight}
          />
          
          <InterventionProtocol 
            data={report} 
            mode={mode}
            onHighlight={addHighlight}
          />
        </div>

        {/* Highlights panel for coaching mode */}
        {mode === 'coaching' && highlights.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-white">Session Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {highlights.map(highlight => (
                  <div 
                    key={highlight.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      highlight.color === 'yellow' ? 'bg-yellow-900/20 border-yellow-500' :
                      highlight.color === 'green' ? 'bg-green-900/20 border-green-500' :
                      highlight.color === 'blue' ? 'bg-blue-900/20 border-blue-500' :
                      'bg-red-900/20 border-red-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-white text-sm">{highlight.text}</p>
                      <button
                        onClick={() => removeHighlight(highlight.id)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      {highlight.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default PractitionerAnalysis 