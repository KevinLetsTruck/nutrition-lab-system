'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2, Image } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  convertPDFToImages, 
  isPDFConvertible, 
  getPDFInfo,
  type PDFImage 
} from '@/lib/pdf-to-images-client'

interface FileUploadSectionEnhancedProps {
  onAnalysisComplete?: (results: any[]) => void
}

export function FileUploadSectionEnhanced({ onAnalysisComplete }: FileUploadSectionEnhancedProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'analyzing' | 'complete' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [fileProgress, setFileProgress] = useState<Array<{
    name: string
    status: 'pending' | 'converting' | 'uploading' | 'analyzing' | 'success' | 'error'
    message?: string
  }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Client information - in production, get this from context/props
  const clientInfo = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'Patient'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type === 'application/pdf')
    
    if (validFiles.length !== files.length) {
      setErrorMessage('Only PDF files are supported')
    }
    
    setSelectedFiles(validFiles)
    setFileProgress(validFiles.map(file => ({
      name: file.name,
      status: 'pending'
    })))
  }

  const processFiles = async () => {
    if (selectedFiles.length === 0) return

    setUploadStatus('uploading')
    setErrorMessage('')
    const analysisResults = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      
      try {
        // Update progress for this file
        setFileProgress(prev => prev.map((fp, index) => 
          index === i ? { ...fp, status: 'converting', message: 'Converting PDF to images...' } : fp
        ))

        // Check if PDF is valid
        const isConvertible = await isPDFConvertible(file)
        if (!isConvertible) {
          throw new Error('Invalid PDF file')
        }

        // Get PDF info
        const pdfInfo = await getPDFInfo(file)
        console.log(`Processing PDF: ${file.name}, Pages: ${pdfInfo.numPages}`)

        // Convert PDF to images on client-side
        const images = await convertPDFToImages(file, {
          scale: 2.0,      // Good quality
          maxPages: 10,    // Limit to 10 pages
          imageFormat: 'image/jpeg',
          quality: 0.85    // Good quality, smaller size
        })

        console.log(`Converted ${images.length} pages to images`)

        // Update progress
        setFileProgress(prev => prev.map((fp, index) => 
          index === i ? { ...fp, status: 'uploading', message: 'Uploading for analysis...' } : fp
        ))

        // Prepare the upload data
        const uploadData = {
          fileName: file.name,
          fileType: 'pdf_images',
          images: images.map(img => ({
            pageNumber: img.pageNumber,
            base64: img.base64,
            width: img.width,
            height: img.height
          })),
          metadata: {
            originalFileName: file.name,
            pageCount: images.length,
            fileSize: file.size,
            convertedAt: new Date().toISOString()
          },
          clientEmail: clientInfo.email,
          clientFirstName: clientInfo.firstName,
          clientLastName: clientInfo.lastName
        }

        // Upload the converted images
        const uploadResponse = await fetch('/api/analyze-images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData)
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await uploadResponse.json()
        
        // Update progress
        setFileProgress(prev => prev.map((fp, index) => 
          index === i ? { ...fp, status: 'analyzing', message: 'Analyzing content...' } : fp
        ))

        // Add artificial delay to show analysis
        await new Promise(resolve => setTimeout(resolve, 2000))

        analysisResults.push(result)

        // Update progress for this file
        setFileProgress(prev => prev.map((fp, index) => 
          index === i ? { ...fp, status: 'success', message: 'Analysis complete' } : fp
        ))

      } catch (error) {
        console.error('Processing error:', error)
        setFileProgress(prev => prev.map((fp, index) => 
          index === i ? { 
            ...fp, 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Processing failed' 
          } : fp
        ))
      }

      // Update overall progress
      setProgress(((i + 1) / selectedFiles.length) * 100)
    }

    // Complete
    setUploadStatus('complete')
    if (onAnalysisComplete) {
      onAnalysisComplete(analysisResults)
    }

    // Reset after 3 seconds
    setTimeout(() => {
      setUploadStatus('idle')
      setSelectedFiles([])
      setFileProgress([])
      setProgress(0)
    }, 3000)
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setFileProgress(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* File Input Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Drop PDF files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports scanned documents and image-based PDFs
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Selected Files ({selectedFiles.length})</h3>
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded"
                    disabled={uploadStatus !== 'idle'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {uploadStatus !== 'idle' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing Files</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* File Progress Details */}
              <div className="space-y-2 mt-4">
                {fileProgress.map((fp, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    {fp.status === 'pending' && <Loader2 className="h-4 w-4 text-gray-400" />}
                    {fp.status === 'converting' && <Image className="h-4 w-4 text-blue-500 animate-pulse" />}
                    {fp.status === 'uploading' && <Upload className="h-4 w-4 text-blue-500 animate-pulse" />}
                    {fp.status === 'analyzing' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                    {fp.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {fp.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                    <span className={fp.status === 'error' ? 'text-red-600' : ''}>
                      {fp.name}: {fp.message || fp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={processFiles}
            disabled={selectedFiles.length === 0 || uploadStatus !== 'idle'}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {uploadStatus === 'idle' && (
              <>
                <Upload className="h-5 w-5" />
                <span>Analyze Documents</span>
              </>
            )}
            {uploadStatus === 'uploading' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            )}
            {uploadStatus === 'analyzing' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            )}
            {uploadStatus === 'complete' && (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Complete!</span>
              </>
            )}
          </button>

          {/* Info */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>✓ Supports scanned and image-based PDFs</p>
            <p>✓ Automatic text extraction from images</p>
            <p>✓ Processes up to 10 pages per document</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}