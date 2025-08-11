'use client'

import { useState, useEffect } from 'react'
import { Upload, CheckCircle, XCircle, AlertCircle, Cloud } from 'lucide-react'

interface S3Status {
  s3Connected: boolean
  bucket?: string
  region?: string
  message: string
}

export default function TestMedicalPage() {
  const [s3Status, setS3Status] = useState<S3Status | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any>(null)

  // Check S3 status on component mount
  useEffect(() => {
    checkS3Status()
  }, [])

  const checkS3Status = async () => {
    try {
      const response = await fetch('/api/medical/upload')
      const data = await response.json()
      setS3Status(data)
    } catch (error) {
      setS3Status({
        s3Connected: false,
        message: 'Failed to check S3 status'
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (!files.length) return

    setUploading(true)
    setResults(null)

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('isRadioShow', 'true')
      formData.append('source', 'test_page')

      const response = await fetch('/api/medical/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({
        success: false,
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#4ade80] mb-4">Medical Document System Test</h1>
          <p className="text-gray-300">Test S3 storage and document upload functionality</p>
        </div>

        {/* S3 Status Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-[#4ade80]" />
            <h2 className="text-xl font-semibold">S3 Storage Status</h2>
            <button 
              onClick={checkS3Status}
              className="ml-auto px-3 py-1 bg-[#4ade80] text-[#0f172a] rounded text-sm font-medium hover:bg-[#22c55e] transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {s3Status ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {s3Status.s3Connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={s3Status.s3Connected ? 'text-green-400' : 'text-red-400'}>
                  {s3Status.message}
                </span>
              </div>
              {s3Status.bucket && (
                <div className="text-sm text-gray-400">
                  Bucket: {s3Status.bucket} | Region: {s3Status.region}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-400">Checking S3 status...</span>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-[#4ade80]" />
            <h2 className="text-xl font-semibold">Document Upload Test</h2>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.heic,.webp"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4ade80] file:text-[#0f172a] hover:file:bg-[#22c55e] file:cursor-pointer cursor-pointer"
              />
              <p className="text-sm text-gray-400 mt-2">
                Supports: PDF, JPEG, PNG, TIFF, HEIC, WebP (max 10MB each, up to 10 files)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Selected Files:</h3>
                {files.map((file, index) => (
                  <div key={`${file.name}-${Date.now()}-${index}`} className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!files.length || uploading || !s3Status?.s3Connected}
              className="w-full bg-[#4ade80] text-[#0f172a] py-3 rounded-lg font-semibold hover:bg-[#22c55e] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Results</h2>
            <div className="space-y-4">
              {results.success ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>{results.message}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  <span>{results.error}</span>
                </div>
              )}

              {results.stats && (
                <div className="text-sm text-gray-400">
                  Total Time: {results.stats.totalTime}ms | 
                  Successful: {results.stats.successful} | 
                  Failed: {results.stats.failed}
                </div>
              )}

              {results.documents && results.documents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-green-400">Successfully Uploaded:</h3>
                  {results.documents.map((doc: any, index: number) => (
                    <div key={doc.id} className="bg-[#0f172a] p-3 rounded-lg text-sm">
                      <div className="font-medium">{doc.filename}</div>
                      <div className="text-gray-400">
                        ID: {doc.id} | Type: {doc.documentType} | 
                        Size: {(doc.size / 1024).toFixed(1)} KB
                        {doc.optimized && ' | Optimized'}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.errors && results.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-red-400">Upload Errors:</h3>
                  {results.errors.map((error: string, index: number) => (
                    <div key={index} className="bg-red-900/20 border border-red-500/20 p-3 rounded-lg text-sm text-red-300">
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}