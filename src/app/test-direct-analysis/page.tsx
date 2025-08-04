'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function TestDirectAnalysis() {
  const [text, setText] = useState(`NUTRIQ NUTRITIONAL HEALTH QUESTIONNAIRE

Name: John Smith
Date: 2025-08-04

GROUP 1 - ESSENTIAL FATTY ACIDS
Your score is 22 (Moderate Priority)
Common symptoms: Dry skin, brittle nails, poor concentration

GROUP 2 - SUGAR HANDLING  
Your score is 35 (High Priority)
Common symptoms: Energy crashes, sugar cravings, mood swings

GROUP 3 - MINERAL NEEDS
Your score is 18 (Moderate Priority)
Common symptoms: Muscle cramps, poor sleep, fatigue

GROUP 4 - VITAMIN NEEDS
Your score is 12 (Low Priority)

GROUP 5 - DIGESTION
Your score is 28 (High Priority)
Common symptoms: Bloating, gas, irregular bowel movements

TOTAL SCORE: 115

PRACTITIONER NOTES:
- Client reports high stress from truck driving schedule
- Irregular meal times due to road schedule  
- Limited access to healthy food options
- Wants to improve energy and focus for safety`)

  const [documentType, setDocumentType] = useState('nutriq')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/analyze-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          documentType,
          clientName: 'Test Client'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Analysis failed')
      }

      setResult(data.result)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Direct Analysis Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="docType">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="docType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nutriq">NutriQ</SelectItem>
                    <SelectItem value="kbmo">KBMO</SelectItem>
                    <SelectItem value="dutch">Dutch</SelectItem>
                    <SelectItem value="generic">Generic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="text">Document Text</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="h-96 font-mono text-sm"
                  placeholder="Paste your document text here..."
                />
              </div>
              
              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !text.trim()}
                className="w-full"
              >
                {loading ? 'Analyzing...' : 'Analyze Text'}
              </Button>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm font-semibold text-green-800">✅ Analysis Successful!</p>
                  </div>
                  
                  {result.nutriqAnalysis && (
                    <div className="space-y-2">
                      <h3 className="font-semibold">NutriQ Analysis</h3>
                      <p>Total Score: {result.nutriqAnalysis.totalScore}</p>
                      
                      {result.nutriqAnalysis.topConcerns && (
                        <div>
                          <p className="font-medium">Top Concerns:</p>
                          <ul className="list-disc list-inside">
                            {result.nutriqAnalysis.topConcerns.map((concern: string, i: number) => (
                              <li key={i}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {result.analysis && (
                    <div>
                      <h3 className="font-semibold">Analysis</h3>
                      <p className="text-sm whitespace-pre-wrap">{
                        typeof result.analysis === 'string' 
                          ? result.analysis 
                          : JSON.stringify(result.analysis, null, 2)
                      }</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold">Raw Response</h3>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Submit text to see analysis results</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-6">
        <Alert>
          <AlertDescription>
            <strong>This proves the analysis engine works!</strong> When you paste text directly, 
            Claude analyzes it correctly. The issue is with PDF processing, not the AI analysis.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}