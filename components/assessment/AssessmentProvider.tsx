'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AssessmentQuestion, ClientResponse, ModuleType } from '@/lib/assessment/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AssessmentContextType {
  // State
  assessmentId: string | null;
  currentQuestion: AssessmentQuestion | null;
  currentModule: ModuleType;
  responses: ClientResponse[];
  isLoading: boolean;
  isAutoAdvance: boolean;
  isSaving: boolean;
  
  // Stats
  questionsAsked: number;
  questionsSaved: number;
  questionsInCurrentModule: number;
  questionsAnsweredInModule: number;
  
  // Actions
  startAssessment: () => Promise<void>;
  submitResponse: (value: any) => Promise<void>;
  pauseAssessment: () => Promise<void>;
  resumeAssessment: (id: string) => Promise<void>;
  goToPreviousQuestion: () => Promise<void>;
  
  // Settings
  setAutoAdvance: (value: boolean) => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  // Core state
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [currentModule, setCurrentModule] = useState<ModuleType>('SCREENING');
  const [responses, setResponses] = useState<ClientResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoAdvance, setAutoAdvance] = useState(true);
  
  // Stats
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [questionsSaved, setQuestionsSaved] = useState(0);
  const [questionsInCurrentModule, setQuestionsInCurrentModule] = useState(75);
  const [questionsAnsweredInModule, setQuestionsAnsweredInModule] = useState(0);

  // Auto-save to localStorage for recovery
  useEffect(() => {
    if (assessmentId) {
      const state = {
        assessmentId,
        currentModule,
        questionsAsked,
        questionsSaved,
        questionsAnsweredInModule,
        questionsInCurrentModule
      };
      localStorage.setItem('assessment-state', JSON.stringify(state));
    }
  }, [assessmentId, currentModule, questionsAsked, questionsSaved, questionsAnsweredInModule, questionsInCurrentModule]);

  const startAssessment = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/assessment/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to start assessment');
      
      const data = await response.json();
      
      if (data.success) {
        setAssessmentId(data.data.assessmentId);
        setCurrentQuestion(data.data.firstQuestion);
        setCurrentModule(data.data.module || 'SCREENING');
        setQuestionsAsked(1);
        setQuestionsSaved(0);
        setQuestionsAnsweredInModule(0);
        setQuestionsInCurrentModule(75); // Screening module
        
        toast.success('Assessment started successfully');
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitResponse = useCallback(async (value: any) => {
    if (!assessmentId || !currentQuestion) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          value,
          module: currentModule
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit response');
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setResponses(prev => [...prev, {
          id: `response-${Date.now()}`,
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          questionModule: currentModule,
          responseType: currentQuestion.type,
          responseValue: value,
          answeredAt: new Date()
        } as ClientResponse]);
        
        // Update stats
        setQuestionsAnsweredInModule(prev => prev + 1);
        
        if (data.data.nextQuestion) {
          setCurrentQuestion(data.data.nextQuestion);
          setQuestionsAsked(prev => prev + 1);
          
          // Check if module changed
          if (data.data.module && data.data.module !== currentModule) {
            setCurrentModule(data.data.module);
            setQuestionsInCurrentModule(data.data.questionsInModule || 50);
            setQuestionsAnsweredInModule(0);
            toast.info(`Moving to ${data.data.module} module`);
          }
        } else {
          // Assessment complete
          setCurrentQuestion(null);
          toast.success('Assessment completed! Generating your analysis...');
          router.push(`/assessment/${assessmentId}/results`);
        }
        
        // Update questions saved by AI
        if (data.data.questionsSaved) {
          setQuestionsSaved(data.data.questionsSaved);
        }
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to save response');
    } finally {
      setIsSaving(false);
    }
  }, [assessmentId, currentQuestion, currentModule, router]);

  const pauseAssessment = useCallback(async () => {
    if (!assessmentId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/pause`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to pause assessment');
      
      toast.success('Assessment saved. You can resume anytime.');
      router.push('/assessments');
    } catch (error) {
      console.error('Error pausing assessment:', error);
      toast.error('Failed to pause assessment');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId, router]);

  const resumeAssessment = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/assessment/${id}/resume`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to resume assessment');
      
      const data = await response.json();
      
      if (data.success) {
        setAssessmentId(id);
        setCurrentQuestion(data.data.currentQuestion);
        setCurrentModule(data.data.module);
        setResponses(data.data.responses || []);
        setQuestionsAsked(data.data.questionsAsked || 0);
        setQuestionsSaved(data.data.questionsSaved || 0);
        setQuestionsAnsweredInModule(data.data.questionsAnsweredInModule || 0);
        setQuestionsInCurrentModule(data.data.questionsInCurrentModule || 75);
        
        toast.success('Assessment resumed');
      }
    } catch (error) {
      console.error('Error resuming assessment:', error);
      toast.error('Failed to resume assessment');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToPreviousQuestion = useCallback(async () => {
    if (!assessmentId || responses.length === 0) return;
    
    setIsLoading(true);
    try {
      // Get the last response
      const lastResponse = responses[responses.length - 1];
      
      const response = await fetch(`/api/assessment/${assessmentId}/previous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastQuestionId: lastResponse.questionId
        }),
      });
      
      if (!response.ok) throw new Error('Failed to go to previous question');
      
      const data = await response.json();
      
      if (data.success) {
        // Remove last response
        setResponses(prev => prev.slice(0, -1));
        setCurrentQuestion(data.data.previousQuestion);
        setQuestionsAnsweredInModule(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error going to previous question:', error);
      toast.error('Unable to go back');
    } finally {
      setIsLoading(false);
    }
  }, [assessmentId, responses]);

  const value = {
    // State
    assessmentId,
    currentQuestion,
    currentModule,
    responses,
    isLoading,
    isAutoAdvance,
    isSaving,
    
    // Stats
    questionsAsked,
    questionsSaved,
    questionsInCurrentModule,
    questionsAnsweredInModule,
    
    // Actions
    startAssessment,
    submitResponse,
    pauseAssessment,
    resumeAssessment,
    goToPreviousQuestion,
    
    // Settings
    setAutoAdvance,
  };

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
}
