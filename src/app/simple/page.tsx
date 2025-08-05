'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SimpleAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setResult(null)
    }
  }

  const handleSubmit = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', 'auto')
      formData.append('clientName', 'Patient')

      const response = await fetch('/api/analyze-simple', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.result)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err: any) {
      setError('Failed to analyze document')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Simple Document Analyzer</h1>
      <p className="text-gray-600 mb-6">Upload any health document and get instant analysis</p>

      <Card className="p-6">
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Document
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.txt,.csv,.jpg,.png,.jpeg"
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Analyze Document'}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  ✓ {result.message}
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Document Info</h3>
                <p className="text-sm">File: {result.fileName}</p>
                <p className="text-sm">Size: {(result.fileSize / 1024).toFixed(1)} KB</p>
                <p className="text-sm">Extracted: {result.extractedTextLength} characters</p>
              </div>

              <div className="bg-white p-4 border rounded">
                <h3 className="font-semibold mb-2">Analysis</h3>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {result.analysis}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>This simple analyzer works with any document format.</p>
        <p>It will always provide results, even if text extraction is limited.</p>
      </div>
    </div>
  )
}