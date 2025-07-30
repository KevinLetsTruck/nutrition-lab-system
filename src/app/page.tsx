import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploadSection } from '@/components/ui/file-upload-section'
import { RecentResults } from '@/components/ui/recent-results'
import { Header } from '@/components/ui/header'
import { Footer } from '@/components/ui/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ActionCard } from '@/components/ui/action-card'
import { Activity, BarChart3, FileText, TrendingUp, Users, Zap, MessageSquare, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <Header />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-6 -mt-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="fntp" size="lg" className="text-sm">
              FNTP Certified • Truck Driver Specialist
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Professional Truck Driver
              <br />
              <span className="text-primary-400">Health Optimization</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Evidence-based functional medicine protocols designed for the unique challenges 
              of professional driving. Stay healthy, stay compliant, keep driving.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="shadow-2xl shadow-green-500/25 bg-primary-600 hover:bg-primary-700">
                Start Health Assessment →
              </Button>
              <button className="text-gray-300 hover:text-white underline text-lg">
                View Sample Report
              </button>
            </div>
          </div>
        </section>

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

        {/* Enhanced Quick Actions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <ActionCard 
              icon={<FileText className="w-6 h-6 text-blue-500" />}
              title="Upload Lab Results"
              description="NutriQ, KBMO, Dutch tests"
              href="/upload"
            />
            <ActionCard 
              icon={<MessageSquare className="w-6 h-6 text-orange-500" />}
              title="Client Notes"
              description="Session notes & progress"
              href="/onboarding"
            />
            <ActionCard 
              icon={<BarChart3 className="w-6 h-6 text-green-500" />}
              title="View Reports"
              description="Analysis & protocols"
              href="/reports"
            />
            <ActionCard 
              icon={<Calendar className="w-6 h-6 text-purple-500" />}
              title="Schedule Follow-up"
              description="Track client progress"
              href="/streamlined-onboarding"
            />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-dark-800/50 border-dark-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary-400" />
                <span>Upload Lab Reports</span>
              </CardTitle>
              <CardDescription>
                Upload NutriQ, KBMO, Dutch, or other lab reports for FNTP analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadSection />
            </CardContent>
          </Card>

          {/* Onboarding Section */}
          <Card className="bg-dark-800/50 border-dark-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-primary-400" />
                <span>Health Assessment</span>
              </CardTitle>
              <CardDescription>
                Complete comprehensive health assessment for personalized truck driver protocols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-dark-300 text-sm">
                  New clients complete our comprehensive health assessment to provide detailed health information, 
                  DOT medical history, and driving-specific goals for personalized functional medicine care.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a 
                    href="/streamlined-onboarding" 
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors"
                  >
                    Start Assessment
                  </a>
                  <a 
                    href="/streamlined-onboarding" 
                    className="inline-flex items-center justify-center px-4 py-2 border border-dark-600 hover:bg-dark-700 text-dark-300 font-medium rounded-md transition-colors"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-dark-800/50 border-dark-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                <span>Recent Health Reports</span>
              </CardTitle>
              <CardDescription>
                View your latest FNTP health analysis reports and protocols
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
              Truck Driver Health Specialization
            </h2>
            <p className="text-dark-300 max-w-2xl mx-auto">
              Evidence-based functional medicine protocols designed for professional drivers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-dark-800/50 border-dark-700 text-center hover:bg-dark-750 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  DOT Medical Compliance
                </h3>
                <p className="text-dark-300">
                  Optimize health markers for DOT medical certification and long-term compliance
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-800/50 border-dark-700 text-center hover:bg-dark-750 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Road-Ready Protocols
                </h3>
                <p className="text-dark-300">
                  Functional medicine protocols designed for truck stop accessibility and on-the-road lifestyle
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-dark-800/50 border-dark-700 text-center hover:bg-dark-750 transition-colors">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Energy & Focus Optimization
                </h3>
                <p className="text-dark-300">
                  Targeted nutrition and lifestyle strategies for sustained energy during long hauls
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
