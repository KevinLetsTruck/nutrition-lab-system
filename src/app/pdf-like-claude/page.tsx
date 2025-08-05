'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Upload, Loader2 } from 'lucide-react'

export default function PDFLikeClaude() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'application/pdf' || droppedFile.name.toLowerCase().endsWith('.pdf')) {
        setFile(droppedFile)
        setError('')
        setResult(null)
      } else {
        setError('Please upload a PDF file')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setResult(null)
    }
  }

  const analyzePDF = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Try multiple endpoints to find what works
      const endpoints = [
        { url: '/api/pdf-advanced-extract', name: 'Advanced Extraction' },
        { url: '/api/pdf-claude-binary', name: 'Binary Processing' },
        { url: '/api/claude-pdf', name: 'Standard Processing' },
        { url: '/api/pdf-to-claude-vision', name: 'Vision API' },
        { url: '/api/pdf-direct-to-claude', name: 'Direct Processing' }
      ]

      let successfulResponse = null
      const attempts: string[] = []

      for (const endpoint of endpoints) {
        try {
          console.log(`Trying ${endpoint.name}...`)
          attempts.push(`Attempting ${endpoint.name}...`)
          
          const response = await fetch(endpoint.url, {
            method: 'POST',
            body: formData
          })

          const data = await response.json()

          if (response.ok && (data.success || data.analysis)) {
            successfulResponse = { 
              ...data, 
              endpoint: endpoint.url,
              method: endpoint.name,
              attempts 
            }
            break
          } else {
            attempts.push(`${endpoint.name}: ${data.error || 'Failed'}`)
          }
        } catch (err: any) {
          console.log(`${endpoint.name} failed:`, err)
          attempts.push(`${endpoint.name}: ${err.message || 'Network error'}`)
        }
      }

      if (successfulResponse) {
        setResult(successfulResponse)
      } else {
        setError(`Unable to process this PDF. Attempts:\n${attempts.join('\n')}\n\nThis appears to be an image-based PDF that requires OCR.`)
      }

    } catch (err: any) {
      setError('Failed to analyze PDF. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF Analysis (Like Claude)</h1>
        <p className="text-gray-600">Upload your PDF just like you do with Claude</p>
      </div>

      <Card className="p-8">
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${file ? 'bg-green-50 border-green-300' : ''}
          `}
        >
          {file ? (
            <div>
              <FileText className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-semibold">{file.name}</p>
              <p className="text-sm text-gray-600">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setError('')
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div>
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">Drop your PDF here</p>
              <p className="text-sm text-gray-600 mb-4">or</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="inline-block">
                  <Button variant="outline">
                    Browse Files
                  </Button>
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Analyze Button */}
        {file && !result && (
          <Button
            onClick={analyzePDF}
            disabled={loading}
            className="w-full mt-6"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze PDF'
            )}
          </Button>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✓ Analysis complete using {result.method || 'standard'} method
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-gray-600">
              {result.method && (
                <p>Analysis method: {result.method}</p>
              )}
              {result.extractionMethod && (
                <p>Extraction: {result.extractionMethod}</p>
              )}
              {result.contentLength !== undefined && (
                <p>Content extracted: {result.contentLength} characters</p>
              )}
              {result.warning && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertDescription className="text-yellow-800">
                    ⚠️ {result.warning}
                  </AlertDescription>
                </Alert>
              )}
              {result.extractionAttempts && result.extractionAttempts.length > 0 && (
                <details className="cursor-pointer">
                  <summary className="text-blue-600 hover:text-blue-800">
                    View extraction details
                  </summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    {result.extractionAttempts.map((attempt: string, i: number) => (
                      <div key={i}>{attempt}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>

            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4 text-lg">Analysis Results</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans">
                  {result.analysis}
                </pre>
              </div>
            </div>

            {result.usage && (
              <div className="text-sm text-gray-600">
                <p>Tokens used: {result.usage.input_tokens + result.usage.output_tokens}</p>
              </div>
            )}

            <Button
              onClick={() => {
                setFile(null)
                setResult(null)
                setError('')
              }}
              variant="outline"
              className="w-full"
            >
              Analyze Another PDF
            </Button>
          </div>
        )}
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This interface mimics Claude&apos;s PDF upload functionality</p>
        <p>Just drag and drop or select your PDF file</p>
      </div>
    </div>
  )
}