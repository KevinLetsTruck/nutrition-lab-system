'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Nutrition Lab Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a href="/upload" className="block w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                Upload Lab Report
              </a>
              <a href="/results" className="block w-full p-3 bg-green-600 text-white rounded hover:bg-green-700">
                View Results
              </a>
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Reports</h2>
            <p className="text-gray-400">No recent reports</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
            <p className="text-green-400">✓ All systems operational</p>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Nutrition Lab Features</h2>
          <div className="bg-slate-800 p-6 rounded-lg">
            <ul className="space-y-2 text-gray-300">
              <li>• Upload and analyze lab reports (PDF)</li>
              <li>• AI-powered analysis with Claude Vision</li>
              <li>• Support for DUTCH, KBMO, NutriQ, and more</li>
              <li>• Automated report processing</li>
              <li>• Secure cloud storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}