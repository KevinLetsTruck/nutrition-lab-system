/**
 * Functional Medicine Assessment - Client Interface
 * 
 * Sophisticated assessment interface exceeding NutriQ capabilities
 * with real-time insights, modern FM detection, and mobile optimization
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    AlertTriangle,
    ArrowLeft,
    Brain,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Info,
    Lightbulb,
    Target,
    TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useClientAuth } from '@/lib/client-auth-context';

interface Question {
  id: number;
  category: string;
  subcategory: string;
  questionText: string;
  questionContext?: string;
  scaleType: string;
  requiredLevel: string;
  displayOrder: number;
}

interface RealTimeInsight {
  categoryScores: Array<{category: string; score: number}>;
  earlyIndicators: Array<{condition: string; probability: number}>;
  overallTrend: string;
}

interface AssessmentState {
  id: string;
  status: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
    isComplete: boolean;
  };
  nextQuestion: Question | null;
  realTimeInsights: RealTimeInsight | null;
}

export default function FunctionalMedicineAssessmentPage() {
  const router = useRouter();
  const { clientToken } = useClientAuth();
  
  // Core state
  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // UI state
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [showContext, setShowContext] = useState<boolean>(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  const startOrResumeAssessment = useCallback(async () => {
    if (!clientToken) {
      console.error('❌ No client token available');
      toast.error('Authentication required. Please refresh and try again.');
      return;
    }

    try {
      setLoading(true);
      console.log('🧠 Starting/resuming FM digestive assessment...');

      const response = await fetch('/api/fm-assessment/digestive/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientToken}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAssessmentState(data.assessment);
        setCurrentQuestion(data.assessment.nextQuestion);
        
        if (data.assessment.progress.isComplete) {
          toast.success('Assessment already completed! Redirecting to results...');
          router.push(`/client/assessment/results/${data.assessment.id}`);
          return;
        }
        
        if (data.assessment.progress.current > 0) {
          toast.info(`Resuming assessment - ${data.assessment.progress.current} questions already answered`);
        } else {
          toast.success('Assessment started! Answer each question based on your typical experience.');
        }
      } else {
        throw new Error(data.error || 'Failed to start assessment');
      }
    } catch (error) {
      console.error('❌ Start assessment error:', error);
      toast.error('Failed to start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [clientToken]);

  // Initialize assessment
  useEffect(() => {
    if (clientToken) {
      startOrResumeAssessment();
    }
  }, [clientToken, startOrResumeAssessment]);

  const submitResponse = async (responseValue: number) => {
    if (!assessmentState || !currentQuestion || submitting) return;

    try {
      setSubmitting(true);
      
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      
      const response = await fetch(`/api/fm-assessment/digestive/${assessmentState.id}/response`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientToken}`
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          responseValue,
          confidenceLevel: 5, // Default high confidence for streamlined flow
          notes: undefined, // Removed notes for simplicity
          timeSpentSeconds: timeSpent
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setAssessmentState(data.assessment);
        
        // Show real-time insights if available
        if (data.assessment.realTimeInsights) {
          showRealTimeInsights(data.assessment.realTimeInsights);
        }
        
        if (data.assessment.progress.isComplete) {
          // Assessment completed - trigger final analysis
          await completeAssessment();
        } else {
          // Move to next question
          setCurrentQuestion(data.assessment.nextQuestion);
          setSelectedResponse(null);
          setQuestionStartTime(Date.now());
          
          toast.success('Response saved!', { duration: 1000 });
        }
      } else {
        throw new Error(data.error || 'Failed to submit response');
      }
    } catch (error) {
      console.error('❌ Submit response error:', error);
      toast.error('Failed to save response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const completeAssessment = async () => {
    if (!assessmentState) return;

    try {
      console.log('🎯 Completing FM assessment and generating analysis...');
      toast.info('Generating your comprehensive analysis...', { duration: 3000 });

      const response = await fetch(`/api/fm-assessment/digestive/${assessmentState.id}/complete`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${clientToken}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('🎉 Assessment completed! Your analysis is ready.');
        router.push(`/client/assessment/results/${assessmentState.id}`);
      } else {
        throw new Error(data.error || 'Failed to complete assessment');
      }
    } catch (error) {
      console.error('❌ Complete assessment error:', error);
      toast.error('Analysis generation failed. Please contact support.');
    }
  };

  const showRealTimeInsights = (insights: RealTimeInsight) => {
    if (insights.earlyIndicators && insights.earlyIndicators.length > 0) {
      const topIndicator = insights.earlyIndicators[0];
      toast.info(`Early pattern detected: ${topIndicator.condition}`, { 
        duration: 3000,
        description: `${Math.round(topIndicator.probability)}% probability based on current responses`
      });
    }
  };

  // Streamlined scale options - no descriptions, fast completion
  const getSimpleScaleOptions = (scaleType: string) => {
    const scales: { [key: string]: Array<{ value: number, label: string }> } = {
      frequency: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Rarely' },  
        { value: 2, label: 'Sometimes' },
        { value: 3, label: 'Often' },
        { value: 4, label: 'Very Often' },
        { value: 5, label: 'Always' }
      ],
      severity: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Mild' },
        { value: 2, label: 'Moderate' },
        { value: 3, label: 'Severe' },
        { value: 4, label: 'Very Severe' },
        { value: 5, label: 'Extreme' }
      ],
      yes_no: [
        { value: 0, label: 'No' },
        { value: 5, label: 'Yes' }
      ],
      quantity: [
        { value: 0, label: 'None' },
        { value: 1, label: 'Little' },
        { value: 2, label: 'Some' },
        { value: 3, label: 'Moderate' },
        { value: 4, label: 'A Lot' },
        { value: 5, label: 'Excessive' }
      ]
    };

    return scales[scaleType] || scales.frequency;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <Brain className="h-16 w-16 text-blue-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">
                Initializing Assessment...
              </h2>
              <p className="text-gray-600">
                Preparing your functional medicine digestive evaluation
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-1/3 animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessmentState || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Assessment Error
            </h2>
            <p className="text-gray-600 mb-4">
              Unable to load assessment questions. Please try again.
            </p>
            <Button onClick={() => startOrResumeAssessment()} className="w-full">
              Retry Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scaleOptions = getSimpleScaleOptions(currentQuestion.scaleType);
  const categoryDisplayName = currentQuestion.subcategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="font-bold text-gray-900">FM Digestive Assessment</h1>
                <p className="text-xs text-gray-500">Question {assessmentState.progress.current + 1} of {assessmentState.progress.total}</p>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                {categoryDisplayName}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Progress Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">
                    Progress: {assessmentState.progress.percentage}% Complete
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>~{Math.round((assessmentState.progress.total - assessmentState.progress.current) * 0.5)} min remaining</span>
                </div>
              </div>
              
              <Progress value={assessmentState.progress.percentage} className="h-3" />
              
              <div className="text-sm text-gray-600 text-center">
                {assessmentState.progress.current} of {assessmentState.progress.total} questions answered
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {currentQuestion.subcategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
                {currentQuestion.requiredLevel === 'required' && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-xl leading-tight text-gray-900">
                {currentQuestion.questionText}
              </CardTitle>
              
              {currentQuestion.questionContext && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContext(!showContext)}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    {showContext ? 'Hide' : 'Show'} context
                    {showContext ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                  </Button>
                  
                  {showContext && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Context:</strong> {currentQuestion.questionContext}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Response Options */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 mb-3">Select your response:</h3>
              
              {scaleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedResponse(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedResponse === option.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={submitting}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={option.color} variant="outline">
                        {option.value}
                      </Badge>
                      {selectedResponse === option.value && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Streamlined interface - removed notes and confidence for higher completion rates */}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                onClick={() => selectedResponse !== null && submitResponse(selectedResponse)}
                disabled={selectedResponse === null || submitting}
                className="w-full h-12 text-base"
                size="lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving Response...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {assessmentState.progress.current === assessmentState.progress.total - 1 
                      ? 'Complete Assessment' 
                      : 'Save & Continue'
                    }
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Insights */}
        {assessmentState.realTimeInsights && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-purple-900">
                <Lightbulb className="h-5 w-5" />
                <span>Early Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessmentState.realTimeInsights.earlyIndicators.map((indicator: {condition: string; probability: number}, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200">
                    <div>
                      <p className="font-medium text-gray-900">{indicator.condition}</p>
                      <p className="text-sm text-gray-600">Pattern probability: {indicator.probability}%</p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                ))}
                
                <p className="text-xs text-purple-700 italic">
                  *Preliminary insights based on current responses. Complete assessment for full analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Help */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Take your time with each question. Your accuracy helps us provide better insights.
          </p>
          <p className="text-xs text-gray-500">
            All responses are automatically saved. You can return to complete this later if needed.
          </p>
        </div>
      </div>
    </div>
  );
}
