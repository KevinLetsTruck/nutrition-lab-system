'use client'

import { useState, useCallback } from 'react'
import { Trash2, Upload, FileText, Image, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

interface FileWithPreview {
  file: File
  preview?: string
  id: string
}

interface UploadResult {
  fileName: string
  status: 'success' | 'error'
  documentId?: string
  error?: string
  details?: any
}

interface UploadResponse {
  success: boolean
  partialSuccess?: boolean
  message: string
  summary: {
    totalFiles: number
    successful: number
    failed: number
  }
  results: UploadResult[]
  testMode: boolean
  timestamp: string
}

export default function TestMedicalUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [response, setResponse] = useState<UploadResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string>('')
  const [isRadioShow, setIsRadioShow] = useState(false)

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    const newFiles: FileWithPreview[] = selectedFiles.map(file => {
      const fileWithPreview: FileWithPreview = {
        file,
        id: Math.random().toString(36).substr(2, 9)
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFiles(prev => 
            prev.map(f => 
              f.id === fileWithPreview.id 
                ? { ...f, preview: reader.result as string }
                : f
            )
          )
        }
        reader.readAsDataURL(file)
      }

      return fileWithPreview
    })

    setFiles(prev => [...prev, ...newFiles].slice(0, 10)) // Max 10 files
    
    // Reset input
    e.target.value = ''
  }, [])

  // Remove file from list
  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file')
      return
    }

    setUploading(true)
    setError(null)
    setResponse(null)

    const formData = new FormData()
    
    // Add all files
    files.forEach(({ file }) => {
      formData.append('files', file)
    })

    // Add optional fields
    if (clientId.trim()) {
      formData.append('clientId', clientId.trim())
    }
    formData.append('isRadioShow', isRadioShow.toString())

    try {
      // Add ?test=true to bypass auth
      const res = await fetch('/api/medical/upload?test=true', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`)
      }

      setResponse(data)
      console.log('Upload successful:', data)
      
      // Clear files on complete success
      if (data.success) {
        setFiles([])
      }
      
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // Get file icon
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />
    return <FileText className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Medical Document Upload Test</h1>
        
        {/* Test Mode Warning */}
        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-500 font-semibold">Test Mode Active</span>
          </div>
          <p className="text-sm text-yellow-400 mt-1">
            Authentication is bypassed for testing. Remove ?test=true in production.
          </p>
        </div>

        {/* Upload Options */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Options</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium mb-2">
                Client ID (optional)
              </label>
              <input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Leave empty for standalone upload"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="radioShow"
                type="checkbox"
                checked={isRadioShow}
                onChange={(e) => setIsRadioShow(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="radioShow" className="text-sm">
                Radio Show Upload (High Priority)
              </label>
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Files</h2>
          
          <div className="mb-4">
            <label className="block">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-400 mb-2">
                  Click to select files or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  PDF, JPG, PNG, TIFF (max 10MB each, up to 10 files)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.heic,.heif"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </label>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold mb-2">
                Selected Files ({files.length}/10)
              </h3>
              {files.map(({ file, preview, id }) => (
                <div
                  key={id}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => removeFile(id)}
                    className="p-1 hover:bg-gray-600 rounded"
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
            uploading || files.length === 0
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-900/50 border border-red-600 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-500 font-semibold">Error</span>
            </div>
            <p className="text-sm text-red-400 mt-1">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
            <div className={`border rounded-lg p-4 ${
              response.success 
                ? 'bg-green-900/50 border-green-600'
                : response.partialSuccess
                ? 'bg-yellow-900/50 border-yellow-600'
                : 'bg-red-900/50 border-red-600'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {response.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : response.partialSuccess ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-semibold">{response.message}</span>
              </div>
              <div className="text-sm text-gray-400">
                {response.summary.successful} succeeded, {response.summary.failed} failed
              </div>
            </div>

            {/* Individual Results */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Upload Results</h3>
              <div className="space-y-2">
                {response.results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.status === 'success'
                        ? 'bg-green-900/20 border-green-700'
                        : 'bg-red-900/20 border-red-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {result.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">
                          {result.fileName}
                        </span>
                      </div>
                      {result.documentId && (
                        <span className="text-xs text-gray-500">
                          ID: {result.documentId.slice(0, 8)}...
                        </span>
                      )}
                    </div>
                    
                    {result.error && (
                      <p className="text-xs text-red-400 mt-1">{result.error}</p>
                    )}
                    
                    {result.details && (
                      <div className="text-xs text-gray-400 mt-2">
                        <p>S3: {result.details.s3Uploaded ? '✓' : '✗'}</p>
                        <p>Queued: {result.details.queuedForProcessing ? '✓' : '✗'}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Response (for debugging) */}
            <details className="bg-gray-800 rounded-lg p-4">
              <summary className="cursor-pointer font-semibold mb-2">
                Raw Response (Debug)
              </summary>
              <pre className="text-xs overflow-auto bg-gray-900 p-3 rounded">
                {JSON.stringify(response, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}