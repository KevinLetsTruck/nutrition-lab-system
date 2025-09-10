/**
 * Streamlined Functional Medicine Assessment - Fast Completion Design
 * 
 * Compact horizontal radio button interface for maximum completion rates
 * Matches NutriQ's proven fast completion pattern
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useClientAuth } from '@/lib/client-auth-context';
import {
    AlertTriangle,
    ArrowLeft,
    Brain,
    CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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

interface AssessmentState {
  id: string;
  status: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
    isComplete: boolean;
    currentQuestionIndex: number;
  };
  nextQuestion: Question | null;
}

export default function StreamlinedAssessmentPage() {
  const router = useRouter();
  const { clientToken } = useClientAuth();
  
  // Core state
  const [assessmentState, setAssessmentState] = useState<AssessmentState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // UI state
  const [selectedResponse, setSelectedResponse] = useState<number | null>(null);
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
  }, [clientToken, router]);

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
        
        if (data.assessment.progress.isComplete) {
          // Assessment completed - trigger final analysis
          await completeAssessment();
        } else {
          // Move to next question
          setCurrentQuestion(data.assessment.nextQuestion);
          setSelectedResponse(null);
          setQuestionStartTime(Date.now());
          
          toast.success('Saved!', { duration: 800 });
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
        toast.success('Assessment completed! Redirecting to your results...');
        setTimeout(() => {
          router.push(`/client/assessment/results/${assessmentState.id}`);
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to complete assessment');
      }
    } catch (error) {
      console.error('❌ Complete assessment error:', error);
      toast.error('Failed to complete assessment. Please try again.');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <Brain className="h-12 w-12 text-blue-600 mx-auto" />
              <h2 className="text-lg font-semibold text-gray-900">Loading Assessment...</h2>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessmentState || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Assessment Error</h2>
            <p className="text-gray-600 mb-4">Unable to load assessment questions.</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
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
                <h1 className="font-bold text-gray-900">Assessment</h1>
                <p className="text-xs text-gray-500">
                  Question {assessmentState.progress.current + 1} of {assessmentState.progress.total}
                </p>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {assessmentState.progress.percentage}% Complete
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mt-2">
            <Progress value={assessmentState.progress.percentage} className="h-1" />
          </div>
        </div>
      </div>

      {/* Streamlined Question Interface */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            {/* Category Tag */}
            <Badge variant="outline" className="text-blue-600 border-blue-600 mb-4">
              {categoryDisplayName}
            </Badge>
            
            {/* Question Text */}
            <h2 className="text-xl font-medium text-gray-900 mb-6 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {/* Horizontal Radio Button Scale */}
            <div className="space-y-4">
              {/* Desktop: Horizontal Layout */}
              <div className="hidden md:block">
                <div className="grid grid-cols-6 gap-3">
                  {scaleOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedResponse(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        selectedResponse === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      disabled={submitting}
                    >
                      <div className="font-semibold text-2xl mb-1">{option.value}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile: Vertical Stack with Large Touch Targets */}
              <div className="md:hidden space-y-3">
                {scaleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedResponse(option.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                      selectedResponse === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={submitting}
                  >
                    <span className="font-medium text-lg">{option.label}</span>
                    <span className="font-semibold text-2xl">{option.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Continue Button */}
            <div className="mt-8">
              <Button
                onClick={() => selectedResponse !== null && submitResponse(selectedResponse)}
                disabled={selectedResponse === null || submitting}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    {selectedResponse !== null && <CheckCircle className="h-5 w-5 ml-2" />}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
