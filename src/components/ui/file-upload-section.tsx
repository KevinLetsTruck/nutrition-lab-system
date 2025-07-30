'use client'

import React, { useState } from 'react'
import { FileUpload } from './file-upload'
import { Button } from './button'
import { Loader2, CheckCircle, AlertCircle, File, X } from 'lucide-react'

interface UploadStatus {
  status: 'idle' | 'uploading' | 'success' | 'error'
  message: string
  analysisResult?: any
}

interface FileProgress {
  file: File
  status: 'pending' | 'uploading' | 'analyzing' | 'success' | 'error'
  message: string
  filename?: string
}

export function FileUploadSection() {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    status: 'idle',
    message: ''
  })
  const [clientInfo, setClientInfo] = useState({
    email: '',
    firstName: '',
    lastName: ''
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([])

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files)
    setFileProgress(files.map(file => ({
      file,
      status: 'pending',
      message: 'Ready to upload'
    })))
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setFileProgress(prev => prev.filter((_, i) => i !== index))
  }

  const processFiles = async () => {
    if (selectedFiles.length === 0) return

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
      message: `Processing ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}...`
    })

    const uploadedFiles: { filename: string; originalName: string }[] = []
    const analysisResults: any[] = []

    try {
      // Create FormData for all files
      const formData = new FormData()
      
      // Add all files to FormData
      selectedFiles.forEach(file => {
        formData.append('file', file)
      })
      
      // Add client information
      formData.append('clientEmail', clientInfo.email)
      formData.append('clientFirstName', clientInfo.firstName)
      formData.append('clientLastName', clientInfo.lastName)

      // Update all files to uploading status
      setFileProgress(prev => prev.map(fp => ({ ...fp, status: 'uploading', message: 'Uploading file...' })))

      // Upload all files in a single request
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(`Upload failed: ${errorData.error || errorData.details || 'Unknown error'}`)
      }

      const uploadResult = await uploadResponse.json()
      
      if (!uploadResult.success) {
        throw new Error(`Upload failed: ${uploadResult.error || 'Unknown error'}`)
      }

      console.log('Upload result:', uploadResult)

      // Update progress for uploaded files
      uploadResult.files.forEach((fileResult: any, index: number) => {
        setFileProgress(prev => prev.map((fp, i) => 
          i === index ? { ...fp, status: 'analyzing', message: 'Analyzing file...', filename: fileResult.filename } : fp
        ))
        uploadedFiles.push({
          filename: fileResult.filename,
          originalName: fileResult.originalName
        })
      })

      // Handle any upload errors
      if (uploadResult.errors && uploadResult.errors.length > 0) {
        console.warn('Some files failed to upload:', uploadResult.errors)
        uploadResult.errors.forEach((error: any, index: number) => {
          setFileProgress(prev => prev.map((fp, i) => 
            i === index ? { ...fp, status: 'error', message: error.error } : fp
          ))
        })
      }

      // Analyze each successfully uploaded file
      for (let i = 0; i < uploadResult.files.length; i++) {
        const fileResult = uploadResult.files[i]
        
        try {
          // Update progress for this file
          setFileProgress(prev => prev.map((fp, index) => 
            index === i ? { ...fp, status: 'analyzing', message: 'Analyzing file...' } : fp
          ))

          // Analyze the uploaded file
          const analyzeResponse = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              labReportId: fileResult.labReportId,  // Using labReportId instead of filename
              clientEmail: clientInfo.email,
              clientFirstName: clientInfo.firstName,
              clientLastName: clientInfo.lastName
            })
          })

          if (!analyzeResponse.ok) {
            const errorData = await analyzeResponse.json()
            throw new Error(`Analysis failed: ${errorData.details || 'Unknown error'}`)
          }

          const analysisResult = await analyzeResponse.json()
          analysisResults.push(analysisResult)

          // Update progress for this file
          setFileProgress(prev => prev.map((fp, index) => 
            index === i ? { ...fp, status: 'success', message: 'Analysis completed' } : fp
          ))
          
        } catch (error) {
          console.error('Analysis error for file:', fileResult.originalName, error)
          setFileProgress(prev => prev.map((fp, index) => 
            index === i ? { ...fp, status: 'error', message: error instanceof Error ? error.message : 'Analysis failed' } : fp
          ))
        }
      }

      // Check if we have any successful analyses
      if (analysisResults.length === 0) {
        throw new Error('No files were successfully analyzed')
      }

      // Combine all analysis results
      const combinedResult = {
        totalFiles: selectedFiles.length,
        successfulUploads: uploadResult.uploaded,
        failedUploads: uploadResult.failed,
        successfulAnalyses: analysisResults.length,
        files: uploadedFiles.map((file, index) => ({
          ...file,
          analysis: analysisResults[index]
        })),
        summary: generateCombinedSummary(analysisResults)
      }

      setUploadStatus({
        status: 'success',
        message: `Successfully processed ${analysisResults.length} of ${selectedFiles.length} files!`,
        analysisResult: combinedResult
      })

    } catch (error) {
      console.error('Upload/Analysis error:', error)
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      
      // Update all files to error status
      setFileProgress(prev => prev.map(fp => ({ ...fp, status: 'error', message: 'Upload failed' })))
    }
  }

  const generateCombinedSummary = (results: any[]) => {
    const reportTypes = results.map(r => r.analysisResult.reportType)
    const avgConfidence = results.reduce((sum, r) => sum + r.analysisResult.confidence, 0) / results.length
    
    return {
      totalReports: results.length,
      reportTypes: [...new Set(reportTypes)],
      averageConfidence: Math.round(avgConfidence),
      processingTime: results.reduce((sum, r) => sum + r.analysisResult.processingTime, 0)
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
      lastName: ''
    })
    setSelectedFiles([])
    setFileProgress([])
  }

  return (
    <div className="space-y-6">
      {/* Client Information Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Upload Lab Reports</h3>
        <FileUpload
          onFileSelect={handleFileSelect}
          accept={{
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg']
          }}
          maxSize={10 * 1024 * 1024} // 10MB
          multiple={true}
        />
      </div>

      {/* File Progress */}
      {fileProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white">File Progress:</h4>
          {fileProgress.map((progress, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg border border-dark-600"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-dark-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{progress.file.name}</p>
                  <p className="text-xs text-dark-400">
                    {(progress.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {progress.status === 'pending' && (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                  {progress.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 text-primary-400 animate-spin" />
                  )}
                  {progress.status === 'analyzing' && (
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  )}
                  {progress.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                  {progress.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-xs ${
                    progress.status === 'success' ? 'text-green-300' :
                    progress.status === 'error' ? 'text-red-300' :
                    progress.status === 'analyzing' ? 'text-blue-300' :
                    progress.status === 'uploading' ? 'text-primary-300' :
                    'text-gray-300'
                  }`}>
                    {progress.message}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-dark-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Process Button */}
      {selectedFiles.length > 0 && uploadStatus.status === 'idle' && (
        <Button
          onClick={processFiles}
          className="w-full"
          disabled={!clientInfo.email || !clientInfo.firstName || !clientInfo.lastName}
        >
          Process {selectedFiles.length} File{selectedFiles.length > 1 ? 's' : ''}
        </Button>
      )}

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
              <h4 className="font-medium text-white mb-2">Combined Analysis Summary</h4>
              <div className="text-sm text-dark-300 space-y-2">
                <p><strong>Total Files Processed:</strong> {uploadStatus.analysisResult.totalFiles}</p>
                <p><strong>Report Types:</strong> {uploadStatus.analysisResult.summary.reportTypes.join(', ')}</p>
                <p><strong>Average Confidence:</strong> {uploadStatus.analysisResult.summary.averageConfidence}%</p>
                <p><strong>Total Processing Time:</strong> {uploadStatus.analysisResult.summary.processingTime}ms</p>
                
                <div className="mt-3 space-y-2">
                  <p className="font-medium text-white">Individual Results:</p>
                  {uploadStatus.analysisResult.files.map((file: any, index: number) => (
                    <div key={index} className="p-2 bg-dark-800 rounded text-xs">
                      <p><strong>{file.originalName}:</strong> {file.analysis.analysisResult.reportType.toUpperCase()} ({file.analysis.analysisResult.confidence}% confidence)</p>
                    </div>
                  ))}
                </div>
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
          Upload More Reports
        </Button>
      )}
    </div>
  )
} 