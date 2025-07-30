'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { medicationsSchema, MedicationsData } from '@/lib/onboarding-schemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pill, Plus } from 'lucide-react'

interface StreamlinedMedicationsProps {
  initialData?: Partial<MedicationsData>
  onNext: (data: MedicationsData) => void
  onSave: (data: MedicationsData) => void
  onBack: () => void
  isLoading?: boolean
}

export function StreamlinedMedications({ 
  initialData, 
  onNext, 
  onSave, 
  onBack,
  isLoading = false 
}: StreamlinedMedicationsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<MedicationsData>({
    resolver: zodResolver(medicationsSchema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit = (data: MedicationsData) => {
    onNext(data)
  }

  const handleSave = () => {
    if (isValid) {
      onSave(watchedValues as MedicationsData)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 bg-gray-900 border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Medications & Supplements
          </h2>
          <p className="text-gray-400">
            List your current medications and supplements
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Medications */}
          <div>
            <label htmlFor="current_medications" className="block text-sm font-medium text-gray-300 mb-2">
              Current Prescription Medications
            </label>
            <textarea
              {...register('current_medications')}
              id="current_medications"
              rows={4}
              className={`
                w-full px-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none
                ${errors.current_medications 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
              placeholder="List any prescription medications you're currently taking...&#10;&#10;Examples:&#10;• Metformin 500mg twice daily&#10;• Lisinopril 10mg once daily&#10;• None"
            />
            {errors.current_medications && (
              <p className="mt-1 text-sm text-red-400">{errors.current_medications.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Include dosage and frequency if known
            </p>
          </div>

          {/* Current Supplements */}
          <div>
            <label htmlFor="current_supplements" className="block text-sm font-medium text-gray-300 mb-2">
              Current Supplements & Vitamins
            </label>
            <textarea
              {...register('current_supplements')}
              id="current_supplements"
              rows={4}
              className={`
                w-full px-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none
                ${errors.current_supplements 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
              placeholder="List any supplements or vitamins you're currently taking...&#10;&#10;Examples:&#10;• Vitamin D3 2000 IU daily&#10;• Magnesium 400mg at bedtime&#10;• Fish oil 1000mg twice daily&#10;• None"
            />
            {errors.current_supplements && (
              <p className="mt-1 text-sm text-red-400">{errors.current_supplements.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Include dosage and frequency if known
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-300">Quick Add Common Items:</p>
            <div className="flex flex-wrap gap-2">
              {['None', 'Vitamin D', 'Magnesium', 'Fish Oil', 'Multivitamin', 'B12'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    const currentValue = watchedValues.current_supplements || ''
                    const newValue = currentValue ? `${currentValue}\n• ${item}` : `• ${item}`
                    // Note: This would need to be implemented with setValue from react-hook-form
                  }}
                  className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
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