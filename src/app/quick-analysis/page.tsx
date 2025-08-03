'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Navigation from '@/components/Navigation'

interface AnalysisResult {
  id: string
  fileName: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  callerName?: string
  callerLocation?: string
  timestamp?: string
  analysis?: {
    summary: string
    recommendations: string[]
    keyFindings: string[]
    reportType: string
    detailedAnalysis?: any // For NutriQ detailed data
  }
  error?: string
}

export default function QuickAnalysisPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [radioShowMode, setRadioShowMode] = useState(false)
  const [callerName, setCallerName] = useState('')
  const [callerLocation, setCallerLocation] = useState('')
  const [showResults, setShowResults] = useState(false)

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
        callerName: radioShowMode ? callerName : undefined,
        callerLocation: radioShowMode ? callerLocation : undefined,
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

        // Create FormData for upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('quickAnalysis', 'true')

        // Upload file
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Upload failed')
        }

        const uploadData = await uploadResponse.json()
        
        console.log('Upload response:', uploadData)

        // Check if upload was successful and get the file path
        if (!uploadData.success || !uploadData.files || uploadData.files.length === 0) {
          throw new Error('Upload failed: ' + (uploadData.error || 'Unknown error'))
        }

        const uploadedFile = uploadData.files[0] // Get the first uploaded file
        console.log('Uploaded file data:', uploadedFile)

        // Analyze the uploaded file using dedicated quick-analysis endpoint
        const analysisResponse = await fetch('/api/quick-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filePath: uploadedFile.filePath,
            fileName: file.name,
            bucket: uploadedFile.bucket // Include bucket from upload response
          })
        })

        if (!analysisResponse.ok) {
          let errorMessage = 'Analysis failed'
          try {
            const errorData = await analysisResponse.json()
            console.error('Analysis error response:', errorData)
            errorMessage = errorData.error || errorData.details || errorMessage
          } catch (e) {
            console.error('Failed to parse error response:', e)
            errorMessage = `Analysis failed with status ${analysisResponse.status}`
          }
          throw new Error(errorMessage)
        }

        let analysisData
        try {
          analysisData = await analysisResponse.json()
        } catch (e) {
          console.error('Failed to parse analysis response:', e)
          throw new Error('Analysis completed but failed to parse response')
        }
        
        console.log('Analysis response:', analysisData)

        // Update with successful analysis - handle new API response structure
        let analysis = {
          summary: 'Analysis completed successfully.',
          recommendations: ['Review the detailed findings below.'],
          keyFindings: ['Document processed successfully.'],
          reportType: 'General Analysis',
          detailedAnalysis: null
        }

        // Handle the new API response structure
        if (analysisData.analyzedReport?.analyzedReport?.nutriqAnalysis) {
          const nutriqAnalysis = analysisData.analyzedReport.analyzedReport.nutriqAnalysis
          analysis = {
            summary: `NutriQ Analysis completed. Total Score: ${nutriqAnalysis.totalScore || 'N/A'}`,
            recommendations: nutriqAnalysis.overallRecommendations || ['Review the detailed findings below.'],
            keyFindings: nutriqAnalysis.priorityActions || ['Document processed successfully.'],
            reportType: analysisData.reportType || 'nutriq',
            detailedAnalysis: nutriqAnalysis
          }
        } else if (analysisData.analyzedReport?.nutriqAnalysis) {
          const nutriqAnalysis = analysisData.analyzedReport.nutriqAnalysis
          analysis = {
            summary: `NutriQ Analysis completed. Total Score: ${nutriqAnalysis.totalScore || 'N/A'}`,
            recommendations: nutriqAnalysis.overallRecommendations || ['Review the detailed findings below.'],
            keyFindings: nutriqAnalysis.priorityActions || ['Document processed successfully.'],
            reportType: analysisData.reportType || 'nutriq',
            detailedAnalysis: nutriqAnalysis
          }
        } else {
          // Fallback to old structure
          analysis = {
            summary: analysisData.summary || analysisData.analysis?.summary || 'Analysis completed successfully.',
            recommendations: analysisData.recommendations || analysisData.analysis?.recommendations || ['Review the detailed findings below.'],
            keyFindings: analysisData.keyFindings || analysisData.analysis?.keyFindings || ['Document processed successfully.'],
            reportType: analysisData.reportType || analysisData.analysis?.reportType || 'General Analysis',
            detailedAnalysis: null // No detailed analysis for fallback cases
          }
        }

        const completedResult = { 
          ...newResults[i],
          status: 'completed' as const,
          analysis
        }
        
        setAnalysisResults(prev => 
          prev.map(result => 
            result.id === resultId ? completedResult : result
          )
        )
        
        // Save to localStorage if in radio show mode
        if (radioShowMode && callerName) {
          const radioAnalysis = {
            id: resultId,
            caller_name: callerName,
            caller_location: callerLocation,
            file_name: file.name,
            analysis_results: completedResult.analysis,
            created_at: new Date().toISOString()
          }
          
          const existing = localStorage.getItem('radioShowAnalyses')
          const analyses = existing ? JSON.parse(existing) : []
          analyses.unshift(radioAnalysis)
          
          // Keep only the last 50 analyses
          if (analyses.length > 50) {
            analyses.splice(50)
          }
          
          localStorage.setItem('radioShowAnalyses', JSON.stringify(analyses))
        }

      } catch (error) {
        console.error('Error processing file:', error)
        
        // Update with error
        setAnalysisResults(prev => 
          prev.map(result => 
            result.id === resultId 
              ? { 
                  ...result, 
                  status: 'failed',
                  error: error instanceof Error ? error.message : 'Unknown error occurred'
                }
              : result
          )
        )
      }
    }

    setIsUploading(false)
    setShowResults(true)
    
    // Clear form if in radio show mode
    if (radioShowMode) {
      setFiles([])
      setCallerName('')
      setCallerLocation('')
    }
  }

  const downloadAnalysis = (result: AnalysisResult) => {
    if (!result.analysis) return

    let content = `
Quick Analysis Report
====================

File: ${result.fileName}
Report Type: ${result.analysis.reportType}

Summary:
${result.analysis.summary}

Key Findings:
${result.analysis.keyFindings.map((finding: string) => `• ${finding}`).join('\n')}

Recommendations:
${result.analysis.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

Generated: ${new Date().toLocaleString()}
    `.trim()

    // Add detailed NutriQ analysis if available
    if (result.analysis.reportType === 'nutriq' && result.analysis.detailedAnalysis) {
      const nutriq = result.analysis.detailedAnalysis
      content += `

DETAILED NUTRIQ ANALYSIS
========================

Total Score: ${nutriq.totalScore}

Body Systems Analysis:
${Object.entries(nutriq.bodySystems || {}).map(([system, data]: [string, any]) => `
${system.toUpperCase()}:
  Score: ${data.score}
  Issues: ${data.issues?.join(', ') || 'None identified'}
  Recommendations: ${data.recommendations?.join(', ') || 'None provided'}
`).join('\n')}

Follow-up Tests:
${nutriq.followUpTests?.map((test: string) => `• ${test}`).join('\n') || 'None recommended'}
      `
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.fileName.replace('.pdf', '')}_analysis.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Quick Document Analysis</h1>
              <p className="text-gray-400">
                Upload multiple documents for instant analysis and recommendations without creating client records.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setRadioShowMode(!radioShowMode)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  radioShowMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                📻 Radio Show Mode {radioShowMode ? 'ON' : 'OFF'}
              </button>
              {radioShowMode && (
                <a
                  href="/radio-analysis"
                  target="_blank"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📺 Open Analysis View
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Caller Information (Radio Show Mode) */}
        {radioShowMode && (
          <div className="bg-slate-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Caller Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Caller Name
                </label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  placeholder="Enter caller's name"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Caller Location
                </label>
                <input
                  type="text"
                  value={callerLocation}
                  onChange={(e) => setCallerLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Upload Documents</h2>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-400/10' 
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300 mb-2">
              Drag and drop PDF files here, or click to select
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Supports multiple PDF files for batch analysis
            </p>
            
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              Select Files
            </label>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-white">{file.name}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                onClick={uploadAndAnalyze}
                disabled={isUploading}
                className="mt-4 w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Files...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Analyze Documents
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Toggle Results View Button */}
        {analysisResults.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowResults(!showResults)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showResults ? 'Hide' : 'Show'} Results View
            </button>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResults.length > 0 && showResults && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Analysis Results
              {radioShowMode && analysisResults[0]?.callerName && (
                <span className="text-base font-normal text-gray-400 ml-4">
                  for {analysisResults[0].callerName} from {analysisResults[0].callerLocation}
                </span>
              )}
            </h2>
            
            <div className="space-y-4">
              {analysisResults.map((result) => (
                <div key={result.id} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-white font-medium">{result.fileName}</span>
                    </div>
                    
                    <div className="flex items-center">
                      {result.status === 'pending' && (
                        <div className="flex items-center text-yellow-400">
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          <span className="text-sm">Pending</span>
                        </div>
                      )}
                      {result.status === 'processing' && (
                        <div className="flex items-center text-blue-400">
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          <span className="text-sm">Processing</span>
                        </div>
                      )}
                      {result.status === 'completed' && (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Completed</span>
                        </div>
                      )}
                      {result.status === 'failed' && (
                        <div className="flex items-center text-red-400">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Failed</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {result.status === 'completed' && result.analysis && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Summary</h4>
                        <p className="text-gray-300 text-sm">{result.analysis.summary}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Key Findings</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {result.analysis.keyFindings.map((finding: string, index: number) => (
                            <li key={index}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {result.analysis.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Detailed NutriQ Analysis */}
                      {result.analysis.reportType === 'nutriq' && result.analysis.detailedAnalysis && (
                        <div className="border-t border-slate-600 pt-4">
                          <h4 className="text-white font-medium mb-3">Detailed Body Systems Analysis</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(result.analysis.detailedAnalysis.bodySystems || {}).map(([system, data]: [string, any]) => (
                              <div key={system} className="bg-slate-600 rounded-lg p-3">
                                <h5 className="text-white font-medium text-sm mb-2 capitalize">{system}</h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-300 text-xs">Score:</span>
                                    <span className={`text-sm font-medium ${
                                      data.score >= 70 ? 'text-red-400' : 
                                      data.score >= 50 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                      {data.score}/100
                                    </span>
                                  </div>
                                  {data.issues && data.issues.length > 0 && (
                                    <div>
                                      <span className="text-gray-300 text-xs">Issues:</span>
                                      <ul className="list-disc list-inside text-gray-300 text-xs mt-1">
                                        {data.issues.map((issue: string, index: number) => (
                                          <li key={index}>{issue}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {data.recommendations && data.recommendations.length > 0 && (
                                    <div>
                                      <span className="text-gray-300 text-xs">Recommendations:</span>
                                      <ul className="list-disc list-inside text-gray-300 text-xs mt-1">
                                        {data.recommendations.map((rec: string, index: number) => (
                                          <li key={index}>{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {result.analysis.detailedAnalysis.followUpTests && result.analysis.detailedAnalysis.followUpTests.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-white font-medium mb-2">Follow-up Tests</h5>
                              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                                {result.analysis.detailedAnalysis.followUpTests.map((test: string, index: number) => (
                                  <li key={index}>{test}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={() => downloadAnalysis(result)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Download Analysis
                      </button>
                    </div>
                  )}

                  {result.status === 'failed' && result.error && (
                    <div className="text-red-400 text-sm">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 