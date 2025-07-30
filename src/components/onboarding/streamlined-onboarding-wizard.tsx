'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle } from 'lucide-react'
import { StreamlinedDemographics } from './steps/streamlined-demographics'
import { StreamlinedDiet } from './steps/streamlined-diet'
import { StreamlinedMedications } from './steps/streamlined-medications'
import { StreamlinedGoals } from './steps/streamlined-goals'
import { StreamlinedTruckInfo } from './steps/streamlined-truck-info'
import { StreamlinedDotStatus } from './steps/streamlined-dot-status'
import { StreamlinedProgress } from './streamlined-progress'

interface StreamlinedOnboardingWizardProps {
  clientId?: string
  onComplete?: (data: any) => void
}

export function StreamlinedOnboardingWizard({ 
  clientId, 
  onComplete 
}: StreamlinedOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState('demographics')
  const [onboardingData, setOnboardingData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = {
      demographics: JSON.parse(localStorage.getItem('demographicsData') || '{}'),
      diet: JSON.parse(localStorage.getItem('dietData') || '{}'),
      medications: JSON.parse(localStorage.getItem('medicationsData') || '{}'),
      goals: JSON.parse(localStorage.getItem('goalsData') || '{}'),
      truckInfo: JSON.parse(localStorage.getItem('truckInfoData') || '{}'),
      dotStatus: JSON.parse(localStorage.getItem('dotStatusData') || '{}')
    }
    setOnboardingData(savedData)
  }, [])

  const steps = [
    { id: 'demographics', title: 'Basic Information', description: 'Tell us about yourself' },
    { id: 'diet', title: 'Current Diet', description: 'What diet are you currently following?' },
    { id: 'medications', title: 'Medications & Supplements', description: 'List your current medications and supplements' },
    { id: 'goals', title: 'Health Goals', description: 'What is your primary health goal?' },
    { id: 'truck_info', title: 'Truck Driver Info', description: 'Tell us about your driving schedule' },
    { id: 'dot_status', title: 'DOT Medical Status', description: 'What is your DOT medical status?' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100)

  const handleNext = (stepData: any) => {
    // Update onboarding data
    const updatedData = {
      ...onboardingData,
      [currentStep]: stepData
    }
    setOnboardingData(updatedData)

    // Move to next step
    const nextStepIndex = currentStepIndex + 1
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id)
    } else {
      // Complete onboarding
      handleComplete(stepData)
    }
  }

  const handleBack = () => {
    const prevStepIndex = currentStepIndex - 1
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex].id)
    }
  }

  const handleComplete = async (finalStepData: any) => {
    setIsLoading(true)
    
    try {
      // Combine all data
      const completeData = {
        ...onboardingData,
        [currentStep]: finalStepData,
        clientId,
        completedAt: new Date().toISOString()
      }

      // Store complete data
      localStorage.setItem('completeOnboardingData', JSON.stringify(completeData))
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete(completeData)
      }
      
      setIsCompleted(true)
      
      // Optional: Clear individual step data
      localStorage.removeItem('demographicsData')
      localStorage.removeItem('dietData')
      localStorage.removeItem('medicationsData')
      localStorage.removeItem('goalsData')
      localStorage.removeItem('truckInfoData')
      localStorage.removeItem('dotStatusData')
      
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderCurrentStep = () => {
    const stepData = onboardingData[currentStep] || {}

    switch (currentStep) {
      case 'demographics':
        return (
          <StreamlinedDemographics
            onNext={handleNext}
            initialData={stepData}
          />
        )
      case 'diet':
        return (
          <StreamlinedDiet
            onNext={handleNext}
            onBack={handleBack}
            initialData={stepData}
          />
        )
      case 'medications':
        return (
          <StreamlinedMedications
            onNext={handleNext}
            onBack={handleBack}
            initialData={stepData}
          />
        )
      case 'goals':
        return (
          <StreamlinedGoals
            onNext={handleNext}
            onBack={handleBack}
            initialData={stepData}
          />
        )
      case 'truck_info':
        return (
          <StreamlinedTruckInfo
            onNext={handleNext}
            onBack={handleBack}
            initialData={stepData}
          />
        )
      case 'dot_status':
        return (
          <StreamlinedDotStatus
            onNext={handleNext}
            onBack={handleBack}
            initialData={stepData}
          />
        )
      default:
        return <div>Step not found</div>
    }
  }

  if (isCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">
            Onboarding Complete! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <p className="text-gray-300 mb-6">
            Thank you for completing your onboarding! Your information has been saved and we'll be in touch soon.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-green-600 hover:bg-green-700"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <StreamlinedProgress
        currentStep={currentStep}
        steps={steps}
        progressPercentage={progressPercentage}
      />

      {/* Current Step */}
      <div className="mt-8">
        {renderCurrentStep()}
      </div>
    </div>
  )
} 