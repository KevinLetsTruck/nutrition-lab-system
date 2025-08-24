'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AssessmentProvider, useAssessment } from '@/components/assessment/AssessmentProvider';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { AssessmentProgress } from '@/components/assessment/AssessmentProgress';
import { Button } from '@/components/ui/button';
import { Loader2, PauseCircle, ArrowLeft } from 'lucide-react';

function AssessmentContent() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const {
    currentQuestion,
    currentModule,
    questionsAsked,
    questionsSaved,
    questionsInCurrentModule,
    questionsAnsweredInModule,
    responses,
    isLoading,
    isSaving,
    isAutoAdvance,
    startAssessment,
    submitResponse,
    pauseAssessment,
    resumeAssessment,
    goToPreviousQuestion,
    setAutoAdvance
  } = useAssessment();

  const [currentValue, setCurrentValue] = useState<any>(null);

  // Handle new assessment or resume
  useEffect(() => {
    if (assessmentId === 'new') {
      startAssessment();
    } else {
      resumeAssessment(assessmentId);
    }
  }, [assessmentId]);

  // Reset value when question changes
  useEffect(() => {
    setCurrentValue(null);
  }, [currentQuestion?.id]);

  const handleSubmit = async () => {
    if (currentValue !== null && currentValue !== '') {
      await submitResponse(currentValue);

      // Auto-advance for certain question types
      if (isAutoAdvance && currentQuestion) {
        const autoAdvanceTypes = ['YES_NO', 'MULTIPLE_CHOICE'];
        if (autoAdvanceTypes.includes(currentQuestion.type)) {
          // Small delay to show selection before advancing
          setTimeout(() => {
            setCurrentValue(null);
          }, 300);
        }
      }
    }
  };

  const handleValueChange = (value: any) => {
    setCurrentValue(value);

    // Auto-submit for certain question types when auto-advance is enabled
    if (isAutoAdvance && currentQuestion) {
      const autoSubmitTypes = ['YES_NO', 'MULTIPLE_CHOICE'];
      if (autoSubmitTypes.includes(currentQuestion.type)) {
        setTimeout(() => {
          submitResponse(value);
        }, 300);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Assessment Complete!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the assessment. Your responses have been saved.
          </p>
          <Button onClick={() => router.push(`/assessment/${assessmentId}/results`)}>
            View Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => router.push('/assessments')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </button>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAutoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                className="rounded"
              />
              Auto-advance
            </label>

            <Button
              variant="outline"
              size="sm"
              onClick={pauseAssessment}
              disabled={isSaving}
            >
              <PauseCircle className="h-4 w-4 mr-2" />
              Save & Exit
            </Button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <AssessmentProgress
            currentModule={currentModule}
            questionsInModule={questionsInCurrentModule}
            questionsAnswered={questionsAnsweredInModule}
            totalQuestionsAsked={questionsAsked}
            questionsSaved={questionsSaved}
          />
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-4 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Question {questionsAnsweredInModule + 1} of {questionsInCurrentModule}
            </span>
            {isSaving && (
              <span className="text-sm text-green-600 flex items-center">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Saving...
              </span>
            )}
          </div>

          <QuestionRenderer
            question={currentQuestion}
            value={currentValue}
            onChange={handleValueChange}
            onSubmit={handleSubmit}
            disabled={isSaving}
          />

          {/* Navigation */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={responses.length === 0 || isSaving}
            >
              Previous Question
            </Button>

            {!['YES_NO', 'MULTIPLE_CHOICE'].includes(currentQuestion.type) && (
              <Button
                onClick={handleSubmit}
                disabled={!currentValue || isSaving}
              >
                Next Question
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Your responses are automatically saved as you progress.</p>
          <p>You can pause and resume this assessment at any time.</p>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <AssessmentProvider>
      <AssessmentContent />
    </AssessmentProvider>
  );
}
