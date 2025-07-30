'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalsSchema, GoalsData } from '@/lib/onboarding-schemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Target, Lightbulb } from 'lucide-react'

interface StreamlinedGoalsProps {
  initialData?: Partial<GoalsData>
  onNext: (data: GoalsData) => void
  onSave: (data: GoalsData) => void
  onBack: () => void
  isLoading?: boolean
}

const GOAL_SUGGESTIONS = [
  'Improve energy levels and reduce fatigue',
  'Better blood sugar control and management',
  'Weight loss and body composition improvement',
  'Reduce inflammation and joint pain',
  'Improve sleep quality and recovery',
  'Better digestion and gut health',
  'Optimize performance and endurance',
  'Manage stress and mental clarity',
  'Reduce medication dependency',
  'Maintain DOT medical certification'
]

export function StreamlinedGoals({ 
  initialData, 
  onNext, 
  onSave, 
  onBack,
  isLoading = false 
}: StreamlinedGoalsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<GoalsData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit = (data: GoalsData) => {
    onNext(data)
  }

  const handleSave = () => {
    if (isValid) {
      onSave(watchedValues as GoalsData)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setValue('primary_health_goal', suggestion, { shouldValidate: true })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 bg-gray-900 border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Health Goals
          </h2>
          <p className="text-gray-400">
            What is your primary health goal?
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Primary Health Goal */}
          <div>
            <label htmlFor="primary_health_goal" className="block text-sm font-medium text-gray-300 mb-2">
              Primary Health Goal *
            </label>
            <textarea
              {...register('primary_health_goal')}
              id="primary_health_goal"
              rows={4}
              className={`
                w-full px-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none
                ${errors.primary_health_goal 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
              placeholder="Describe your #1 health goal...&#10;&#10;Examples:&#10;• Improve energy levels and reduce fatigue&#10;• Better blood sugar control&#10;• Weight loss and body composition&#10;• Reduce inflammation and joint pain"
            />
            {errors.primary_health_goal && (
              <p className="mt-1 text-sm text-red-400">{errors.primary_health_goal.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Be specific about what you want to achieve
            </p>
          </div>

          {/* Goal Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-400" />
              <p className="text-sm font-medium text-gray-300">Common Goals:</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {GOAL_SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    text-left p-3 rounded-lg border transition-all
                    ${watchedValues.primary_health_goal === suggestion
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500 text-gray-300 hover:text-white'
                    }
                  `}
                >
                  <div className="text-sm">{suggestion}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
            
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="w-full py-3 text-lg border-gray-600 text-gray-300 hover:bg-gray-800 transition-all"
            >
              Back
            </Button>
          </div>
        </form>

        {/* Auto-save indicator */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Your progress is automatically saved
          </p>
        </div>
      </Card>
    </div>
  )
} 