'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface OnboardingReviewProps {
  data: any
  onComplete: () => void
  isLoading: boolean
}

export function OnboardingReview({ data, onComplete, isLoading }: OnboardingReviewProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl">
          <CheckCircle className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Review & Submit
        </h2>
        <p className="text-dark-300">
          Review all your information and complete the onboarding process.
        </p>
      </div>

      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">
            Review Step
          </h3>
          <p className="text-dark-300">
            This step will show a summary of all collected information and allow final submission.
          </p>
          <Button 
            onClick={onComplete} 
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Complete Onboarding (Placeholder)'
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
} 