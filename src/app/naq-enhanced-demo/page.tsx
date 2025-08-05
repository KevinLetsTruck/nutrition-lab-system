'use client'

import React, { useState } from 'react'
import { ComprehensiveNAQReportDisplay } from '@/components/reports/ComprehensiveNAQReport'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, FileText, CheckCircle } from 'lucide-react'

export default function NAQEnhancedDemoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [clientName, setClientName] = useState('Carole Corkadel')
  const [clientEmail, setClientEmail] = useState('carole@example.com')
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError('Please select a NAQ PDF file to analyze')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientName', clientName)
      formData.append('clientEmail', clientEmail)
      formData.append('reportDate', new Date().toISOString())
      
      const response = await fetch('/api/analyze-naq-enhanced', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const data = await response.json()
      setResult(data)
      
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze file')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enhanced NAQ Analysis Demo</h1>
        <p className="text-gray-600">
          Upload a NAQ/NutriQ assessment PDF to generate a comprehensive functional medicine report
        </p>
      </div>
      
      {!result ? (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload NAQ Assessment</CardTitle>
            <CardDescription>
              Select a NAQ symptom burden questionnaire or assessment report PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="file">NAQ PDF File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                />
              </div>
              
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Enter client email"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing NAQ Assessment...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Analyze NAQ Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Success Message */}
          <Alert className="max-w-2xl mx-auto">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Analysis Complete!</strong> Generated comprehensive functional medicine report 
              with {result.patterns?.length || 0} identified patterns.
            </AlertDescription>
          </Alert>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Patterns Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{result.patterns?.length || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.round((result.comprehensiveReport?.metadata?.confidence || 0) * 100)}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Priority Level</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold capitalize">
                  {result.patterns?.[0]?.interventionPriority || 'N/A'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Report Version</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{result.metadata?.reportVersion || '2.0'}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setResult(null)}
            >
              Analyze Another Report
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const dataStr = JSON.stringify(result, null, 2)
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
                const exportFileDefaultName = `naq-analysis-${Date.now()}.json`
                
                const linkElement = document.createElement('a')
                linkElement.setAttribute('href', dataUri)
                linkElement.setAttribute('download', exportFileDefaultName)
                linkElement.click()
              }}
            >
              Export JSON Data
            </Button>
          </div>
          
          {/* Display Comprehensive Report */}
          {result.comprehensiveReport && (
            <ComprehensiveNAQReportDisplay report={result.comprehensiveReport} />
          )}
          
          {/* Debug Info */}
          <details className="max-w-2xl mx-auto">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              View Raw Analysis Data
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}