'use client'

import { useState } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'

interface PDFViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  title: string
  fileName: string
}

export function PDFViewer({ isOpen, onClose, pdfUrl, title, fileName }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenInNewTab = () => {
    window.open(pdfUrl, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{fileName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 p-4">
          {error ? (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleOpenInNewTab} variant="outline">
                  Open PDF in New Tab
                </Button>
              </div>
            </Card>
          ) : (
            <div className="h-full border rounded-lg overflow-hidden">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setError('Failed to load PDF. Please try opening in a new tab.')
                  setIsLoading(false)
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 