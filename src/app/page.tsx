import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploadSection } from '@/components/ui/file-upload-section'
import { RecentResults } from '@/components/ui/recent-results'
import { Header } from '@/components/ui/header'
import { Activity, BarChart3, FileText, TrendingUp, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl mb-6">
            <Activity className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nutrition Lab Management
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Upload and analyze your lab results with AI-powered insights. Get comprehensive health assessments in minutes.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">156</p>
                  <p className="text-sm text-dark-400">Reports Analyzed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">94%</p>
                  <p className="text-sm text-dark-400">Accuracy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">89</p>
                  <p className="text-sm text-dark-400">Active Clients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-800/50 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">2.3s</p>
                  <p className="text-sm text-dark-400">Avg. Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-dark-800/50 border-dark-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary-400" />
                <span>Upload Lab Report</span>
              </CardTitle>
              <CardDescription>
                Upload your NutriQ, KBMO, Dutch, or other lab reports for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadSection />
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-dark-800/50 border-dark-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                <span>Recent Analysis Results</span>
              </CardTitle>
              <CardDescription>
                View your latest lab report analyses and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentResults />
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-dark-300 max-w-2xl mx-auto">
              Everything you need for comprehensive lab report analysis and health insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-dark-800/50 border-dark-700 text-center hover:bg-dark-750 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Smart PDF Parsing
                </h3>
                <p className="text-dark-300">
                  Automatically extract and parse lab results from any PDF format with advanced AI
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-800/50 border-dark-700 text-center hover:bg-dark-750 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  AI-Powered Analysis
                </h3>
                <p className="text-dark-300">
                  Get intelligent insights and recommendations using Claude AI technology
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-800/50 border-dark-700 text-center hover:bg-dark-750 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Data Visualization
                </h3>
                <p className="text-dark-300">
                  Beautiful charts and trends to understand your health data at a glance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
