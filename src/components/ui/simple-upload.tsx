'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle, XCircle, Loader2, FileText, AlertCircle } from 'lucide-react'

export function SimpleUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [clientInfo, setClientInfo] = useState({
    email: '',
    firstName: '',
    lastName: ''
  })
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a PDF file')
        return
      }
      setFile(selectedFile)
      setError('')
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    if (!clientInfo.email) {
      setError('Please enter client email')
      return
    }

    setUploading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientEmail', clientInfo.email)
      formData.append('clientFirstName', clientInfo.firstName || 'Unknown')
      formData.append('clientLastName', clientInfo.lastName || 'Unknown')

      const response = await fetch('/api/upload-simple', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult(data)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || data.message || 'Upload failed')
        if (data.suggestion) {
          setError(error => error + '. ' + data.suggestion)
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Simple Document Upload (No AWS Required)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Client Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              value={clientInfo.email}
              onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={clientInfo.firstName}
                onChange={(e) => setClientInfo(prev => ({ ...prev, firstName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={clientInfo.lastName}
                onChange={(e) => setClientInfo(prev => ({ ...prev, lastName: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="file-upload">Lab Report PDF</Label>
          <div className="mt-2">
            <Input
              id="file-upload"
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {result && result.success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-800">Upload Successful!</p>
                <p className="text-sm text-green-700">Report Type: {result.reportType}</p>
                <p className="text-sm text-green-700">Extraction Method: {result.extractionMethod}</p>
                <p className="text-sm text-green-700">Report ID: {result.labReportId}</p>
              </div>
            </div>
          </div>
        )}

        {/* Partial Success Display */}
        {result && !result.success && result.labReportId && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800">Upload Complete, Analysis Failed</p>
                <p className="text-sm text-yellow-700">{result.message}</p>
                <p className="text-sm text-yellow-700">Report ID: {result.labReportId}</p>
                {result.suggestion && (
                  <p className="text-sm text-yellow-600 mt-2">{result.suggestion}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !clientInfo.email || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-medium">Instructions:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>This uploader works without AWS Textract</li>
            <li>Best results with text-based PDFs (not scanned images)</li>
            <li>Supports NutriQ, KBMO, DUTCH, and other lab reports</li>
            <li>Files are securely stored and analyzed automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}