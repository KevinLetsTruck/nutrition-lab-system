'use client'

import { useState } from 'react'

export default function TestUploadDebug() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const fileInput = formData.get('file') as File
    
    if (!fileInput || fileInput.size === 0) {
      setResult({ error: 'Please select a file' })
      setLoading(false)
      return
    }

    // Test debug endpoint
    try {
      const debugFormData = new FormData()
      debugFormData.append('file', fileInput)
      debugFormData.append('clientEmail', 'test@example.com')
      debugFormData.append('clientFirstName', 'Test')
      debugFormData.append('clientLastName', 'User')
      debugFormData.append('category', 'client_documents')
      debugFormData.append('clientId', 'ec67a931-3c8c-42b0-a8e9-6b5e046ca743')

      const debugResponse = await fetch('/api/debug-upload', {
        method: 'POST',
        body: debugFormData
      })
      const debugData = await debugResponse.json()
      
      // Test actual upload endpoint
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: debugFormData
      })
      const uploadData = await uploadResponse.json()

      setResult({
        debug: {
          status: debugResponse.status,
          data: debugData
        },
        upload: {
          status: uploadResponse.status,
          data: uploadData
        }
      })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Debug Test</h1>
      
      <form onSubmit={handleUpload} className="mb-8">
        <input
          type="file"
          name="file"
          accept=".pdf,.jpg,.jpeg,.png,.txt"
          className="mb-4 p-2 bg-gray-800 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Upload'}
        </button>
      </form>

      {result && (
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Results:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}