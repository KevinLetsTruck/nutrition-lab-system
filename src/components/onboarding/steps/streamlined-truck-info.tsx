'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { truckDriverSchema, TruckDriverData } from '@/lib/onboarding-schemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Truck, Clock, MapPin } from 'lucide-react'

interface StreamlinedTruckInfoProps {
  initialData?: Partial<TruckDriverData>
  onNext: (data: TruckDriverData) => void
  onSave: (data: TruckDriverData) => void
  onBack: () => void
  isLoading?: boolean
}

const ROUTE_OPTIONS = [
  {
    value: 'otr',
    label: 'Over The Road (OTR)',
    description: 'Long-haul, cross-country routes'
  },
  {
    value: 'regional',
    label: 'Regional',
    description: 'Multi-state, shorter routes'
  },
  {
    value: 'local',
    label: 'Local',
    description: 'Same-day return routes'
  }
]

const SCHEDULE_OPTIONS = [
  {
    value: 'standard',
    label: 'Standard Schedule',
    description: 'Regular day shifts, consistent schedule'
  },
  {
    value: 'irregular',
    label: 'Irregular Schedule',
    description: 'Varying shifts and unpredictable hours'
  },
  {
    value: 'night_shifts',
    label: 'Night Shifts',
    description: 'Primarily overnight driving'
  }
]

export function StreamlinedTruckInfo({ 
  initialData, 
  onNext, 
  onSave, 
  onBack,
  isLoading = false 
}: StreamlinedTruckInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<TruckDriverData>({
    resolver: zodResolver(truckDriverSchema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit = (data: TruckDriverData) => {
    onNext(data)
  }

  const handleSave = () => {
    if (isValid) {
      onSave(watchedValues as TruckDriverData)
    }
  }

  const handleRouteSelect = (value: string) => {
    setValue('route_type', value as any, { shouldValidate: true })
  }

  const handleScheduleSelect = (value: string) => {
    setValue('schedule_pattern', value as any, { shouldValidate: true })
  }

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setValue('years_driving', value, { shouldValidate: true })
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 bg-gray-900 border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Truck Driver Info
          </h2>
          <p className="text-gray-400">
            Tell us about your driving schedule
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Years Driving */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Years of Professional Driving Experience: {watchedValues.years_driving || 0} years
            </label>
            <div className="relative">
              <input
                {...register('years_driving', { valueAsNumber: true })}
                type="range"
                min="0"
                max="50"
                step="1"
                onChange={handleYearsChange}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(watchedValues.years_driving || 0) * 2}%, #374151 ${(watchedValues.years_driving || 0) * 2}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50</span>
              </div>
            </div>
            {errors.years_driving && (
              <p className="mt-1 text-sm text-red-400">{errors.years_driving.message}</p>
            )}
          </div>

          {/* Route Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Route Type *
            </label>
            <div className="space-y-3">
              {ROUTE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${watchedValues.route_type === option.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }
                  `}
                  onClick={() => handleRouteSelect(option.value)}
                >
                  <div className="flex items-center">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3
                      ${watchedValues.route_type === option.value
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-500'
                      }
                    `}>
                      {watchedValues.route_type === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
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
            {errors.route_type && (
              <p className="mt-2 text-sm text-red-400">{errors.route_type.message}</p>
            )}
          </div>

          {/* Schedule Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Schedule Pattern *
            </label>
            <div className="space-y-3">
              {SCHEDULE_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${watchedValues.schedule_pattern === option.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    }
                  `}
                  onClick={() => handleScheduleSelect(option.value)}
                >
                  <div className="flex items-center">
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3
                      ${watchedValues.schedule_pattern === option.value
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-500'
                      }
                    `}>
                      {watchedValues.schedule_pattern === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
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
            {errors.schedule_pattern && (
              <p className="mt-2 text-sm text-red-400">{errors.schedule_pattern.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-4 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
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

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #ffffff;
        }
      `}</style>
    </div>
  )
} 