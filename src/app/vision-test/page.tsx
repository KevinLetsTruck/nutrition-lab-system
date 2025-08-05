'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Image as ImageIcon, FileText, Loader2, CheckCircle } from 'lucide-react'

export default function VisionTest() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      setResult(null)
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setPreview('')
      }
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('clientName', 'Vision Test Client')
      formData.append('documentType', 'lab-report')

      const response = await fetch('/api/analyze-vision', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Claude Vision API Test</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Medical Document or Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  {file ? (
                    <div className="space-y-2">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-16 h-16 mx-auto text-blue-500" />
                      ) : (
                        <FileText className="w-16 h-16 mx-auto text-blue-500" />
                      )}
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-16 h-16 mx-auto text-gray-400" />
                      <p className="text-gray-600">
                        Click to upload PDF or image
                      </p>
                      <p className="text-xs text-gray-500">
                        Supports: PDF, PNG, JPG, JPEG
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {preview && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Preview:</h3>
                  <img 
                    src={preview} 
                    alt="Document preview" 
                    className="max-w-full h-auto max-h-96 mx-auto border rounded"
                  />
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with Claude Vision...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Analyze Document
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Vision Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">File Information:</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">File:</span> {result.metadata?.fileName}</p>
                    <p><span className="font-medium">Type:</span> {result.metadata?.fileType}</p>
                    <p><span className="font-medium">Size:</span> {((result.metadata?.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="font-medium mb-2">Analysis:</h3>
                  <div className="whitespace-pre-wrap bg-white p-4 border rounded">
                    {result.analysis}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}