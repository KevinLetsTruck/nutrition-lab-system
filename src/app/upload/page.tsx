'use client'

import { useState } from 'react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Upload error:', error)
      setResult({ error: 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Lab Report</h1>
        
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="mb-6">
            <label className="block text-white mb-2">Select PDF File</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-3 bg-slate-700 text-white rounded"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload & Analyze'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-slate-700 rounded">
              <h3 className="text-white font-semibold mb-2">Result:</h3>
              <pre className="text-gray-300 text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-4">
          <a href="/dashboard" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}