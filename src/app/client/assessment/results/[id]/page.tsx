/**
 * Functional Medicine Assessment Results
 * 
 * Displays comprehensive analysis results with modern FM insights
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useClientAuth } from '@/lib/client-auth-context';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    Brain,
    Calendar,
    CheckCircle,
    Clock,
    Download,
    Heart,
    Leaf,
    Lightbulb,
    Share2,
    Shield,
    Target,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AssessmentResults {
  assessmentInfo: {
    id: string;
    completedAt: string;
    totalTimeMinutes: number;
    responseCount: number;
    clientName: string;
  };
  overallResults: {
    digestiveScore: number;
    severity: string;
    interpretation: string;
  };
  categoryScores: {
    upperGI: { score: number; severity: string; insights: string[] };
    smallIntestine: { score: number; severity: string; insights: string[] };
    largeIntestine: { score: number; severity: string; insights: string[] };
    liverDetox: { score: number; severity: string; insights: string[] };
  };
  rootCauseAnalysis: {
    primaryDrivers: any[];
    keyFindings: string[];
    clinicalSignificance: string;
  };
  modernInsights: {
    environmentalFactors: any;
    lifestyleFactors: any;
    traditionalVsModern: any;
  };
  recommendations: {
    treatmentPriorities: any;
    immediateActions: string[];
    lifestyleModifications: string[];
    followUpPlan: any;
  };
}

export default function AssessmentResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { clientToken } = useClientAuth();
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!clientToken) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`📊 Fetching FM assessment results: ${params.id}`);

      const response = await fetch(`/api/fm-assessment/digestive/${params.id}/results`, {
        headers: {
          'Authorization': `Bearer ${clientToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Assessment not completed yet or not found');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResults(data.results);
        console.log('✅ Results loaded successfully');
      } else {
        throw new Error(data.error || 'Failed to load results');
      }
    } catch (error) {
      console.error('❌ Fetch results error:', error);
      setError(error.message);
      toast.error('Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  }, [clientToken, params.id]);

  useEffect(() => {
    if (clientToken) {
      fetchResults();
    }
  }, [clientToken, fetchResults]);

  const getScoreColor = (score: number) => {
    if (score <= 20) return 'text-green-600 bg-green-100';
    if (score <= 40) return 'text-blue-600 bg-blue-100';
    if (score <= 60) return 'text-yellow-600 bg-yellow-100';
    if (score <= 80) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'fair': return <Activity className="h-5 w-5 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'critical': return <Shield className="h-5 w-5 text-red-600" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <Brain className="h-16 w-16 text-blue-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">
                Analyzing Your Results...
              </h2>
              <p className="text-gray-600">
                Processing your functional medicine assessment
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Results Unavailable
            </h2>
            <p className="text-gray-600 mb-4">
              {error || 'Assessment results could not be loaded.'}
            </p>
            <div className="space-y-2">
              <Button onClick={() => fetchResults()} className="w-full">
                Retry Loading
              </Button>
              <Button variant="outline" onClick={() => router.push('/client/dashboard')} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/client/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Dashboard
              </Button>
              <div>
                <h1 className="font-bold text-gray-900">Assessment Results</h1>
                <p className="text-xs text-gray-500">
                  Completed {new Date(results.assessmentInfo.completedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Overall Score Hero Section */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center space-x-3">
                {getSeverityIcon(results.overallResults.severity)}
                <h2 className="text-3xl font-bold">
                  Your Digestive Health Score
                </h2>
              </div>
              
              <div className="space-y-2">
                <div className="text-6xl font-bold">
                  {Math.round(100 - results.overallResults.digestiveScore)}
                  <span className="text-2xl">/100</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30" variant="outline">
                  {results.overallResults.severity} Function
                </Badge>
              </div>
              
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                {results.overallResults.interpretation}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <Clock className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm text-blue-100">Assessment Time</div>
                  <div className="font-semibold">{results.assessmentInfo.totalTimeMinutes} min</div>
                </div>
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm text-blue-100">Questions</div>
                  <div className="font-semibold">{results.assessmentInfo.responseCount}</div>
                </div>
                <div className="text-center">
                  <Brain className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm text-blue-100">Analysis</div>
                  <div className="font-semibold">Complete</div>
                </div>
                <div className="text-center">
                  <Heart className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm text-blue-100">Insights</div>
                  <div className="font-semibold">{results.rootCauseAnalysis.primaryDrivers.length}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(results.categoryScores).map(([category, data]: [string, any]) => (
            <Card key={category} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {getSeverityIcon(data.severity)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {Math.round(100 - (data.score * 20))}
                    </div>
                    <Badge className={getScoreColor(data.score * 20)} variant="outline">
                      {data.severity}
                    </Badge>
                  </div>
                  
                  <Progress value={100 - (data.score * 20)} className="h-2" />
                  
                  {data.insights && data.insights.length > 0 && (
                    <div className="space-y-2">
                      {data.insights.slice(0, 2).map((insight: string, index: number) => (
                        <p key={index} className="text-xs text-gray-600 leading-tight">
                          {insight.substring(0, 80)}...
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Root Cause Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-red-600" />
              <span>Root Cause Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                {results.rootCauseAnalysis.clinicalSignificance}
              </p>

              {results.rootCauseAnalysis.primaryDrivers.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Primary Drivers Identified:</h3>
                  {results.rootCauseAnalysis.primaryDrivers.map((driver: any, index: number) => (
                    <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium text-red-900">{driver.condition}</h4>
                          <p className="text-sm text-red-700">
                            Probability: {driver.probability}% ({driver.evidenceLevel} evidence)
                          </p>
                          {driver.symptoms && driver.symptoms.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs text-red-600 font-medium">Supporting symptoms:</p>
                              <ul className="text-xs text-red-600 list-disc list-inside">
                                {driver.symptoms.slice(0, 3).map((symptom: string, idx: number) => (
                                  <li key={idx}>{symptom}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Priority {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-green-50 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-900 mb-2">No Major Issues Detected</h3>
                  <p className="text-green-700 text-sm">
                    Your assessment shows generally good digestive function with minimal concerning patterns.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modern FM Insights */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-900">
              <Zap className="h-6 w-6" />
              <span>Modern Functional Medicine Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-purple-900">Environmental Factors</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-sm text-gray-700">EMF Exposure Impact</span>
                    <Badge variant="outline" className="text-purple-600">
                      {results.modernInsights.lifestyleFactors?.emfExposure || 0}/10
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-sm text-gray-700">Processed Food Burden</span>
                    <Badge variant="outline" className="text-purple-600">
                      {results.modernInsights.lifestyleFactors?.processedFoodBurden || 0}/10
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span className="text-sm text-gray-700">Circadian Disruption</span>
                    <Badge variant="outline" className="text-purple-600">
                      {results.modernInsights.lifestyleFactors?.circadianDisruption || 0}/10
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-purple-900">Modern vs Traditional Findings</h3>
                <div className="space-y-3">
                  {results.modernInsights.traditionalVsModern?.modernFMEnhancements?.slice(0, 3).map((insight: string, index: number) => (
                    <div key={index} className="p-3 bg-white rounded border flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <span>Personalized Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              {/* Immediate Actions */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Immediate Actions</h3>
                <div className="space-y-2">
                  {results.recommendations.immediateActions.map((action: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-green-800">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Modifications */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Lifestyle Modifications</h3>
                <div className="space-y-2">
                  {results.recommendations.lifestyleModifications.map((modification: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <Activity className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{modification}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-green-600" />
              <span>Your Next Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Schedule Consultation</h4>
                  <p className="text-sm text-gray-600">{results.recommendations.followUpPlan?.initialConsultation}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Progress Review</h4>
                  <p className="text-sm text-gray-600">{results.recommendations.followUpPlan?.progressReview}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1">Reassessment</h4>
                  <p className="text-sm text-gray-600">{results.recommendations.followUpPlan?.reassessment}</p>
                </div>
              </div>

              <div className="text-center pt-4">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <Calendar className="h-5 w-5 mr-2" />
                  Schedule Your Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Quality & Completion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <span>Assessment Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">45</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Confidence Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">A+</div>
                <div className="text-sm text-gray-600">Clinical Quality</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                Your assessment provides high-quality data for accurate functional medicine analysis and treatment planning.
              </p>
            </div>
          </CardContent>
        </Card>
        
      </div>
    </div>
  );
}
