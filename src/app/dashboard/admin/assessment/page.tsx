import { Metadata } from 'next';
import { QuestionManagement } from '@/components/assessment-admin/QuestionManagement';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Brain, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Assessment Management - FNTP Admin',
  description: 'Manage comprehensive functional medicine assessment questions and scoring',
};

export default function AssessmentAdminPage() {
  return (
    <div className="min-h-screen bg-brand-navy p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Assessment System Administration
                </h1>
                <p className="text-gray-300">
                  Manage comprehensive functional medicine assessment with 270+ questions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="font-semibold text-white">
                  Comprehensive Assessment System
                </h3>
                <p className="text-sm text-blue-300">
                  Advanced functional medicine evaluation with flexible optimization
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-white font-bold">45+</div>
                <div className="text-gray-400">Questions Built</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">8</div>
                <div className="text-gray-400">Body Systems</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">270</div>
                <div className="text-gray-400">Target Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-white">Comprehensive Questions</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• 270+ functional medicine questions</li>
              <li>• 8 body systems + modern FM categories</li>
              <li>• Sophisticated diagnostic weighting</li>
              <li>• Root cause identification</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-white">Flexible Management</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Easy question modification</li>
              <li>• Performance analytics tracking</li>
              <li>• A/B testing capabilities</li>
              <li>• Optimization recommendations</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-white">Advanced Analytics</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Question performance metrics</li>
              <li>• Clinical outcome correlation</li>
              <li>• System effectiveness analysis</li>
              <li>• Continuous optimization</li>
            </ul>
          </div>
        </div>

        {/* Question Management Interface */}
        <QuestionManagement />
      </div>
    </div>
  );
}
