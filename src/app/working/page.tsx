'use client'

import { useState } from 'react'

export default function WorkingAnalyzer() {
  const [mode, setMode] = useState<'file' | 'text'>('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const analyze = async () => {
    setLoading(true)
    setResult('')

    try {
      let response
      
      if (mode === 'text') {
        // Direct text analysis - we KNOW this works
        response = await fetch('/api/analyze-direct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text || 'No text provided',
            documentType: 'auto',
            clientName: 'Patient'
          })
        })
      } else if (file) {
        // File upload
        const formData = new FormData()
        formData.append('file', file)
        formData.append('documentType', 'auto')
        formData.append('clientName', 'Patient')
        
        response = await fetch('/api/analyze-simple', {
          method: 'POST',
          body: formData
        })
      }

      if (response) {
        const data = await response.json()
        if (data.success || data.result) {
          setResult(JSON.stringify(data, null, 2))
        } else {
          setResult(`Error: ${data.error || 'Unknown error'}\n\nDetails: ${JSON.stringify(data, null, 2)}`)
        }
      }
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Document Analyzer That Actually Works</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setMode('text')} 
          style={{ 
            marginRight: '10px', 
            padding: '10px 20px',
            backgroundColor: mode === 'text' ? '#4CAF50' : '#ddd',
            color: mode === 'text' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Paste Text
        </button>
        <button 
          onClick={() => setMode('file')} 
          style={{ 
            padding: '10px 20px',
            backgroundColor: mode === 'file' ? '#4CAF50' : '#ddd',
            color: mode === 'file' ? 'white' : 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Upload File
        </button>
      </div>

      {mode === 'text' ? (
        <div>
          <h3>Paste your document text:</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste any health document text here..."
            style={{
              width: '100%',
              height: '300px',
              padding: '10px',
              fontSize: '14px',
              border: '1px solid #ddd'
            }}
          />
        </div>
      ) : (
        <div>
          <h3>Upload your document:</h3>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ marginBottom: '10px' }}
          />
          {file && <p>Selected: {file.name}</p>}
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading || (mode === 'text' ? !text : !file)}
        style={{
          marginTop: '20px',
          padding: '15px 30px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          width: '100%'
        }}
      >
        {loading ? 'Analyzing...' : 'Analyze Document'}
      </button>

      {result && (
        <div style={{ marginTop: '20px' }}>
          <h3>Results:</h3>
          <pre style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            overflow: 'auto',
            maxHeight: '600px',
            border: '1px solid #ddd'
          }}>
            {result}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '40px', color: '#666', fontSize: '14px' }}>
        <p><strong>Tips:</strong></p>
        <ul>
          <li>Text mode: Copy and paste any document content - this always works!</li>
          <li>File mode: Upload PDFs, images, or text files</li>
          <li>If file upload fails, switch to text mode and paste the content</li>
        </ul>
      </div>
    </div>
  )
}