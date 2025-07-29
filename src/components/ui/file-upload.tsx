import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  accept?: Record<string, string[]>
  maxSize?: number
  multiple?: boolean
  className?: string
}

export function FileUpload({
  onFileSelect,
  accept = {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  className
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles)
    onFileSelect(acceptedFiles)
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple
  })

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFileSelect(newFiles)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          fileRejections.length > 0 && 'border-red-500 bg-red-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-primary-600">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, PNG, JPG up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-red-800 mb-2">File upload errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                <strong>{file.name}</strong>: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Selected files:</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
