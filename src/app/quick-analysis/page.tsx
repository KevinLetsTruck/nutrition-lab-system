'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, ChevronDown, ChevronUp, AlertTriangle, Activity } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TestResult {
  name: string
  value: string | number
  unit?: string
  referenceRange?: string
  status?: 'normal' | 'high' | 'low' | 'critical'
  notes?: string
}

interface AnalysisResult {
  id: string
  fileName: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  timestamp: string
  processingTime?: string
  reportType?: string
  confidence?: number
  summary?: string
  keyFindings?: string[]
  recommendations?: string[]
  analysis?: {
    patientInfo: any
    testResults: TestResult[]
    clinicalNotes: string
    abnormalFindings: TestResult[]
  }
  error?: string
  rawData?: any
}

export default function QuickAnalysisPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [radioShowMode, setRadioShowMode] = useState(false)
  const [callerName, setCallerName] = useState('')
  const [callerLocation, setCallerLocation] = useState('')
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    
    const newFiles = Array.from(selectedFiles).filter(file => 
      file.type === 'application/pdf' || 
      file.name.toLowerCase().endsWith('.pdf')
    )
    
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const toggleResultExpansion = (resultId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resultId)) {
        newSet.delete(resultId)
      } else {
        newSet.add(resultId)
      }
      return newSet
    })
  }

  const uploadAndAnalyze = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    const newResults: AnalysisResult[] = []

    // Initialize results for all files
    files.forEach((file, index) => {
      newResults.push({
        id: `file-${Date.now()}-${index}`,
        fileName: file.name,
        status: 'pending',
        timestamp: new Date().toISOString()
      })
    })

    setAnalysisResults(newResults)

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const resultId = newResults[i].id

      try {
        // Update status to processing
        setAnalysisResults(prev => 
          prev.map(result => 
            result.id === resultId 
              ? { ...result, status: 'processing' }
              : result
          )
        )

        // Create FormData with just the file
        const formData = new FormData()
        formData.append('file', file)

        // Use the new v2 endpoint that works with document API
        const analysisResponse = await fetch('/api/quick-analysis-v2', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        })

        if (!analysisResponse.ok) {
          const errorData = await analysisResponse.json()
          throw new Error(errorData.error || 'Analysis failed')
        }

        const analysisData = await analysisResponse.json()
        console.log('Analysis complete:', analysisData)

        // Update with successful analysis
        setAnalysisResults(prev => 
          prev.map(result => 
            result.id === resultId 
              ? { 
                  ...result, 
                  status: 'completed',
                  processingTime: analysisData.processingTime,
                  reportType: analysisData.reportType,
                  confidence: analysisData.confidence,
                  summary: analysisData.summary,
                  keyFindings: analysisData.keyFindings,
                  recommendations: analysisData.recommendations,
                  analysis: analysisData.analysis,
                  rawData: analysisData.rawData
                }
              : result
          )
        )

        // Auto-expand successful results
        setExpandedResults(prev => new Set([...prev, resultId]))

      } catch (error) {
        console.error(`Failed to analyze ${file.name}:`, error)
        
        // Update with error
        setAnalysisResults(prev => 
          prev.map(result => 
            result.id === resultId 
              ? { 
                  ...result, 
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Analysis failed'
                }
              : result
          )
        )
      }
    }

    setIsUploading(false)
    setFiles([]) // Clear files after processing
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-400" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'high':
        return <Badge className="bg-warning text-background">High</Badge>
      case 'low':
        return <Badge className="bg-accent-orange text-background">Low</Badge>
      case 'normal':
        return <Badge className="bg-success text-background">Normal</Badge>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text-primary">Quick Document Analysis</h1>
          <p className="text-foreground-secondary">
            Upload multiple documents for instant analysis and recommendations without creating client records.
          </p>
        </div>

        {/* Radio Show Mode Toggle */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={radioShowMode}
                    onChange={(e) => setRadioShowMode(e.target.checked)}
                    className="w-5 h-5 rounded text-primary border-border-strong"
                  />
                  <span className="text-lg font-medium">📻 Radio Show Mode</span>
                </label>
                <p className="text-sm text-foreground-muted mt-1">
                  Enable to track caller information for radio show analyses
                </p>
              </div>
              <Badge variant={radioShowMode ? "default" : "secondary"}>
                {radioShowMode ? 'ON' : 'OFF'}
              </Badge>
            </div>

          {radioShowMode && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground-secondary">Caller Name</label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="Enter caller's name"
                  className="w-full px-3 py-2 bg-input border-border-strong rounded-lg text-foreground placeholder:text-foreground-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground-secondary">Caller Location</label>
                <input
                  type="text"
                  value={callerLocation}
                  onChange={(e) => setCallerLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-3 py-2 bg-input border-border-strong rounded-lg text-foreground placeholder:text-foreground-muted"
                />
              </div>
            </div>
          )}
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="mb-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Upload Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/10' : 'border-border-strong bg-background-secondary'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-foreground-muted" />
              <p className="text-lg mb-2 text-foreground">
                Drag and drop PDF files here, or click to select
              </p>
              <p className="text-sm text-foreground-secondary mb-4">
                Supports multiple PDF files for batch analysis
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-primary text-foreground rounded-lg cursor-pointer hover:bg-primary-hover transition-colors"
              >
                Select Files
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-foreground">Selected Files ({files.length})</h3>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-background-secondary rounded border border-border"
                    >
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-foreground-muted" />
                        <span className="text-sm text-foreground">{file.name}</span>
                        <span className="text-xs text-foreground-secondary">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={uploadAndAnalyze}
                  disabled={isUploading}
                  className="mt-4 w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Analyze All Files'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysisResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
            
            {analysisResults.map((result) => (
              <Card key={result.id} className="overflow-hidden bg-card border-border hover:border-primary/30 transition-colors">
                <CardHeader 
                  className="cursor-pointer hover:bg-background-secondary transition-colors"
                  onClick={() => toggleResultExpansion(result.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h3 className="font-semibold text-foreground">{result.fileName}</h3>
                        <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                          {result.reportType && (
                            <Badge variant="outline">{result.reportType}</Badge>
                          )}
                          {result.processingTime && (
                            <span>Processed in {result.processingTime}</span>
                          )}
                          {result.confidence && (
                            <span>Confidence: {(result.confidence * 100).toFixed(0)}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {result.status === 'completed' && (
                        expandedResults.has(result.id) ? 
                          <ChevronUp className="w-5 h-5" /> : 
                          <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {result.status === 'completed' && expandedResults.has(result.id) && (
                  <CardContent className="border-t">
                    {/* Summary */}
                    {result.summary && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2 text-foreground">Summary</h4>
                        <p className="text-foreground-secondary">{result.summary}</p>
                      </div>
                    )}

                    {/* Key Findings */}
                    {result.keyFindings && result.keyFindings.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          Key Findings
                        </h4>
                        <ul className="space-y-1">
                          {result.keyFindings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-foreground-secondary">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Test Results */}
                    {result.analysis?.testResults && result.analysis.testResults.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Test Results</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background-secondary">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-foreground-secondary uppercase">Test</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-foreground-secondary uppercase">Value</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-foreground-secondary uppercase">Reference</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-foreground-secondary uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                              {result.analysis.testResults.map((test, idx) => (
                                <tr key={idx} className="hover:bg-background-secondary transition-colors">
                                  <td className="px-4 py-2 text-sm text-foreground">{test.name}</td>
                                  <td className="px-4 py-2 text-sm text-foreground">
                                    {test.value} {test.unit}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-foreground-secondary">{test.referenceRange}</td>
                                  <td className="px-4 py-2 text-sm">{getStatusBadge(test.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Abnormal Findings */}
                    {result.analysis?.abnormalFindings && result.analysis.abnormalFindings.length > 0 && (
                      <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-warning">
                          <AlertTriangle className="w-4 h-4" />
                          Abnormal Findings
                        </h4>
                        <div className="space-y-2">
                          {result.analysis.abnormalFindings.map((finding, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="font-medium">{finding.name}</span>
                              <div className="flex items-center gap-2">
                                <span>{finding.value} {finding.unit}</span>
                                {getStatusBadge(finding.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Notes */}
                    {result.analysis?.clinicalNotes && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2 text-foreground">Clinical Notes</h4>
                        <div className="bg-background-secondary p-4 rounded-lg border border-border">
                          <p className="text-sm whitespace-pre-wrap text-foreground-secondary">{result.analysis.clinicalNotes}</p>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {result.recommendations && result.recommendations.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2 text-foreground">Recommendations</h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span className="text-foreground-secondary">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Patient Info */}
                    {result.analysis?.patientInfo && Object.keys(result.analysis.patientInfo).length > 0 && (
                      <div className="mb-6 p-4 bg-background-secondary rounded-lg border border-border">
                        <h4 className="font-semibold mb-2 text-foreground">Patient Information</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(result.analysis.patientInfo).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium capitalize text-foreground-secondary">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                              <span className="text-foreground">{value as string}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}

                {result.status === 'failed' && (
                  <CardContent className="border-t">
                    <div className="text-red-600">
                      <p className="font-medium">Analysis Failed</p>
                      <p className="text-sm">{result.error}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}