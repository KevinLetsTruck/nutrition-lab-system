'use client';

import { useClientAuth } from '@/lib/client-auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  BarChart3,
  Clock,
  Target,
  Brain,
  CheckCircle,
  ArrowLeft,
  Zap,
} from 'lucide-react';

export default function ClientAssessmentPage() {
  const { clientUser } = useClientAuth();

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/client/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
        
        <div>
          <h1 className="text-xl font-bold text-gray-900">Health Assessment</h1>
          <p className="text-sm text-gray-600">Track your health journey over time</p>
        </div>
      </div>

      {/* Assessment Options */}
      <div className="space-y-4">
        
        {/* Quick Assessment */}
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Clock className="h-5 w-5 text-blue-600" />
                Quick Check-in
              </CardTitle>
              <Badge variant="outline" className="border-blue-400 text-blue-700">
                10-15 min
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Essential health screening with 40 key questions. Perfect for regular check-ins and progress tracking.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
              <div>✓ Energy levels</div>
              <div>✓ Digestive health</div>
              <div>✓ Sleep quality</div>
              <div>✓ Stress levels</div>
              <div>✓ Basic symptoms</div>
              <div>✓ Progress tracking</div>
            </div>
            <Button className="w-full" asChild>
              <Link href="/client/assessment/quick">
                <Clock className="h-4 w-4 mr-2" />
                Start Quick Assessment
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Comprehensive Assessment */}
        <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Brain className="h-5 w-5 text-green-600" />
                Comprehensive Evaluation
              </CardTitle>
              <Badge variant="outline" className="border-green-400 text-green-700">
                30-45 min
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Complete functional medicine assessment with 150+ questions covering all body systems and modern health factors.
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
              <div>✓ All body systems</div>
              <div>✓ Root cause analysis</div>
              <div>✓ EMF sensitivity</div>
              <div>✓ Food reactions</div>
              <div>✓ Environmental toxins</div>
              <div>✓ Detailed insights</div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700" asChild>
              <Link href="/client/assessment/comprehensive">
                <Brain className="h-4 w-4 mr-2" />
                Start Comprehensive Assessment
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Assessment History */}
        {clientUser?.assessmentCompleted && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Target className="h-5 w-5 text-purple-600" />
                Your Assessment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Latest Assessment</p>
                      <p className="text-xs text-gray-500">
                        Completed {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/client/assessment/results">
                      View Results
                    </Link>
                  </Button>
                </div>
                
                <div className="text-center py-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/client/assessment/history">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View All Assessments
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Assessment Benefits */}
      <div className="bg-gradient-to-br from-blue-900 to-green-900 text-white rounded-lg p-6">
        <div className="text-center">
          <Zap className="h-8 w-8 mx-auto mb-3 text-yellow-400" />
          <h3 className="text-lg font-bold mb-2">Why Take Assessments?</h3>
          <p className="text-sm text-blue-100 mb-4">
            Regular assessments help us understand your health patterns and optimize your protocols for life on the road.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Track improvements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Identify patterns</span>
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Optimize protocols</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Prevent issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
