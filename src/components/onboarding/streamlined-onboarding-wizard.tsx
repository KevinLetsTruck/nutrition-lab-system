'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { StreamlinedProgress } from './streamlined-progress'
import { StreamlinedDemographics } from './steps/streamlined-demographics'
import { StreamlinedDiet } from './steps/streamlined-diet'
import { StreamlinedMedications } from './steps/streamlined-medications'
import { StreamlinedGoals } from './steps/streamlined-goals'
import { StreamlinedTruckInfo } from './steps/streamlined-truck-info'
import { StreamlinedDotStatus } from './steps/streamlined-dot-status'
import { CompleteOnboardingData } from '@/lib/onboarding-schemas'
import { ClientOnboardingService } from '@/lib/client-onboarding-service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

interface StreamlinedOnboardingWizardProps {
  clientId?: string
  onComplete?: (data: CompleteOnboardingData) => void
}

export function StreamlinedOnboardingWizard({ 
  clientId, 
  onComplete 
}: StreamlinedOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState('demographics')
  const [onboardingData, setOnboardingData] = useState<Partial<CompleteOnboardingData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const onboardingService = useMemo(() => new ClientOnboardingService(), [])

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to get existing session from localStorage
        const existingSessionToken = localStorage.getItem('onboarding_session_token')
        
        if (existingSessionToken) {
          const existingSession = await onboardingService.getSession(existingSessionToken)
          
          if (existingSession && !onboardingService.isSessionExpired(existingSession)) {
            // Resume existing session
            setSessionToken(existingSession.session_token)
            setCurrentStep(existingSession.current_step)
            
            // Load existing data
            const data = await onboardingService.getOnboardingData(existingSession.session_token)
            if (data) {
              setOnboardingData(data)
            }
          } else {
            // Session expired, create new one
            localStorage.removeItem('onboarding_session_token')
            const session = await onboardingService.createSession(clientId)
            setSessionToken(session.session_token)
            localStorage.setItem('onboarding_session_token', session.session_token)
          }
        } else {
          // Create new session
          const session = await onboardingService.createSession(clientId)
          setSessionToken(session.session_token)
          localStorage.setItem('onboarding_session_token', session.session_token)
        }
      } catch (err) {
        setError('Failed to initialize onboarding session. Please try again.')
        console.error('Session initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [clientId, onboardingService])

  // Auto-save functionality
  const autoSave = useCallback(async (data: Partial<CompleteOnboardingData>) => {
    if (!sessionToken) return

    try {
      setIsSaving(true)
      await onboardingService.saveStepData(sessionToken, currentStep, data)
      await onboardingService.updateSessionActivity(sessionToken)
    } catch (err) {
      console.error('Auto-save error:', err)
      // Don't show error to user for auto-save failures
    } finally {
      setIsSaving(false)
    }
  }, [sessionToken, currentStep, onboardingService])

  // Handle step navigation
  const handleNext = async (stepData: any) => {
    if (!sessionToken) return

    try {
      setIsLoading(true)
      setError(null)

      // Update data
      const newData = { ...onboardingData, ...stepData }
      setOnboardingData(newData)

      // Save to database
      await onboardingService.saveStepData(sessionToken, currentStep, stepData)
      await onboardingService.updateSessionActivity(sessionToken)

      // Move to next step
      const nextStep = onboardingService.getNextStep(currentStep)
      if (nextStep) {
        setCurrentStep(nextStep)
      }
    } catch (err) {
      setError('Failed to save progress. Please try again.')
      console.error('Step navigation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    const previousStep = onboardingService.getPreviousStep(currentStep)
    if (previousStep) {
      setCurrentStep(previousStep)
    }
  }

  const handleSave = async (stepData: any) => {
    await autoSave(stepData)
  }

  const handleComplete = async (stepData: any) => {
    if (!sessionToken) return

    try {
      setIsLoading(true)
      setError(null)

      // Update data
      const newData = { ...onboardingData, ...stepData }
      setOnboardingData(newData)

      // Complete onboarding
      await onboardingService.completeOnboarding(sessionToken, clientId)
      localStorage.removeItem('onboarding_session_token')

      setIsCompleted(true)

      // Call completion callback
      if (onComplete) {
        onComplete(newData as CompleteOnboardingData)
      }
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.')
      console.error('Completion error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress
  const progressPercentage = onboardingService.calculateProgress(currentStep)

  // Render loading state
  if (isLoading && !sessionToken) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Card className="p-8 bg-gray-900 border-gray-700 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Setting up your onboarding...
          </h2>
          <p className="text-gray-400">
            Please wait while we prepare your personalized experience.
          </p>
        </Card>
      </div>
    )
  }

  // Render completion state
  if (isCompleted) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Card className="p-8 bg-gray-900 border-gray-700 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Onboarding Complete!
          </h2>
          <p className="text-gray-400 mb-6">
            Thank you for completing your streamlined onboarding. We&apos;ll review your information and get back to you soon.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <Card className="p-8 bg-gray-900 border-gray-700 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-400 mb-6">
            {error}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  // Render current step
  const renderCurrentStep = () => {
    const stepProps = {
      initialData: onboardingData,
      onNext: handleNext,
      onSave: handleSave,
      onBack: handleBack,
      isLoading: isLoading || isSaving
    }

    switch (currentStep) {
      case 'demographics':
        return <StreamlinedDemographics {...stepProps} />
      case 'diet':
        return <StreamlinedDiet {...stepProps} />
      case 'medications':
        return <StreamlinedMedications {...stepProps} />
      case 'goals':
        return <StreamlinedGoals {...stepProps} />
      case 'truck_info':
        return <StreamlinedTruckInfo {...stepProps} />
      case 'dot_status':
        return <StreamlinedDotStatus {...stepProps} onComplete={handleComplete} />
      default:
        return <StreamlinedDemographics {...stepProps} />
    }
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            FNTP Client Onboarding
          </h1>
          <p className="text-gray-400">
            Streamlined 5-10 minute process for truck drivers
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <StreamlinedProgress 
            currentStep={currentStep}
            progressPercentage={progressPercentage}
          />
        </div>

        {/* Current Step */}
        <div className="flex justify-center">
          {renderCurrentStep()}
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Saving...</span>
          </div>
        )}
      </div>
    </div>
  )
} 