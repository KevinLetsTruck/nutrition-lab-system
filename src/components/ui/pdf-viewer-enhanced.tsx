'use client'

import { useState, useEffect } from 'react'
import { X, Download, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface PDFViewerEnhancedProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  title: string
  fileName: string
}

export function PDFViewerEnhanced({ isOpen, onClose, pdfUrl, title, fileName }: PDFViewerEnhancedProps) {
  const [viewMode, setViewMode] = useState<'iframe' | 'embed' | 'object' | 'proxy'>('iframe')
  const [error, setError] = useState(false)
  
  useEffect(() => {
    // Reset error when URL changes
    setError(false)
  }, [pdfUrl])
  
  if (!isOpen) return null
  
  // Use proxy endpoint for CORS issues
  const proxyUrl = `/api/test-cors?url=${encodeURIComponent(pdfUrl)}`
  
  const renderViewer = () => {
    switch (viewMode) {
      case 'iframe':
        return (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            onError={() => setError(true)}
          />
        )
      case 'embed':
        return (
          <embed
            src={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
          />
        )
      case 'object':
        return (
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full"
          >
            <p>PDF cannot be displayed</p>
          </object>
        )
      case 'proxy':
        return (
          <iframe
            src={proxyUrl}
            className="w-full h-full border-0"
            onError={() => setError(true)}
          />
        )
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-500">{fileName}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value as any)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="iframe">iFrame</option>
              <option value="embed">Embed</option>
              <option value="object">Object</option>
              <option value="proxy">Proxy</option>
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(pdfUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const link = document.createElement('a')
                link.href = pdfUrl
                link.download = fileName
                link.click()
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* PDF Content */}
        <div className="h-[calc(100%-80px)] bg-gray-100">
          {error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Unable to display PDF</p>
                <p className="text-gray-600 mb-4">Try a different view mode or open in a new tab</p>
                <Button onClick={() => window.open(pdfUrl, '_blank')}>
                  Open in New Tab
                </Button>
              </div>
            </div>
          ) : (
            renderViewer()
          )}
        </div>
      </div>
    </div>
  )
}