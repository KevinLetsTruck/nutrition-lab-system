'use client'

import React from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'
import { OnboardingStepData } from './onboarding-wizard'

interface OnboardingProgressProps {
  steps: OnboardingStepData[]
  currentStep: number
  completedSteps: Set<string>
  onStepClick: (stepIndex: number) => void
}

export function OnboardingProgress({ 
  steps, 
  currentStep, 
  completedSteps, 
  onStepClick 
}: OnboardingProgressProps) {
  return (
    <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id)
          const isCurrent = index === currentStep
          const isClickable = isCompleted || index <= currentStep + 1

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                isCurrent 
                  ? 'bg-primary-600/20 border border-primary-500/30' 
                  : isClickable 
                    ? 'hover:bg-dark-700/50 cursor-pointer' 
                    : 'opacity-50'
              }`}
              onClick={() => isClickable && onStepClick(index)}
            >
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-600 text-white' 
                  : isCurrent 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dark-600 text-dark-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${
                    isCurrent ? 'text-white' : 'text-dark-300'
                  }`}>
                    {step.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs text-dark-400">
                    <Clock className="w-3 h-3" />
                    <span>{step.estimatedTime}</span>
                  </div>
                </div>
                <p className="text-xs text-dark-400 mt-1">
                  {step.description}
                </p>
              </div>

              {/* Step Number */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                isCompleted 
                  ? 'bg-green-600 text-white' 
                  : isCurrent 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dark-600 text-dark-400'
              }`}>
                {index + 1}
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-dark-600">
        <div className="flex items-center justify-between text-sm">
          <span className="text-dark-300">
            Progress: {completedSteps.size} of {steps.length} steps completed
          </span>
          <span className="text-primary-400 font-medium">
            {Math.round((completedSteps.size / steps.length) * 100)}% Complete
          </span>
        </div>
        <div className="mt-2 w-full bg-dark-600 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
} 