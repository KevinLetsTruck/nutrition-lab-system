'use client'

import React from 'react'
import { CheckCircle, Circle, Truck, User, Target, Pill, Calendar, Shield } from 'lucide-react'

interface StreamlinedProgressProps {
  currentStep: string
  progressPercentage: number
  className?: string
}

const STEPS = [
  {
    id: 'demographics',
    title: 'Basic Info',
    icon: User,
    description: 'Name & Contact'
  },
  {
    id: 'diet',
    title: 'Current Diet',
    icon: Target,
    description: 'Diet Approach'
  },
  {
    id: 'medications',
    title: 'Medications',
    icon: Pill,
    description: 'Current Meds'
  },
  {
    id: 'goals',
    title: 'Health Goals',
    icon: Target,
    description: 'Primary Goal'
  },
  {
    id: 'truck_info',
    title: 'Truck Info',
    icon: Truck,
    description: 'Driving Details'
  },
  {
    id: 'dot_status',
    title: 'DOT Status',
    icon: Shield,
    description: 'Medical Status'
  }
]

export function StreamlinedProgress({ currentStep, progressPercentage, className = '' }: StreamlinedProgressProps) {
  const currentStepIndex = STEPS.findIndex(step => step.id === currentStep)

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">
            Step {currentStepIndex + 1} of {STEPS.length}
          </span>
          <span className="text-sm font-medium text-blue-400">
            {progressPercentage}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Mobile Step Indicators */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = step.id === currentStep
          const Icon = step.icon

          return (
            <div
              key={step.id}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isCompleted 
                  ? 'border-green-500 bg-green-500/10' 
                  : isCurrent 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 bg-gray-800/50'
                }
              `}
            >
              {/* Step Number */}
              <div className="flex items-center justify-center mb-2">
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${isCurrent 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-400'
                    }
                  `}>
                    {index + 1}
                  </div>
                )}
              </div>

              {/* Step Icon */}
              <div className="flex items-center justify-center mb-2">
                <Icon className={`
                  w-5 h-5
                  ${isCompleted 
                    ? 'text-green-400' 
                    : isCurrent 
                      ? 'text-blue-400' 
                      : 'text-gray-500'
                  }
                `} />
              </div>

              {/* Step Title */}
              <div className="text-center">
                <div className={`
                  text-xs font-medium
                  ${isCompleted 
                    ? 'text-green-400' 
                    : isCurrent 
                      ? 'text-blue-400' 
                      : 'text-gray-400'
                  }
                `}>
                  {step.title}
                </div>
              </div>

              {/* Current Step Indicator */}
              {isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          )
        })}
      </div>

      {/* Current Step Info */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">{currentStepIndex + 1}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {STEPS[currentStepIndex]?.title}
            </h3>
            <p className="text-sm text-gray-400">
              {STEPS[currentStepIndex]?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 