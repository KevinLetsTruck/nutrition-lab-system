'use client'

import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Navigation from '@/components/Navigation'

interface AnalysisResult {
  id: string
  fileName: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  analysis?: {
    summary: string
    recommendations: string[]
    keyFindings: string[]
    reportType: string
  }
  error?: string
}

export default function QuickAnalysisPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [dragActive, setDragActive] = useState(false)

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
        status: 'pending'
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

        // Analyze the uploaded file
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filePath: uploadedFile.filePath,
            fileName: file.name,
            quickAnalysis: true
          })
        })

        if (!analysisResponse.ok) {
          throw new Error('Analysis failed')
        }

        const analysisData = await analysisResponse.json()
        
        console.log('Analysis response:', analysisData)

        // Update with successful analysis
        setAnalysisResults(prev => 
          prev.map(result => 
            result.id === resultId 
              ? { 
                  ...result, 
                  status: 'completed',
                  analysis: {
                    summary: analysisData.summary || analysisData.analysis?.summary || 'Analysis completed successfully.',
                    recommendations: analysisData.recommendations || analysisData.analysis?.recommendations || ['Review the detailed findings below.'],
                    keyFindings: analysisData.keyFindings || analysisData.analysis?.keyFindings || ['Document processed successfully.'],
                    reportType: analysisData.reportType || analysisData.analysis?.reportType || 'General Analysis'
                  }
                }
              : result
          )
        )

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
  }

  const downloadAnalysis = (result: AnalysisResult) => {
    if (!result.analysis) return

    const content = `
Quick Analysis Report
====================

File: ${result.fileName}
Report Type: ${result.analysis.reportType}

Summary:
${result.analysis.summary}

Key Findings:
${result.analysis.keyFindings.map(finding => `• ${finding}`).join('\n')}

Recommendations:
${result.analysis.recommendations.map(rec => `• ${rec}`).join('\n')}

Generated: ${new Date().toLocaleString()}
    `.trim()

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
          <h1 className="text-3xl font-bold text-white mb-2">Quick Document Analysis</h1>
          <p className="text-gray-400">
            Upload multiple documents for instant analysis and recommendations without creating client records.
          </p>
        </div>

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

        {/* Analysis Results */}
        {analysisResults.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Analysis Results ({analysisResults.length})</h2>
            
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
                          {result.analysis.keyFindings.map((finding, index) => (
                            <li key={index}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                          {result.analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                      
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