'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAnalysisPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const testFile = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      // Test with a known file from today
      const response = await fetch('/api/debug-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucket: 'lab-files',
          path: '2025/08/02/NAQ-Questions-Answers-4_1754173779476_gf2dqlekeg7.pdf'
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Debug PDF Analysis</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test NAQ PDF Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testFile} disabled={loading}>
            {loading ? 'Testing...' : 'Test NAQ PDF'}
          </Button>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}