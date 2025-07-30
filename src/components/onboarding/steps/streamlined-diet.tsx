'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dietSchema, DietData } from '@/lib/onboarding-schemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Target, Clock } from 'lucide-react'

interface StreamlinedDietProps {
  initialData?: Partial<DietData>
  onNext: (data: DietData) => void
  onSave: (data: DietData) => void
  onBack: () => void
  isLoading?: boolean
}

const DIET_OPTIONS = [
  {
    value: 'low_carb_paleo',
    label: 'Low Carb Paleo',
    description: 'Paleo with reduced carbohydrates'
  },
  {
    value: 'keto_paleo',
    label: 'Keto with Paleo Rules',
    description: 'Ketogenic diet following paleo principles'
  },
  {
    value: 'carnivore',
    label: 'Carnivore',
    description: 'Animal-based diet only'
  }
]

export function StreamlinedDiet({ 
  initialData, 
  onNext, 
  onSave, 
  onBack,
  isLoading = false 
}: StreamlinedDietProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<DietData>({
    resolver: zodResolver(dietSchema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit = (data: DietData) => {
    onNext(data)
  }

  const handleSave = () => {
    if (isValid) {
      onSave(watchedValues as DietData)
    }
  }

  const handleDietSelect = (value: string) => {
    setValue('current_diet_approach', value as any, { shouldValidate: true })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 bg-gray-900 border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Current Diet
          </h2>
          <p className="text-gray-400">
            What diet are you currently following?
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Diet Approach Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Current Diet Approach *
            </label>
            <div className="space-y-3">
              {DIET_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${watchedValues.current_diet_approach === option.value
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }
                  `}
                  onClick={() => handleDietSelect(option.value)}
                >
                  <div className="flex items-center">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3
                      ${watchedValues.current_diet_approach === option.value
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-500'
                      }
                    `}>
                      {watchedValues.current_diet_approach === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.current_diet_approach && (
              <p className="mt-2 text-sm text-red-400">{errors.current_diet_approach.message}</p>
            )}
          </div>

          {/* Diet Duration */}
          <div>
            <label htmlFor="diet_duration_months" className="block text-sm font-medium text-gray-300 mb-2">
              How long have you been following this diet? (months)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                {...register('diet_duration_months', { valueAsNumber: true })}
                type="number"
                id="diet_duration_months"
                min="0"
                max="600"
                className={`
                  w-full pl-12 pr-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${errors.diet_duration_months 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }
                `}
                placeholder="e.g., 6"
              />
            </div>
            {errors.diet_duration_months && (
              <p className="mt-1 text-sm text-red-400">{errors.diet_duration_months.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Leave blank if you&apos;re not sure or just starting
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-4 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
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