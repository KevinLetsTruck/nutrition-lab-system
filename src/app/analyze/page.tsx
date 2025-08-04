'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { FileText, Upload, Type, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function UniversalAnalyzer() {
  const [mode, setMode] = useState<'upload' | 'text' | 'url'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [documentType, setDocumentType] = useState('auto')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [statusMessages, setStatusMessages] = useState<string[]>([])

  const addStatus = (message: string) => {
    setStatusMessages(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setError('')
      addStatus(`File selected: ${acceptedFiles[0].name}`)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'text/*': ['.txt', '.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(0)
    setStatusMessages([])

    try {
      let requestBody: any
      let isFormData = false

      if (mode === 'upload' && file) {
        addStatus('Preparing file upload...')
        setProgress(20)
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentType', documentType)
        formData.append('clientName', clientName || 'Test Client')
        
        requestBody = formData
        isFormData = true
        
      } else if (mode === 'text' && text) {
        addStatus('Preparing text analysis...')
        setProgress(20)
        
        requestBody = JSON.stringify({
          text,
          documentType,
          clientName: clientName || 'Test Client'
        })
        
      } else if (mode === 'url' && url) {
        addStatus('URL mode not yet implemented')
        throw new Error('URL analysis coming soon')
      } else {
        throw new Error('No input provided')
      }

      addStatus('Sending to analysis server...')
      setProgress(40)

      const response = await fetch('/api/analyze-universal', {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: requestBody
      })

      addStatus('Received response from server')
      setProgress(60)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Analysis failed')
      }

      addStatus('Analysis completed successfully!')
      setProgress(100)
      
      setResult(data.result)
      
      // Add processing details to status
      if (data.result.processingDetails) {
        const details = data.result.processingDetails
        addStatus(`Format: ${details.format}, Method: ${details.extractionMethod}`)
        if (details.warnings?.length > 0) {
          details.warnings.forEach((w: string) => addStatus(`Warning: ${w}`))
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to analyze')
      addStatus(`Error: ${err.message}`)
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const canAnalyze = () => {
    if (mode === 'upload') return !!file
    if (mode === 'text') return !!text.trim()
    if (mode === 'url') return !!url.trim()
    return false
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Universal Document Analyzer</h1>
        <p className="text-gray-600">
          Analyze any health document - PDFs, images, text, or spreadsheets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Document Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={mode} onValueChange={(v: any) => setMode(v)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="text">
                    <Type className="w-4 h-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="url" disabled>
                    <FileText className="w-4 h-4 mr-2" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <div>
                        <FileText className="w-12 h-12 mx-auto mb-2 text-green-600" />
                        <p className="font-semibold">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Drag & drop a file here, or click to select</p>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF, Images, Excel, CSV, Text files
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your document text here..."
                    className="h-64 font-mono text-sm"
                  />
                  <p className="text-sm text-gray-500">
                    Paste lab results, questionnaire answers, or any health document text
                  </p>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/document.pdf"
                    className="w-full p-2 border rounded"
                    disabled
                  />
                  <p className="text-sm text-gray-500">
                    Coming soon: Analyze documents from URLs
                  </p>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="docType">Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger id="docType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="nutriq">NutriQ / NAQ</SelectItem>
                      <SelectItem value="kbmo">KBMO Food Sensitivity</SelectItem>
                      <SelectItem value="dutch">Dutch Hormone Test</SelectItem>
                      <SelectItem value="fit_test">FIT Test</SelectItem>
                      <SelectItem value="cgm">CGM Data</SelectItem>
                      <SelectItem value="generic">Generic Lab Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clientName">Client Name (Optional)</Label>
                  <input
                    id="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={loading || !canAnalyze()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Document'
                )}
              </Button>

              {loading && (
                <Progress value={progress} className="w-full" />
              )}

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Status Messages */}
          {statusMessages.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Processing Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs space-y-1 font-mono max-h-32 overflow-y-auto">
                  {statusMessages.map((msg, i) => (
                    <div key={i} className="text-gray-600">{msg}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Analysis completed successfully!
                    </AlertDescription>
                  </Alert>

                  {/* Processing Details */}
                  {result.processingDetails && (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p><strong>Format:</strong> {result.processingDetails.format}</p>
                      <p><strong>Extraction:</strong> {result.processingDetails.extractionMethod}</p>
                      <p><strong>Confidence:</strong> {(result.processingDetails.confidence * 100).toFixed(0)}%</p>
                      <p><strong>Time:</strong> {result.processingDetails.totalTime}ms</p>
                    </div>
                  )}

                  {/* Main Analysis */}
                  {result.analysis && (
                    <div>
                      <h3 className="font-semibold mb-2">Analysis</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{
                          typeof result.analysis === 'string' 
                            ? result.analysis 
                            : JSON.stringify(result.analysis, null, 2)
                        }</p>
                      </div>
                    </div>
                  )}

                  {/* Structured Data */}
                  {(result.nutriqAnalysis || result.recommendations) && (
                    <div className="space-y-3">
                      {result.nutriqAnalysis?.topConcerns && (
                        <div>
                          <h4 className="font-medium">Top Concerns</h4>
                          <ul className="list-disc list-inside text-sm">
                            {result.nutriqAnalysis.topConcerns.map((concern: string, i: number) => (
                              <li key={i}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations && (
                        <div>
                          <h4 className="font-medium">Recommendations</h4>
                          {Object.entries(result.recommendations).map(([key, items]: [string, any]) => (
                            <div key={key} className="mt-2">
                              <p className="text-sm font-medium capitalize">{key}:</p>
                              <ul className="list-disc list-inside text-sm">
                                {Array.isArray(items) && items.map((item: string, i: number) => (
                                  <li key={i}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Raw Data Toggle */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-600">
                      View Raw Response
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Upload a document or paste text to see analysis results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}