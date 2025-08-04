import { SimpleUpload } from '@/components/ui/simple-upload'

export default function TestUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Test Document Upload</h1>
          <p className="mt-2 text-gray-600">
            Simple upload that works without AWS Textract
          </p>
        </div>
        
        <SimpleUpload />
        
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Troubleshooting Document Upload Issues
            </h2>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <p className="font-medium">✅ This uploader uses a simplified approach:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>No AWS Textract required</li>
                  <li>Uses pdf-parse for text extraction</li>
                  <li>Falls back to AI analysis if text extraction fails</li>
                  <li>Stores files in Supabase Storage</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">📋 For best results:</p>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>Use text-based PDFs (not scanned images)</li>
                  <li>Keep file size under 10MB</li>
                  <li>Ensure PDF is not password-protected</li>
                  <li>Use standard lab report formats</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">🔍 Check browser console for detailed logs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}