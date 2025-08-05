'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUp, CheckCircle, AlertCircle, Clock, Download, RefreshCw } from 'lucide-react'

interface ProcessingResult {
  success: boolean
  report?: {
    patientInfo: any
    testResults: any[]
    clinicalNotes?: string
    metadata: {
      reportType: string
      processingMethod: string
      confidence: number
      pageCount: number
      warnings?: string[]
    }
  }
  reportId?: string
  stats?: {
    processingTime: number
    method: string
    confidence: number
  }
  error?: string
  details?: string
  errorType?: string
}

export default function TestPDFProcessor() {
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [clientId, setClientId] = useState('')
  const [reportType, setReportType] = useState<string>('')
  const [previousReports, setPreviousReports] = useState<any[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  })

  const processFile = async () => {
    if (!file) return

    setProcessing(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    if (clientId) formData.append('clientId', clientId)
    if (reportType) formData.append('reportType', reportType)

    try {
      const response = await fetch('/api/lab-reports/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult(data)

      // If successful, fetch updated reports list
      if (data.success) {
        fetchReports()
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Failed to connect to server'
      })
    } finally {
      setProcessing(false)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/lab-reports/upload?limit=5')
      const data = await response.json()
      if (data.reports) {
        setPreviousReports(data.reports)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    }
  }

  // Fetch reports on component mount
  useState(() => {
    fetchReports()
  })

  const getStatusColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case 'native': return 'default'
      case 'preprocessed': return 'secondary'
      case 'vision': return 'outline'
      default: return 'destructive'
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">PDF Lab Report Processor Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Lab Report</h2>
          
          <div className="space-y-4">
            {/* Optional fields */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Client ID (optional)
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter client ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Report Type (optional)
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Auto-detect</option>
                <option value="nutriq">NutriQ/NAQ</option>
                <option value="kbmo">KBMO Food Sensitivity</option>
                <option value="dutch">DUTCH Hormone</option>
                <option value="fit_test">FIT Test</option>
                <option value="stool_test">Stool Test</option>
                <option value="blood_test">Blood Test</option>
                <option value="general">General Lab Report</option>
              </select>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input {...getInputProps()} />
              <FileUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p>Drop the PDF here...</p>
              ) : (
                <div>
                  <p className="mb-2">Drag & drop a PDF lab report here</p>
                  <p className="text-sm text-gray-500">or click to select file</p>
                </div>
              )}
            </div>

            {file && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm text-gray-600">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <Button
              onClick={processFile}
              disabled={!file || processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process PDF'
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Processing Results</h2>
          
          {!result && !processing && (
            <div className="text-center text-gray-500 py-8">
              <Clock className="mx-auto h-12 w-12 mb-4" />
              <p>Upload a PDF to see results</p>
            </div>
          )}

          {processing && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Processing your PDF...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {result.success ? (
                <>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                      PDF processed successfully using {result.stats?.method} method
                    </AlertDescription>
                  </Alert>

                  {/* Processing Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">Processing Time</p>
                      <p className="font-semibold">
                        {result.stats?.processingTime 
                          ? `${(result.stats.processingTime / 1000).toFixed(2)}s`
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className={`font-semibold ${getStatusColor(result.stats?.confidence || 0)}`}>
                        {((result.stats?.confidence || 0) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Report Metadata */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Report Type:</span>
                      <Badge>{result.report?.metadata.reportType}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Processing Method:</span>
                      <Badge variant={getMethodBadgeVariant(result.report?.metadata.processingMethod || '')}>
                        {result.report?.metadata.processingMethod}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Pages:</span>
                      <span>{result.report?.metadata.pageCount}</span>
                    </div>
                  </div>

                  {result.report?.metadata.warnings && result.report.metadata.warnings.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Warnings</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {result.report.metadata.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Processing Failed</AlertTitle>
                  <AlertDescription>
                    <p>{result.error}</p>
                    {result.details && (
                      <p className="text-sm mt-2">{result.details}</p>
                    )}
                    {result.errorType && (
                      <p className="text-sm mt-1">Error type: {result.errorType}</p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Detailed Results Tabs */}
      {result?.success && result.report && (
        <Card className="mt-6 p-6">
          <Tabs defaultValue="patient">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="patient">Patient Info</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="patient" className="mt-4">
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                {JSON.stringify(result.report.patientInfo, null, 2)}
              </pre>
            </TabsContent>

            <TabsContent value="results" className="mt-4">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.report.testResults.map((test, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <p className="text-sm">
                          {test.value} {test.unit}
                          {test.referenceRange && (
                            <span className="text-gray-500"> (Ref: {test.referenceRange})</span>
                          )}
                        </p>
                      </div>
                      {test.status && (
                        <Badge 
                          variant={test.status === 'normal' ? 'secondary' : 'destructive'}
                        >
                          {test.status}
                        </Badge>
                      )}
                    </div>
                    {test.notes && (
                      <p className="text-sm text-gray-600 mt-1">{test.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap">
                  {result.report.clinicalNotes || 'No clinical notes available'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="mt-4">
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
                {JSON.stringify(result.report, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      {/* Previous Reports */}
      {previousReports.length > 0 && (
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
          <div className="space-y-2">
            {previousReports.map((report) => (
              <div key={report.id} className="border rounded-md p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{report.file_name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{report.report_type}</Badge>
                    <Badge variant={getMethodBadgeVariant(report.processing_method)}>
                      {report.processing_method}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}