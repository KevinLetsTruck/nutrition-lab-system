'use client'

import React, { useState } from 'react'
import { FileUpload } from './file-upload'
import { Button } from './button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error'
  message: string
  analysisResult?: any
}

export function FileUploadSection() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: ''
  })
  const [clientInfo, setClientInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  })

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return

    const file = files[0]
    
    // Validate file type
    if (!file.type.includes('pdf')) {
      setUploadStatus({
        status: 'error',
        message: 'Please upload a PDF file'
      })
      return
    }

    // Validate client info
    if (!clientInfo.email || !clientInfo.firstName || !clientInfo.lastName) {
      setUploadStatus({
        status: 'error',
        message: 'Please fill in all required client information'
      })
      return
    }

    setUploadStatus({
      status: 'uploading',
      message: 'Uploading and analyzing your lab report...'
    })

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientEmail', clientInfo.email)
      formData.append('clientFirstName', clientInfo.firstName)
      formData.append('clientLastName', clientInfo.lastName)
      if (clientInfo.dateOfBirth) {
        formData.append('clientDateOfBirth', clientInfo.dateOfBirth)
      }

      // Upload file first
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('File upload failed')
      }

      const uploadResult = await uploadResponse.json()
      
      // Now analyze the uploaded file
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: uploadResult.filename,
          clientEmail: clientInfo.email,
          clientFirstName: clientInfo.firstName,
          clientLastName: clientInfo.lastName,
          clientDateOfBirth: clientInfo.dateOfBirth
        })
      })

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json()
        console.log('Analysis error details:', errorData)
        
        if (errorData.validationDetails) {
          throw new Error(`Analysis validation failed: ${errorData.validationDetails.join(', ')}`)
        } else {
          throw new Error(errorData.details || 'Analysis failed')
        }
      }

      const analysisResult = await analyzeResponse.json()

      setUploadStatus({
        status: 'success',
        message: 'Analysis completed successfully!',
        analysisResult: analysisResult
      })

    } catch (error) {
      console.error('Upload/Analysis error:', error)
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    }
  }

  const resetForm = () => {
    setUploadStatus({
      status: 'idle',
      message: ''
    })
    setClientInfo({
      email: '',
      firstName: '',
      lastName: '',
      dateOfBirth: ''
    })
  }

  return (
    <div className="space-y-6">
      {/* Client Information Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={clientInfo.email}
              onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={clientInfo.firstName}
              onChange={(e) => setClientInfo(prev => ({ ...prev, firstName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={clientInfo.lastName}
              onChange={(e) => setClientInfo(prev => ({ ...prev, lastName: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={clientInfo.dateOfBirth}
              onChange={(e) => setClientInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Upload Lab Report</h3>
        <FileUpload
          onFileSelect={handleFileSelect}
          accept={{
            'application/pdf': ['.pdf']
          }}
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>

            {/* Status Display */}
      {uploadStatus.status !== 'idle' && (
        <div className={`p-4 rounded-lg border ${
          uploadStatus.status === 'success' ? 'bg-green-500/10 border-green-500/20' :
          uploadStatus.status === 'error' ? 'bg-red-500/10 border-red-500/20' :
          'bg-primary-500/10 border-primary-500/20'
        }`}>
          <div className="flex items-center space-x-3">
            {uploadStatus.status === 'uploading' && (
              <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />
            )}
            {uploadStatus.status === 'success' && (
              <CheckCircle className="h-5 w-5 text-green-400" />
            )}
            {uploadStatus.status === 'error' && (
              <AlertCircle className="h-5 w-5 text-red-400" />
            )}
            <p className={`text-sm font-medium ${
              uploadStatus.status === 'success' ? 'text-green-300' :
              uploadStatus.status === 'error' ? 'text-red-300' :
              'text-primary-300'
            }`}>
              {uploadStatus.message}
            </p>
          </div>
          
          {uploadStatus.status === 'success' && uploadStatus.analysisResult && (
            <div className="mt-3 p-3 bg-dark-700 rounded-lg border border-dark-600">
              <h4 className="font-medium text-white mb-2">Analysis Summary</h4>
              <div className="text-sm text-dark-300">
                <p><strong>Report Type:</strong> {uploadStatus.analysisResult.analysisResult.reportType.toUpperCase()}</p>
                <p><strong>Confidence:</strong> {uploadStatus.analysisResult.analysisResult.confidence}%</p>
                <p><strong>Processing Time:</strong> {uploadStatus.analysisResult.analysisResult.processingTime}ms</p>
                {uploadStatus.analysisResult.analysisResult.summary && (
                  <div className="mt-2 p-2 bg-dark-800 rounded">
                    <p className="font-medium text-white">Summary:</p>
                    <pre className="text-xs text-dark-300 whitespace-pre-wrap">{uploadStatus.analysisResult.analysisResult.summary}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Button */}
      {uploadStatus.status === 'success' && (
        <Button
          onClick={resetForm}
          variant="outline"
          className="w-full"
        >
          Upload Another Report
        </Button>
      )}
    </div>
  )
} 