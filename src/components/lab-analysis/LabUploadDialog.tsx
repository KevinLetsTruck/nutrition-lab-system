'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LabUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUploadComplete?: () => void
  clientId?: string
}

interface UploadFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  progress?: number
}

export default function LabUploadDialog({
  open,
  onOpenChange,
  onUploadComplete,
  clientId: providedClientId
}: LabUploadDialogProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [clientId, setClientId] = useState(providedClientId || '')
  const [clients, setClients] = useState<any[]>([])
  const [loadingClients, setLoadingClients] = useState(false)

  // Load clients when dialog opens
  useState(() => {
    if (open && !providedClientId) {
      loadClients()
    }
  })

  const loadClients = async () => {
    setLoadingClients(true)
    try {
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data.data || [])
    } catch (error) {
      console.error('Failed to load clients:', error)
    } finally {
      setLoadingClients(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending' as const
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    if (!clientId) {
      alert('Please select a client')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('client_id', clientId)
      
      files.forEach(uploadFile => {
        formData.append('files', uploadFile.file)
      })

      // Update all files to uploading status
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading', progress: 0 })))

      const response = await fetch('/api/lab-analysis/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        // Update file statuses based on results
        setFiles(prev => prev.map((f, index) => {
          const uploadResult = result.results[index]
          return {
            ...f,
            status: uploadResult.success ? 'success' : 'error',
            error: uploadResult.error,
            progress: 100
          }
        }))

        // Show success for 2 seconds then close
        setTimeout(() => {
          onUploadComplete?.()
          onOpenChange(false)
          setFiles([])
        }, 2000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      })))
    } finally {
      setUploading(false)
    }
  }

  const hasErrors = files.some(f => f.status === 'error')
  const allSuccess = files.length > 0 && files.every(f => f.status === 'success')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Lab Results</DialogTitle>
          <DialogDescription>
            Upload PDF or image files of lab results for AI-powered functional medicine analysis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Selection */}
          {!providedClientId && (
            <div className="space-y-2">
              <Label htmlFor="client">Select Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingClients && (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  )}
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name} - {client.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              uploading && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="font-medium">Drag & drop lab PDFs or images here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  or click to select files (PDF, PNG, JPG - max 10MB)
                </p>
              </div>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.map(uploadFile => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{uploadFile.file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(uploadFile.file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="w-20" />
                      )}
                      {uploadFile.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {uploadFile.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      {uploadFile.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Messages */}
          {hasErrors && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some files failed to upload. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {allSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All files uploaded successfully! Processing will begin shortly.
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={files.length === 0 || uploading || !clientId || allSuccess}
            >
              {uploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}