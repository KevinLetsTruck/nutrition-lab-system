'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentAPI } from '@/lib/api/assessment-client';
import { AssessmentQuestion } from '@/lib/assessment/types';
import { QuestionRenderer } from './QuestionRenderer';
import { ProgressBar } from './progress/ProgressBar';
import { AssessmentProgress } from './progress/AssessmentProgress';
import { toast } from 'react-hot-toast';

interface AssessmentFlowProps {
  assessmentId: string;
  clientId: string;
  onComplete?: () => void;
}

export function AssessmentFlow({
  assessmentId,
  clientId,
  onComplete
}: AssessmentFlowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [currentValue, setCurrentValue] = useState<any>(null);
  const [progress, setProgress] = useState({
    currentModule: 'SCREENING',
    questionsAsked: 0,
    completionRate: 0,
    moduleProgress: {},
    estimatedMinutesRemaining: 300
  });
  const [showProgress, setShowProgress] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load next question
  const loadNextQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const result = await assessmentAPI.getNextQuestion(assessmentId);
      
      if (result.success) {
        if (result.data?.completed) {
          // Assessment completed
          toast.success('Assessment completed!');
          if (onComplete) {
            onComplete();
          } else {
            router.push(`/assessments/${assessmentId}/results`);
          }
        } else if (result.data?.question) {
          setCurrentQuestion(result.data.question);
          setCurrentValue(null);
          
          // Update progress
          if (result.data.progress) {
            setProgress({
              currentModule: result.data.progress.currentModule,
              questionsAsked: result.data.progress.questionsAsked,
              completionRate: result.data.progress.overallProgress,
              moduleProgress: progress.moduleProgress,
              estimatedMinutesRemaining: progress.estimatedMinutesRemaining
            });
          }
        }
      } else {
        toast.error(result.error?.message || 'Failed to load question');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      toast.error('Failed to load question');
    } finally {
      setLoading(false);
    }
  }, [assessmentId, onComplete, router, progress.moduleProgress, progress.estimatedMinutesRemaining]);

  // Submit response
  const handleSubmit = async () => {
    if (!currentQuestion || currentValue === null || currentValue === undefined) {
      toast.error('Please answer the question before continuing');
      return;
    }

    try {
      setSaving(true);
      const result = await assessmentAPI.submitResponse(
        assessmentId,
        currentQuestion.id,
        currentValue,
        undefined, // text
        undefined  // confidence
      );

      if (result.success) {
        // Update progress from response
        if (result.data?.progress) {
          setProgress(prev => ({
            ...prev,
            questionsAsked: result.data.progress.questionsAsked,
            completionRate: result.data.progress.completionRate
          }));
        }
        
        // Load next question
        await loadNextQuestion();
      } else {
        toast.error(result.error?.message || 'Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      toast.error('Failed to save response');
    } finally {
      setSaving(false);
    }
  };

  // Pause/Resume assessment
  const handlePauseResume = async () => {
    try {
      if (isPaused) {
        const result = await assessmentAPI.resumeAssessment(assessmentId);
        if (result.success) {
          setIsPaused(false);
          toast.success('Assessment resumed');
          await loadNextQuestion();
        }
      } else {
        const result = await assessmentAPI.pauseAssessment(assessmentId);
        if (result.success) {
          setIsPaused(true);
          toast.success('Assessment paused - you can resume anytime');
        }
      }
    } catch (error) {
      console.error('Error pausing/resuming:', error);
      toast.error('Failed to pause/resume assessment');
    }
  };

  // Load progress periodically
  const loadProgress = useCallback(async () => {
    try {
      const result = await assessmentAPI.getProgress(assessmentId);
      if (result.success && result.data) {
        setProgress({
          currentModule: result.data.currentModule,
          questionsAsked: result.data.questionsAsked,
          completionRate: result.data.completionRate,
          moduleProgress: result.data.moduleProgress,
          estimatedMinutesRemaining: result.data.estimatedMinutesRemaining
        });
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }, [assessmentId]);

  // Initial load
  useEffect(() => {
    loadNextQuestion();
    loadProgress();
  }, [loadNextQuestion, loadProgress]);

  // Auto-save reminder
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused && currentValue !== null) {
        toast('Your progress is automatically saved', {
          icon: '💾',
          duration: 2000
        });
      }
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [isPaused, currentValue]);

  if (loading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-blue-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Paused</h2>
          <p className="text-gray-600 mb-6">
            Your progress has been saved. You can resume anytime to continue where you left off.
          </p>
          <button
            onClick={handlePauseResume}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Resume Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar
        currentModule={progress.currentModule}
        completionRate={progress.completionRate}
        questionsAsked={progress.questionsAsked}
        onPause={handlePauseResume}
        isPaused={isPaused}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {currentQuestion ? (
                <QuestionRenderer
                  question={currentQuestion}
                  value={currentValue}
                  onChange={setCurrentValue}
                  onSubmit={handleSubmit}
                  disabled={loading || saving}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading next question...</p>
                </div>
              )}
            </div>
            
            {/* Mobile Progress Toggle */}
            <div className="lg:hidden mt-4">
              <button
                onClick={() => setShowProgress(!showProgress)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                {showProgress ? 'Hide' : 'Show'} Progress Details
              </button>
              
              {showProgress && (
                <div className="mt-4">
                  <AssessmentProgress {...progress} />
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar Progress - Desktop */}
          <div className="hidden lg:block">
            <AssessmentProgress {...progress} />
          </div>
        </div>
      </div>
    </div>
  );
}
