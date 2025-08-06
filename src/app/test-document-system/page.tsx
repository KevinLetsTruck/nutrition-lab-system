'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PDFViewer } from '@/components/ui/pdf-viewer'

export default function TestDocumentSystem() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showPDF, setShowPDF] = useState(false)
  const [selectedPDF, setSelectedPDF] = useState<any>(null)
  
  const testUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/lab-files/clients/336ac9e9-dda3-477f-89d5-241df47b8745/1754455407444_corkadel_carole_fit176_report_07jul25.pdf`
  
  const runDiagnosis = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/diagnose-system')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }
  
  const runSimpleFix = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/simple-fix')
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }
  
  const testPDFViewer = () => {
    setSelectedPDF({
      url: testUrl,
      title: 'Test FIT Report',
      fileName: 'corkadel_carole_fit176_report_07jul25.pdf'
    })
    setShowPDF(true)
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Document System Test</h1>
      
      <div className="grid gap-4 mb-8">
        <Button onClick={runDiagnosis} disabled={loading}>
          Run System Diagnosis
        </Button>
        
        <Button onClick={runSimpleFix} disabled={loading}>
          Run Simple Fix (Update file_url only)
        </Button>
        
        <Button onClick={testPDFViewer}>
          Test PDF Viewer Component
        </Button>
        
        <Button onClick={() => window.open(testUrl, '_blank')}>
          Test Direct PDF URL
        </Button>
      </div>
      
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      {showPDF && selectedPDF && (
        <PDFViewer
          isOpen={showPDF}
          onClose={() => {
            setShowPDF(false)
            setSelectedPDF(null)
          }}
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
          fileName={selectedPDF.fileName}
        />
      )}
    </div>
  )
}