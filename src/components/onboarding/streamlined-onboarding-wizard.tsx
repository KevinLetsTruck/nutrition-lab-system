'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
import { ClientOnboardingService } from '@/lib/client-onboarding-service'
import { CompleteOnboardingData } from '@/lib/onboarding-schemas'

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface StreamlinedOnboardingWizardProps {
  clientId: string
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
          // Verify session is still valid
          try {
            const sessionData = await onboardingService.getSession(existingSessionToken)
            if (sessionData && !sessionData.is_completed) {
              setSessionToken(existingSessionToken)
              // Get the onboarding data separately
              const onboardingData = await onboardingService.getOnboardingData(existingSessionToken)
              setOnboardingData(onboardingData || {})
              setCurrentStep(sessionData.current_step || 'demographics')
              setIsLoading(false)
              return
            }
          } catch (err) {
            console.log('Existing session invalid, creating new one')
          }
        }

        // Create new session
        const newSession = await onboardingService.createSession(clientId)
        setSessionToken(newSession.session_token)
        localStorage.setItem('onboarding_session_token', newSession.session_token)
      } catch (err) {
        setError('Failed to initialize onboarding session. Please try again.')
        console.error('Session initialization error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializeSession()
  }, [clientId, onboardingService])

  // Debounced auto-save functionality - FIXED: Now saves 3 seconds after user stops interacting
  const debouncedAutoSave = useCallback(
    (data: Partial<CompleteOnboardingData>) => {
      const timeoutId = setTimeout(async () => {
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
      }, 3000) // FIXED: Increased from 1 second to 3 seconds
      
      return () => clearTimeout(timeoutId)
    },
    [sessionToken, currentStep, onboardingService]
  )

  // Handle step navigation
  const handleNext = async (stepData: any) => {
    if (!sessionToken) return

    try {
      setIsLoading(true)
      setError(null)

      // Update data
      const newData = { ...onboardingData, ...stepData }
      setOnboardingData(newData)

      // Save to database immediately when user clicks Next
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

  // FIXED: Debounced save function - only triggers after user stops typing
  const handleSave = async (stepData: any) => {
    // Update local state immediately for responsive UI
    const newData = { ...onboardingData, ...stepData }
    setOnboardingData(newData)
    
    // Trigger debounced save
    debouncedAutoSave(newData)
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
            Thank you for completing your profile. We{`'`}ll be in touch soon with your personalized nutrition plan.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary-600 hover:bg-primary-700"
          >
            Return to Home
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

        {/* Auto-save indicator - FIXED: Only shows when actually saving */}
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