'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, Clock, Target, AlertCircle } from 'lucide-react';
import { StructuredQuestion } from '@/components/assessment/StructuredQuestion';
import { Response } from '@/lib/assessment/question-selector';
import { DetectedPattern } from '@/lib/assessment/pattern-matcher';
import { apiClient } from '@/lib/api-client';
import { APIRequestError } from '@/lib/error-handler';

const ASSESSMENT_SECTIONS = [
  { id: 'energy', name: 'Energy & Fatigue', estimatedQuestions: 8 },
  { id: 'sleep', name: 'Sleep & Recovery', estimatedQuestions: 6 },
  { id: 'digestive', name: 'Digestive Health', estimatedQuestions: 7 },
  { id: 'stress', name: 'Stress & Mood', estimatedQuestions: 6 },
  { id: 'pain', name: 'Pain & Inflammation', estimatedQuestions: 5 },
  { id: 'metabolic', name: 'Metabolic Health', estimatedQuestions: 5 }
];

export default function StructuredAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  
  const [currentQuestion, setCurrentQuestion] = useState<StructuredQuestion | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [detectedPatterns, setDetectedPatterns] = useState<DetectedPattern[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questionsInSection, setQuestionsInSection] = useState(0);
  const [showSectionComplete, setShowSectionComplete] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [underreportingRisk, setUnderreportingRisk] = useState(0);
  

  
  const currentSection = ASSESSMENT_SECTIONS[currentSectionIndex];
  const totalEstimatedQuestions = ASSESSMENT_SECTIONS.reduce((sum, s) => sum + s.estimatedQuestions, 0);
  const questionsAnswered = responses.length;
  const estimatedProgress = Math.min((questionsAnswered / totalEstimatedQuestions) * 100, 95);
  const estimatedTimeRemaining = Math.max(1, Math.round((totalEstimatedQuestions - questionsAnswered) * 0.5));
  
  // Initialize assessment
  useEffect(() => {
    const initAssessment = async () => {
      try {
        const { assessmentId } = await apiClient.post('/api/structured-assessment', {
          action: 'start',
          clientId
        });
        
        setAssessmentId(assessmentId);
        
        // Get first question from API
        const { question } = await apiClient.post('/api/structured-assessment', {
          action: 'getQuestion',
          section: currentSection.id,
          responses: [],
          patterns: []
        });
        
        if (question) {
          setCurrentQuestion(question);
        }
      } catch (error) {
        console.error('Failed to initialize assessment:', error);
        
        if (error instanceof APIRequestError) {
          // Show detailed error in development
          if (process.env.NODE_ENV === 'development') {
            console.error('Error details:', error.details);
          }
          
          // Show user-friendly error
          alert(`Failed to start assessment: ${error.message}`);
        } else {
          alert('An unexpected error occurred. Please try again.');
        }
      }
    };
    
    initAssessment();
  }, [clientId, currentSection.id]);
  
  // Handle response selection
  const handleResponse = useCallback(async (value: number | string) => {
    if (!currentQuestion || isLoading) return;
    
    setIsLoading(true);
    
    // Store response
    const newResponse: Response = {
      questionId: currentQuestion.id,
      value,
      timestamp: new Date()
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);
    setQuestionsInSection(questionsInSection + 1);
    
    // Save response to database
    await fetch('/api/structured-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'respond',
        assessmentId,
        questionId: currentQuestion.id,
        value,
        section: currentSection.id
      })
    });
    
    // Detect patterns via API
    const patternResponse = await fetch('/api/structured-assessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'detectPatterns',
        responses: updatedResponses
      })
    });
    
    if (patternResponse.ok) {
      const { patterns } = await patternResponse.json();
      setDetectedPatterns(patterns);
      
      // Calculate underreporting locally for now
      const mildResponses = updatedResponses.filter(r => Number(r.value) === 1).length;
      const underreporting = updatedResponses.length > 0 
        ? (mildResponses / updatedResponses.length > 0.7 && patterns.length > 0 ? 0.8 : 0.2)
        : 0;
      setUnderreportingRisk(underreporting);
    }
    
    // Check if we should validate or continue
    if (questionsInSection >= 5 && underreportingRisk > 0.7 && !showValidation) {
      setShowValidation(true);
      setIsLoading(false);
      return;
    }
    
    // Check if section is complete
    if (questionsInSection >= currentSection.estimatedQuestions - 1) {
      setShowSectionComplete(true);
      setIsLoading(false);
      return;
    }
    
    // Get next question from API
    try {
      const questionResponse = await fetch('/api/structured-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getQuestion',
          section: currentSection.id,
          responses: updatedResponses,
          patterns: detectedPatterns
        })
      });
      
      if (questionResponse.ok) {
        const { question } = await questionResponse.json();
        if (question) {
          setCurrentQuestion(question);
        } else {
        // Move to next section if no more questions
        if (currentSectionIndex < ASSESSMENT_SECTIONS.length - 1) {
          setCurrentSectionIndex(currentSectionIndex + 1);
          setQuestionsInSection(0);
          setShowSectionComplete(false);
          
          // Get first question of new section from API
          fetch('/api/structured-assessment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'getQuestion',
              section: ASSESSMENT_SECTIONS[currentSectionIndex + 1].id,
              responses: [],
              patterns: []
            })
          })
            .then(res => res.json())
            .then(({ question }) => setCurrentQuestion(question));
        } else {
          // Assessment complete - will be handled by completeAssessment
          setShowSectionComplete(true);
        }
      }
    }
    } catch (error) {
      console.error('Error getting next question:', error);
    }
    
    setIsLoading(false);
  }, [currentQuestion, responses, questionsInSection, currentSection, assessmentId, showValidation, detectedPatterns, currentSectionIndex, isLoading, underreportingRisk]);
  
  const completeAssessment = useCallback(async () => {
    try {
      await fetch('/api/structured-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          assessmentId,
          patterns: detectedPatterns
        })
      });
      
      router.push(`/reports/structured-analysis/${assessmentId}`);
    } catch (error) {
      console.error('Error completing assessment:', error);
    }
  }, [assessmentId, detectedPatterns, router]);
  
  const moveToNextSection = useCallback(() => {
    if (currentSectionIndex < ASSESSMENT_SECTIONS.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setQuestionsInSection(0);
      setShowSectionComplete(false);
      
      // Get first question of new section from API
      fetch('/api/structured-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getQuestion',
          section: ASSESSMENT_SECTIONS[currentSectionIndex + 1].id,
          responses: [],
          patterns: []
        })
      })
        .then(res => res.json())
        .then(({ question }) => setCurrentQuestion(question));
    } else {
      // Assessment complete
      completeAssessment();
    }
  }, [currentSectionIndex, completeAssessment]);
  
  return (
    <div className="min-h-screen bg-[#1e1b4b] pb-20">
      {/* Header */}
      <div className="bg-[#312e81] border-b border-[#4338ca] sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white hover:bg-[#4338ca]/20"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{estimatedTimeRemaining} min remaining</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{questionsAnswered} answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="bg-[#312e81] border-b border-[#4338ca]">
        <div className="container mx-auto px-4 py-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-white">{currentSection.name}</span>
              <span className="text-gray-300">{Math.round(estimatedProgress)}% complete</span>
            </div>
            <div className="w-full bg-[#1e1b4b] rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-[#10b981] transition-all duration-300"
                style={{ width: `${estimatedProgress}%` }}
              />
            </div>
          </div>
          
          {/* Pattern Detection Indicator */}
          {detectedPatterns.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>Patterns detected: {detectedPatterns.map(p => p.displayName).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {showSectionComplete ? (
          <SectionCompleteCard
            section={currentSection}
            responses={responses.filter(r => questionsInSection)}
            patterns={detectedPatterns}
            onContinue={moveToNextSection}
          />
        ) : showValidation ? (
          <ValidationCard
            patterns={detectedPatterns}
            onContinue={() => {
              setShowValidation(false);
              handleResponse(responses[responses.length - 1].value);
            }}
            onReview={() => {
              // Implement review logic
              setShowValidation(false);
            }}
          />
        ) : currentQuestion ? (
          <StructuredQuestion
            question={currentQuestion}
            onResponse={handleResponse}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-400">Loading question...</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Section Complete Component
function SectionCompleteCard({ section, responses, patterns, onContinue }: any) {
  return (
    <Card className="p-8 text-center max-w-2xl mx-auto">
      <div className="text-green-600 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-bold mb-2">{section.name} - Complete!</h2>
      <p className="text-gray-600 mb-6">Great job! Let&apos;s move on to the next section.</p>
      
      {patterns.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-amber-900 mb-2">Patterns Detected:</h3>
          {patterns.map((pattern: DetectedPattern) => (
            <div key={pattern.name} className="mb-2">
              <span className="font-medium">{pattern.displayName}</span>
              <span className="text-sm text-amber-700 ml-2">
                ({Math.round(pattern.confidence * 100)}% confidence)
              </span>
            </div>
          ))}
        </div>
      )}
      
      <Button onClick={onContinue} size="lg">
        Continue Assessment
      </Button>
    </Card>
  );
}

// Validation Component
function ValidationCard({ patterns, onContinue, onReview }: any) {
  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="text-amber-600 mb-4">
        <AlertCircle className="w-12 h-12 mx-auto" />
      </div>
      
      <h2 className="text-xl font-bold mb-4 text-center">Quick Pattern Check</h2>
      
      <p className="text-gray-700 mb-6">
        Based on your responses, I&apos;m noticing some patterns that often occur together. 
        Many people experiencing these symptoms also report additional related issues.
      </p>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="font-medium mb-2">Common related symptoms:</p>
        <ul className="list-disc list-inside text-gray-700">
          <li>Difficulty concentrating or brain fog</li>
          <li>Mood changes or irritability</li>
          <li>Digestive issues</li>
        </ul>
      </div>
      
      <p className="text-gray-700 mb-6">
        You rated most symptoms as mild. Does this accurately reflect your experience, 
        or would you like to review any of your responses?
      </p>
      
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onReview}>
          Review My Responses
        </Button>
        <Button onClick={onContinue}>
          My Responses Are Accurate
        </Button>
      </div>
    </Card>
  );
}