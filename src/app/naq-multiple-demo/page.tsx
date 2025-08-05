'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, FileText, Upload, Loader2, Trash2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ComprehensiveNAQReportDisplay from '@/components/reports/ComprehensiveNAQReport'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import MultiDocumentComparison from '@/components/reports/MultiDocumentComparison'

export default function NAQMultipleDemoPage() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('combined')
  const [clientName, setClientName] = useState('Carole Corkadel')
  const [clientEmail, setClientEmail] = useState('carole@example.com')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
      setError(null)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please select at least one NAQ PDF file')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const formData = new FormData()
      
      // Add all files
      files.forEach(file => {
        formData.append('files', file)
      })
      
      // Add client data
      formData.append('clientName', clientName)
      formData.append('clientEmail', clientEmail)
      formData.append('reportDate', new Date().toISOString())

      const response = await fetch('/api/analyze-naq-multiple', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Analysis failed')
      }

      const data = await response.json()
      console.log('Multi-document analysis results:', data)
      setResults(data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze NAQ reports')
    } finally {
      setLoading(false)
    }
  }

  const renderCombinedAnalysis = () => {
    if (!results?.combinedReport) return null

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Combined Analysis Summary</CardTitle>
            <CardDescription>
              Aggregated insights from {results.individualReports.length} NAQ assessments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Executive Summary</h4>
              <p className="text-sm text-muted-foreground">
                {results.combinedReport.executiveSummary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Persistent Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {results.combinedReport.crossReportPatterns?.persistentPatterns?.map((pattern: string) => (
                  <Badge key={pattern} variant="destructive">{pattern}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Emerging Patterns</h4>
              <div className="flex flex-wrap gap-2">
                {results.combinedReport.crossReportPatterns?.emergingPatterns?.map((pattern: string) => (
                  <Badge key={pattern} variant="warning">{pattern}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Symptom Burden Trends</h4>
              {Object.entries(results.combinedReport.aggregatedSymptomBurden || {}).map(([system, data]: [string, any]) => (
                <div key={system} className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{system}</span>
                    <span className="text-sm text-muted-foreground">
                      Avg: {data.average.toFixed(1)} | Trend: {data.trend}
                    </span>
                  </div>
                  <Progress value={(data.average / 10) * 100} className="h-2" />
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Consolidated Root Causes</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {results.combinedReport.consolidatedRootCauses?.primaryCauses?.map((cause: string) => (
                  <li key={cause}>{cause}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderIndividualReports = () => {
    if (!results?.individualReports) return null

    return (
      <div className="space-y-6">
        {results.individualReports.map((report: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>Report {index + 1}</CardTitle>
              <CardDescription>
                {results.metadata.files[index]?.fileName || 'Unknown file'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComprehensiveNAQReportDisplay report={report} />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Multi-Document NAQ Analysis Demo</h1>
        <p className="text-muted-foreground">
          Upload multiple NAQ/NutriQ assessment PDFs to generate a comprehensive 
          cross-document functional medicine analysis
        </p>
      </div>

      {!results && (
        <Card>
          <CardHeader>
            <CardTitle>Upload NAQ Assessments</CardTitle>
            <CardDescription>
              Select multiple NAQ symptom burden questionnaires or assessment report PDFs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-email">Client Email</Label>
              <Input
                id="client-email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Enter client email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">NAQ PDF Files</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({files.length})</Label>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleAnalyze} 
              disabled={loading || files.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing {files.length} files...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze {files.length} NAQ Report{files.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Analysis Results</h2>
            <Button 
              variant="outline" 
              onClick={() => {
                setResults(null)
                setFiles([])
              }}
            >
              Start New Analysis
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{results.metadata.totalFiles}</p>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{results.metadata.successfulAnalyses}</p>
                  <p className="text-sm text-muted-foreground">Successful Analyses</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{results.uniquePatterns?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Unique Patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="combined">Combined Analysis</TabsTrigger>
              <TabsTrigger value="comparison">Visual Comparison</TabsTrigger>
              <TabsTrigger value="individual">Individual Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="combined" className="mt-6">
              {renderCombinedAnalysis()}
            </TabsContent>
            <TabsContent value="comparison" className="mt-6">
              <MultiDocumentComparison results={results} />
            </TabsContent>
            <TabsContent value="individual" className="mt-6">
              {renderIndividualReports()}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}