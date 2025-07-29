import { FileUpload } from '@/components/ui/file-upload'
import { Button } from '@/components/ui/button'
import { LabResults } from '@/components/lab/lab-results'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nutrition Lab Management System
          </h1>
          <p className="text-xl text-gray-600">
            Upload and analyze your lab results with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Upload Lab Report
            </h2>
            <FileUpload
              onFileSelect={(files) => {
                console.log('Selected files:', files)
              }}
              accept={{
                'application/pdf': ['.pdf'],
                'image/*': ['.png', '.jpg', '.jpeg']
              }}
              maxSize={10 * 1024 * 1024} // 10MB
            />
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Lab Results
            </h2>
            <div className="text-center py-8 text-gray-500">
              <p>Upload a lab report to see results here</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                PDF Parsing
              </h3>
              <p className="text-gray-600">
                Automatically extract lab results from PDF reports
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">��</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Analysis
              </h3>
              <p className="text-gray-600">
                Get intelligent insights using Claude AI
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Data Visualization
              </h3>
              <p className="text-gray-600">
                Beautiful charts and trends for your health data
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
