'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ClientPage } from '@/components/ProtectedPage'
import { useAuth } from '@/lib/auth-context'

function LabUploadContent() {
  const { user } = useAuth()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean
    message?: string
    resultId?: string
  }>({})
  const router = useRouter()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    setUploadStatus({})
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    
    files.forEach((file) => {
      formData.append('files', file)
    })
    
    // Add client ID from auth context
    if (user?.id) {
      formData.append('clientId', user.id)
    }

    try {
      const response = await fetch('/api/lab-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus({
          success: true,
          message: `Successfully uploaded ${result.uploaded} file(s)`,
          resultId: result.resultId
        })
        
        // Redirect to results page after 2 seconds
        setTimeout(() => {
          router.push(`/lab-results/${result.resultId}`)
        }, 2000)
      } else {
        setUploadStatus({
          success: false,
          message: result.error || 'Upload failed'
        })
      }
    } catch (error) {
      setUploadStatus({
        success: false,
        message: 'Network error. Please try again.'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Upload Lab Results</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Drag & drop lab result files here</p>
              <p className="text-sm text-gray-500">or click to select files</p>
              <p className="text-xs text-gray-400 mt-2">
                Accepted: PDF, PNG, JPG, JPEG (max 10MB each, up to 5 files)
              </p>
            </div>
          )}
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Selected Files:</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center bg-gray-50 p-3 rounded">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm flex-1">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploadStatus.message && (
          <div className={`mt-6 p-4 rounded-lg flex items-start ${
            uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {uploadStatus.success ? (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <span>{uploadStatus.message}</span>
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => {
              setFiles([])
              setUploadStatus({})
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={uploading}
          >
            Clear
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload & Analyze'}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">What happens next?</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Your lab files will be securely uploaded and stored</li>
          <li>Our OCR system will extract text and data from the documents</li>
          <li>AI analysis will identify patterns and health markers</li>
          <li>You&apos;ll receive a comprehensive report with:
            <ul className="list-disc list-inside ml-6 mt-1">
              <li>Optimal vs standard range comparisons</li>
              <li>Truck driver specific considerations</li>
              <li>Functional medicine insights</li>
              <li>Personalized recommendations</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default function LabUploadPage() {
  return (
    <ClientPage>
      <LabUploadContent />
    </ClientPage>
  )
}
