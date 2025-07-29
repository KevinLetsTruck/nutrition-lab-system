'use client'

import React, { useState, useEffect } from 'react'

import { OnboardingProgress } from './onboarding-progress'
import { OnboardingWelcome } from './steps/onboarding-welcome'
import { OnboardingPersonal } from './steps/onboarding-personal'
import { OnboardingHealthHistory } from './steps/onboarding-health-history'
import { OnboardingMedications } from './steps/onboarding-medications'
import { OnboardingLifestyle } from './steps/onboarding-lifestyle'
import { OnboardingGoals } from './steps/onboarding-goals'
import { OnboardingUploads } from './steps/onboarding-uploads'
import { OnboardingReview } from './steps/onboarding-review'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, CheckCircle, Shield, Clock, User } from 'lucide-react'

export interface OnboardingData {
  personal: any
  healthHistory: any
  medications: any
  lifestyle: any
  goals: any
  uploads: any
}

export interface OnboardingStepData {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  estimatedTime: string
  required: boolean
}

const ONBOARDING_STEPS: OnboardingStepData[] = [
  {
    id: 'welcome',
    title: 'Welcome & Instructions',
    description: 'Learn about the onboarding process and what to expect',
    icon: Shield,
    estimatedTime: '2 min',
    required: true
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Basic contact and demographic information',
    icon: User,
    estimatedTime: '3 min',
    required: true
  },
  {
    id: 'healthHistory',
    title: 'Health History',
    description: 'Current symptoms, medical history, and family background',
    icon: CheckCircle,
    estimatedTime: '8 min',
    required: true
  },
  {
    id: 'medications',
    title: 'Medications & Supplements',
    description: 'Current medications, supplements, and treatment history',
    icon: Clock,
    estimatedTime: '5 min',
    required: true
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Environment',
    description: 'Sleep, stress, exercise, and environmental factors',
    icon: User,
    estimatedTime: '6 min',
    required: true
  },
  {
    id: 'goals',
    title: 'Goals & Priorities',
    description: 'Your health goals and what you want to achieve',
    icon: CheckCircle,
    estimatedTime: '4 min',
    required: true
  },
  {
    id: 'uploads',
    title: 'File Uploads',
    description: 'Upload lab reports, medical records, and other documents',
    icon: User,
    estimatedTime: '5 min',
    required: false
  },
  {
    id: 'review',
    title: 'Review & Submit',
    description: 'Review all information and complete onboarding',
    icon: CheckCircle,
    estimatedTime: '3 min',
    required: true
  }
]

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personal: {},
    healthHistory: {},
    medications: {},
    lifestyle: {},
    goals: {},
    uploads: {}
  })
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const saveProgress = async () => {
    if (!sessionToken) return

    try {
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionToken,
          step: ONBOARDING_STEPS[currentStep].id,
          data: onboardingData,
          completedSteps: Array.from(completedSteps)
        })
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (sessionToken && Object.keys(onboardingData).some(key => Object.keys(onboardingData[key as keyof OnboardingData]).length > 0)) {
        saveProgress()
      }
    }, 30000)

    return () => clearInterval(autoSaveInterval)
  }, [onboardingData, sessionToken, saveProgress])

  // Initialize session on component mount
  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/onboarding/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSessionToken(data.sessionToken)
        
        // Load existing progress if any
        if (data.existingData) {
          setOnboardingData(data.existingData)
          setCompletedSteps(new Set(data.completedSteps || []))
          setCurrentStep(data.currentStep || 0)
        }
      }
    } catch (error) {
      console.error('Failed to initialize onboarding session:', error)
    }
  }



  const updateStepData = (stepId: string, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId as keyof OnboardingData], ...data }
    }))
  }

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
  }

  const goToNextStep = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Save current step data
      await saveProgress()
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < ONBOARDING_STEPS.length) {
      setCurrentStep(stepIndex)
    }
  }

  const renderCurrentStep = () => {
    const step = ONBOARDING_STEPS[currentStep]
    
    switch (step.id) {
      case 'welcome':
        return (
          <OnboardingWelcome
            onComplete={() => {
              markStepComplete('welcome')
              goToNextStep()
            }}
          />
        )
      
      case 'personal':
        return (
          <OnboardingPersonal
            data={onboardingData.personal}
            onUpdate={(data) => updateStepData('personal', data)}
            onComplete={() => {
              markStepComplete('personal')
              goToNextStep()
            }}
          />
        )
      
      case 'healthHistory':
        return (
          <OnboardingHealthHistory
            data={onboardingData.healthHistory}
            onUpdate={(data) => updateStepData('healthHistory', data)}
            onComplete={() => {
              markStepComplete('healthHistory')
              goToNextStep()
            }}
          />
        )
      
      case 'medications':
        return (
          <OnboardingMedications
            data={onboardingData.medications}
            onUpdate={(data) => updateStepData('medications', data)}
            onComplete={() => {
              markStepComplete('medications')
              goToNextStep()
            }}
          />
        )
      
      case 'lifestyle':
        return (
          <OnboardingLifestyle
            data={onboardingData.lifestyle}
            onUpdate={(data) => updateStepData('lifestyle', data)}
            onComplete={() => {
              markStepComplete('lifestyle')
              goToNextStep()
            }}
          />
        )
      
      case 'goals':
        return (
          <OnboardingGoals
            data={onboardingData.goals}
            onUpdate={(data) => updateStepData('goals', data)}
            onComplete={() => {
              markStepComplete('goals')
              goToNextStep()
            }}
          />
        )
      
      case 'uploads':
        return (
          <OnboardingUploads
            data={onboardingData.uploads}
            onUpdate={(data) => updateStepData('uploads', data)}
            onComplete={() => {
              markStepComplete('uploads')
              goToNextStep()
            }}
          />
        )
      
      case 'review':
        return (
          <OnboardingReview
            data={onboardingData}
            onComplete={async () => {
              setIsLoading(true)
              try {
                await fetch('/api/onboarding/complete', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    sessionToken,
                    data: onboardingData
                  })
                })
                
                markStepComplete('review')
                // Redirect to completion page or dashboard
                window.location.href = '/onboarding/complete'
              } catch (error) {
                console.error('Failed to complete onboarding:', error)
              } finally {
                setIsLoading(false)
              }
            }}
            isLoading={isLoading}
          />
        )
      
      default:
        return <div>Step not found</div>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Client Onboarding
        </h1>
        <p className="text-dark-300">
          Complete your comprehensive health assessment to get started with personalized care
        </p>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress
        steps={ONBOARDING_STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      {/* Main Content */}
      <Card className="bg-dark-800/50 border-dark-700">
        <div className="p-6">
          {renderCurrentStep()}
        </div>
      </Card>

      {/* Navigation */}
      {ONBOARDING_STEPS[currentStep].id !== 'welcome' && ONBOARDING_STEPS[currentStep].id !== 'review' && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="text-sm text-dark-400">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>

          <Button
            onClick={goToNextStep}
            disabled={!completedSteps.has(ONBOARDING_STEPS[currentStep].id)}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
} 