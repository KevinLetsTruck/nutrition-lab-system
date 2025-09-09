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
import { Textarea } from '@/components/ui/textarea';
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
  categoryScores: any[];
  earlyIndicators: any[];
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
  
  // Core state
  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // UI state
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [showContext, setShowContext] = useState<boolean>(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Initialize assessment
  useEffect(() => {
    startOrResumeAssessment();
  }, []);

  const startOrResumeAssessment = async () => {
    try {
      setLoading(true);
      console.log('🧠 Starting/resuming FM digestive assessment...');

      const response = await fetch('/api/fm-assessment/digestive/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
  };

  const submitResponse = async (responseValue: number) => {
    if (!assessmentState || !currentQuestion || submitting) return;

    try {
      setSubmitting(true);
      
      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      
      const response = await fetch(`/api/fm-assessment/digestive/${assessmentState.id}/response`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          responseValue,
          confidenceLevel: confidence,
          notes: notes.trim() || undefined,
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
          setNotes('');
          setConfidence(5);
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

  const getScaleOptions = (scaleType: string) => {
    const scales: { [key: string]: Array<{ value: number, label: string, description: string, color: string }> } = {
      frequency: [
        { value: 0, label: 'Never', description: 'This never happens to me', color: 'bg-green-100 text-green-800 border-green-300' },
        { value: 1, label: 'Very Rarely', description: 'A few times per year or less', color: 'bg-green-50 text-green-700 border-green-200' },
        { value: 2, label: 'Rarely', description: 'A few times per month', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        { value: 3, label: 'Sometimes', description: 'A few times per week', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { value: 4, label: 'Often', description: 'Most days', color: 'bg-orange-100 text-orange-800 border-orange-300' },
        { value: 5, label: 'Very Often', description: 'Daily or almost daily', color: 'bg-red-100 text-red-800 border-red-300' }
      ],
      severity: [
        { value: 0, label: 'None', description: 'No symptoms', color: 'bg-green-100 text-green-800 border-green-300' },
        { value: 1, label: 'Very Mild', description: 'Barely noticeable', color: 'bg-green-50 text-green-700 border-green-200' },
        { value: 2, label: 'Mild', description: 'Noticeable but not bothersome', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        { value: 3, label: 'Moderate', description: 'Somewhat bothersome', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        { value: 4, label: 'Severe', description: 'Very bothersome, affects daily life', color: 'bg-orange-100 text-orange-800 border-orange-300' },
        { value: 5, label: 'Extremely Severe', description: 'Debilitating, major impact', color: 'bg-red-100 text-red-800 border-red-300' }
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

  const scaleOptions = getScaleOptions(currentQuestion.scaleType);
  const categoryDisplayName = currentQuestion.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

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

            {/* Optional Notes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-900">
                  Additional Notes (Optional)
                </label>
                <Badge variant="outline" className="text-xs">Optional</Badge>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details about this symptom..."
                className="resize-none"
                rows={2}
                disabled={submitting}
              />
            </div>

            {/* Confidence Level */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-900">
                How confident are you in your answer?
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidence(level)}
                    className={`flex-1 p-2 rounded text-center text-sm font-medium transition-colors ${
                      confidence === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={submitting}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center">
                1 = Not sure, 5 = Very confident
              </p>
            </div>

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
                {assessmentState.realTimeInsights.earlyIndicators.map((indicator: any, index: number) => (
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
