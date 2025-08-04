'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Upload } from 'lucide-react'

export default function TestUnifiedAnalysisPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Test Claude connection
  const testConnection = async () => {
    setConnectionStatus('loading')
    setConnectionResult(null)

    try {
      const response = await fetch('/api/test-claude-connection')
      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus('success')
        setConnectionResult(data)
      } else {
        setConnectionStatus('error')
        setConnectionResult(data)
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionResult({
        error: error instanceof Error ? error.message : 'Connection test failed'
      })
    }
  }

  // Test unified analysis
  const testAnalysis = async () => {
    if (!selectedFile) {
      alert('Please select a file first')
      return
    }

    setAnalysisStatus('loading')
    setAnalysisResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', 'document')

      const response = await fetch('/api/analyze-unified', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setAnalysisStatus('success')
        setAnalysisResult(data)
      } else {
        setAnalysisStatus('error')
        setAnalysisResult(data)
      }
    } catch (error) {
      setAnalysisStatus('error')
      setAnalysisResult({
        error: error instanceof Error ? error.message : 'Analysis test failed'
      })
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Unified Analysis System Test</h1>

      {/* Claude Connection Test */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Step 1: Test Claude API Connection</CardTitle>
          <CardDescription>
            Verify that the ANTHROPIC_API_KEY is properly configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={testConnection}
            disabled={connectionStatus === 'loading'}
          >
            {connectionStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection
          </Button>

          {connectionResult && (
            <div className="mt-4">
              {connectionStatus === 'success' ? (
                <Alert className="border-green-500">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription>
                    <div className="font-semibold text-green-700">Connection Successful!</div>
                    <div className="mt-2 text-sm">
                      <div>Model: {connectionResult.model}</div>
                      <div>API Key Length: {connectionResult.apiKeyInfo?.length}</div>
                      <div>Response: {JSON.stringify(connectionResult.response)}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-500">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription>
                    <div className="font-semibold text-red-700">Connection Failed</div>
                    <div className="mt-2 text-sm">
                      <div>Error Type: {connectionResult.errorType}</div>
                      <div>Error: {connectionResult.error}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unified Analysis Test */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Test Unified Analysis</CardTitle>
          <CardDescription>
            Upload a document to test the new analysis system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              <Button 
                onClick={testAnalysis}
                disabled={!selectedFile || analysisStatus === 'loading'}
              >
                {analysisStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Upload className="mr-2 h-4 w-4" />
                Analyze
              </Button>
            </div>

            {selectedFile && (
              <div className="text-sm text-gray-600">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}

            {analysisResult && (
              <div className="mt-4">
                {analysisStatus === 'success' ? (
                  <Alert className="border-green-500">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      <div className="font-semibold text-green-700">Analysis Successful!</div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>Analysis ID: {analysisResult.analysisId}</div>
                        <div>Document Type: {analysisResult.documentType}</div>
                        <div>Processing Time: {analysisResult.processingTime}ms</div>
                        {analysisResult.warnings && (
                          <div>Warnings: {analysisResult.warnings.join(', ')}</div>
                        )}
                      </div>
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium">View Full Results</summary>
                        <pre className="mt-2 text-xs overflow-auto max-h-96 bg-gray-50 p-2 rounded">
                          {JSON.stringify(analysisResult, null, 2)}
                        </pre>
                      </details>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-red-500">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription>
                      <div className="font-semibold text-red-700">Analysis Failed</div>
                      <div className="mt-2 space-y-1 text-sm">
                        <div>Error: {analysisResult.error}</div>
                        {analysisResult.errors && (
                          <div>Details: {analysisResult.errors.join(', ')}</div>
                        )}
                        {analysisResult.suggestion && (
                          <div className="mt-2 italic">{analysisResult.suggestion}</div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Claude API:</span>
              <span className={connectionStatus === 'success' ? 'text-green-600' : 'text-gray-400'}>
                {connectionStatus === 'success' ? 'Connected' : 'Not tested'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Document Processing:</span>
              <span className={analysisStatus === 'success' ? 'text-green-600' : 'text-gray-400'}>
                {analysisStatus === 'success' ? 'Working' : 'Not tested'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Analysis Engine:</span>
              <span className="text-blue-600">Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}