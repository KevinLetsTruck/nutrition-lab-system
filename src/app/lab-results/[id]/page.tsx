'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Pill,
  Apple,
  Heart
} from 'lucide-react'

interface LabResultData {
  id: string
  processingStatus: string
  labName: string
  collectionDate: string
  aiAnalysis: {
    summary: string
    keyFindings: string[]
    truckDriverConsiderations: string[]
    recommendations: {
      immediate: string[]
      shortTerm: string[]
      lifestyle: string[]
    }
  }
  labValues: Array<{
    testName: string
    value: number
    unit: string
    referenceRange: string
    flag: string | null
    isOptimal: boolean
    isTruckDriverOptimal: boolean
    testCatalog: {
      optimalRangeLow: number
      optimalRangeHigh: number
      clinicalSignificance: string
      truckDriverConsiderations: string
    }
  }>
  patterns: Array<{
    patternName: string
    patternCategory: string
    confidenceScore: number
    clinicalSignificance: string
    truckDriverImpact: string
    priorityLevel: string
  }>
  protocols: Array<{
    protocolType: string
    title: string
    description: string
    priority: string
    supplementProtocol: any
    specificRecommendations: string[]
    truckDriverAdaptations: string
  }>
}

export default function LabResultsPage() {
  const params = useParams()
  const [result, setResult] = useState<LabResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/lab-results/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch results')
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  useEffect(() => {
    // Poll for updates if still processing
    if (result?.processingStatus === 'pending' || result?.processingStatus === 'processing') {
      const interval = setInterval(() => {
        fetchResults()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [result?.processingStatus, fetchResults])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-lg">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!result) return null

  if (result.processingStatus === 'pending' || result.processingStatus === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg">Processing your lab results...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  const getValueColor = (value: any) => {
    if (!value.flag) return value.isOptimal ? 'text-green-600' : 'text-yellow-600'
    return value.flag === 'H' || value.flag === 'L' ? 'text-red-600' : 'text-gray-900'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lab Analysis Results</h1>
        <div className="flex items-center text-sm text-gray-600">
          <FileText className="h-4 w-4 mr-2" />
          <span>{result.labName} • Collected {new Date(result.collectionDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-red-500" />
          Clinical Summary
        </h2>
        <p className="text-gray-700 mb-4">{result.aiAnalysis.summary}</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Key Findings</h3>
            <ul className="space-y-1">
              {result.aiAnalysis.keyFindings.map((finding, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Truck Driver Considerations</h3>
            <ul className="space-y-1">
              {result.aiAnalysis.truckDriverConsiderations.map((consideration, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Detected Patterns */}
      {result.patterns.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Detected Health Patterns</h2>
          <div className="space-y-4">
            {result.patterns.map((pattern, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">
                    {pattern.patternName.replace(/_/g, ' ')}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(pattern.priorityLevel)}`}>
                    {pattern.priorityLevel} priority
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{pattern.clinicalSignificance}</p>
                <p className="text-sm text-orange-600">{pattern.truckDriverImpact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab Values */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Lab Values Analysis</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Test</th>
                <th className="text-center py-2">Result</th>
                <th className="text-center py-2">Reference</th>
                <th className="text-center py-2">Optimal</th>
                <th className="text-center py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.labValues.map((value, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-3">
                    <div>
                      <p className="font-medium">{value.testName}</p>
                      <p className="text-xs text-gray-500">{value.testCatalog.clinicalSignificance}</p>
                    </div>
                  </td>
                  <td className={`text-center py-3 font-semibold ${getValueColor(value)}`}>
                    {value.value} {value.unit}
                    {value.flag && (
                      <span className="ml-1">
                        {value.flag === 'H' ? <TrendingUp className="inline h-4 w-4" /> : 
                         value.flag === 'L' ? <TrendingDown className="inline h-4 w-4" /> : null}
                      </span>
                    )}
                  </td>
                  <td className="text-center py-3 text-sm">{value.referenceRange}</td>
                  <td className="text-center py-3 text-sm">
                    {value.testCatalog.optimalRangeLow}-{value.testCatalog.optimalRangeHigh} {value.unit}
                  </td>
                  <td className="text-center py-3">
                    {value.isOptimal ? (
                      <span className="text-green-600">Optimal</span>
                    ) : value.isTruckDriverOptimal ? (
                      <span className="text-yellow-600">Acceptable</span>
                    ) : (
                      <span className="text-red-600">Needs Attention</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protocols */}
      {result.protocols.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Treatment Protocols</h2>
          {result.protocols.map((protocol, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center">
                  {protocol.protocolType === 'supplement' && <Pill className="h-5 w-5 mr-2" />}
                  {protocol.protocolType === 'dietary' && <Apple className="h-5 w-5 mr-2" />}
                  {protocol.title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(protocol.priority)}`}>
                  {protocol.priority}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">{protocol.description}</p>
              
              {protocol.supplementProtocol && (
                <div className="bg-gray-50 rounded p-4 mb-3">
                  <h4 className="font-medium mb-2">Supplement Recommendations</h4>
                  {Object.entries(protocol.supplementProtocol).map(([phase, supplements]: [string, any]) => (
                    <div key={phase} className="mb-2">
                      <p className="text-sm font-medium capitalize">{phase}:</p>
                      <ul className="ml-4 text-sm">
                        {supplements.map((supp: any, sIdx: number) => (
                          <li key={sIdx}>
                            {supp.name} - {supp.dose} ({supp.timing})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-sm">
                <p className="font-medium mb-1">Specific Recommendations:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {protocol.specificRecommendations.map((rec, rIdx) => (
                    <li key={rIdx}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              {protocol.truckDriverAdaptations && (
                <p className="text-sm text-orange-600 mt-2">
                  <strong>Truck Driver Note:</strong> {protocol.truckDriverAdaptations}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Action Plan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-red-600">Immediate Actions</h3>
            <ul className="space-y-1">
              {result.aiAnalysis.recommendations.immediate.map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2 text-orange-600">Short Term (1-3 months)</h3>
            <ul className="space-y-1">
              {result.aiAnalysis.recommendations.shortTerm.map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2 text-green-600">Lifestyle Changes</h3>
            <ul className="space-y-1">
              {result.aiAnalysis.recommendations.lifestyle.map((rec, idx) => (
                <li key={idx} className="text-sm flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
