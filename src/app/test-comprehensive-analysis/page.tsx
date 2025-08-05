'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, Loader2 } from 'lucide-react'

export default function TestComprehensiveAnalysis() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [clientId, setClientId] = useState('')

  const testAnalysis = async () => {
    if (!clientId) {
      setError('Please enter a client ID')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/clients/${clientId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Error ${response.status}: ${data.error || 'Unknown error'}\n${data.details || ''}`)
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Test Comprehensive Analysis</h1>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Test Analysis Endpoint
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground-secondary">
                Client ID
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Enter client ID (e.g., 336ae9e9-dda3-477f-89d5-241df47b8745)"
                className="w-full px-3 py-2 bg-input border-border-strong rounded-lg text-foreground placeholder:text-foreground-muted"
              />
              <p className="text-xs text-foreground-muted mt-1">
                You can find client IDs on the /clients page
              </p>
            </div>

            <Button 
              onClick={testAnalysis}
              disabled={loading || !clientId}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Run Comprehensive Analysis
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded">
                <h3 className="font-semibold text-error mb-2">Error:</h3>
                <pre className="text-sm text-error/80 whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {result && (
              <div className="p-4 bg-success/10 border border-success/20 rounded">
                <h3 className="font-semibold text-success mb-2">Success!</h3>
                <div className="space-y-2 text-sm">
                  {result.analysis && (
                    <>
                      <p>✓ Analysis completed</p>
                      <p>✓ Root causes: {result.analysis.rootCauseAnalysis?.length || 0}</p>
                      <p>✓ Treatment phases: {result.analysis.treatmentPhases ? 'Generated' : 'None'}</p>
                    </>
                  )}
                  {result.artifacts && (
                    <>
                      <p>✓ Practitioner report: {result.artifacts.practitionerReport ? 'Generated' : 'Missing'}</p>
                      <p>✓ Client summary: {result.artifacts.clientSummary ? 'Generated' : 'Missing'}</p>
                      <p>✓ Protocol document: {result.artifacts.protocolDocument ? 'Generated' : 'Missing'}</p>
                    </>
                  )}
                  {result.supplementRecommendations && (
                    <p>✓ Supplement recommendations: Generated</p>
                  )}
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-foreground-secondary">View full response</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-60 p-2 bg-background rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-sm text-foreground-muted">
          <p>This tests the comprehensive analysis endpoint at:</p>
          <code className="bg-background-secondary px-2 py-1 rounded">/api/clients/[id]/analyze</code>
        </div>
      </div>
    </div>
  )
}