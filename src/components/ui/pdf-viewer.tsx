'use client'

import { useState } from 'react'
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader } from './card'

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
  const [zoom, setZoom] = useState(100)
  const [iframeError, setIframeError] = useState(false)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-7xl h-[95vh] bg-card rounded-xl border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-background border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground gradient-text">{title}</h2>
            <p className="text-sm text-muted-foreground">{fileName}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-4 bg-background-secondary rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                className="h-8 w-8 p-0"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-foreground min-w-[3rem] text-center font-medium">{zoom}%</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="h-8 w-8 p-0"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(100)}
                className="h-8 w-8 p-0 ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="secondary"
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
              className="flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 p-4 bg-background">
          {error ? (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={handleOpenInNewTab} variant="outline">
                    Open PDF in New Tab
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full rounded-lg overflow-hidden relative bg-white">
              {!iframeError ? (
                <>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    style={{ minHeight: '600px' }}
                    onLoad={() => {
                      setIsLoading(false)
                      console.log('PDF loaded successfully')
                    }}
                    onError={() => {
                      console.error('Iframe error loading PDF')
                      setIframeError(true)
                      setIsLoading(false)
                    }}
                  />
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading PDF...</p>
                        <p className="text-xs text-muted-foreground mt-2">If this takes too long, try the &quot;Open&quot; button above</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8">
                    <p className="text-lg mb-4">Unable to display PDF in viewer</p>
                    <p className="text-muted-foreground mb-6">This might be due to browser security settings.</p>
                    <div className="space-y-2">
                      <Button onClick={handleOpenInNewTab} variant="default" className="w-full">
                        Open PDF in New Tab
                      </Button>
                      <Button onClick={handleDownload} variant="outline" className="w-full">
                        Download PDF
                      </Button>
                    </div>
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