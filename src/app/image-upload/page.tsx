'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Image, Upload, Loader2, FileText } from 'lucide-react'

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(newFiles)
      setError('')
      setResult(null)
    }
  }

  const analyzeImages = async () => {
    if (files.length === 0) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // For now, send to the working endpoint with a note about images
      const formData = new FormData()
      formData.append('file', files[0]) // Start with first file
      
      const response = await fetch('/api/analyze-simple', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          ...data,
          note: 'Image analysis requires Claude Vision API. For now, please use the text extraction method below.'
        })
      } else {
        throw new Error(data.error || 'Analysis failed')
      }

    } catch (err: any) {
      setError(err.message || 'Failed to analyze images')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Upload for Scanned Documents</h1>
        <p className="text-gray-600">Convert your scanned PDFs to images first, then upload here</p>
      </div>

      <Card className="p-8 mb-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Step 1: Convert PDF to Images</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Recommended converters:</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.ilovepdf.com/pdf_to_jpg" target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:underline">
                  iLovePDF - PDF to JPG
                </a> (Free, no signup)
              </li>
              <li>
                <a href="https://smallpdf.com/pdf-to-jpg" target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:underline">
                  SmallPDF - PDF to Image
                </a> (2 free per day)
              </li>
              <li>
                <a href="https://www.adobe.com/acrobat/online/pdf-to-jpg.html" target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:underline">
                  Adobe - PDF to Image
                </a> (Free with limits)
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card className="p-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Step 2: Upload Images</h2>
        
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-4">Select converted images</p>
          
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <span className="inline-block">
              <Button variant="outline" type="button" onClick={(e) => e.preventDefault()}>
                Choose Images
              </Button>
            </span>
          </label>
          
          {files.length > 0 && (
            <div className="mt-4 text-sm">
              <p className="font-semibold">{files.length} image(s) selected:</p>
              {files.map((file, i) => (
                <p key={i} className="text-gray-600">{file.name}</p>
              ))}
            </div>
          )}
        </div>

        {files.length > 0 && (
          <Button
            onClick={analyzeImages}
            disabled={loading}
            className="w-full mt-4"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Images'
            )}
          </Button>
        )}
      </Card>

      <Card className="p-8 bg-green-50 border-green-200">
        <h2 className="text-xl font-semibold mb-4 text-green-800">
          Alternative: Direct Text Analysis
        </h2>
        <p className="mb-4">For fastest results, extract text from your documents and paste directly:</p>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.href = '/working'}
        >
          <FileText className="w-4 h-4 mr-2" />
          Go to Text Analysis
        </Button>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-6 p-6">
          <h3 className="font-semibold mb-4">Analysis Results</h3>
          {result.note && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800">
                {result.note}
              </AlertDescription>
            </Alert>
          )}
          <pre className="whitespace-pre-wrap text-sm">
            {result.analysis || JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}