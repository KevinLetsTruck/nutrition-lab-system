'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dotStatusSchema, DotStatusData } from '@/lib/onboarding-schemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Shield, Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface StreamlinedDotStatusProps {
  initialData?: Partial<DotStatusData>
  onNext: (data: DotStatusData) => void
  onSave: (data: DotStatusData) => void
  onBack: () => void
  onComplete: (data: DotStatusData) => void
  isLoading?: boolean
}

const DOT_STATUS_OPTIONS = [
  {
    value: 'current',
    label: 'Current',
    description: 'Valid DOT medical certificate',
    icon: CheckCircle,
    color: 'text-green-400'
  },
  {
    value: 'expired',
    label: 'Expired',
    description: 'DOT medical certificate has expired',
    icon: AlertTriangle,
    color: 'text-red-400'
  },
  {
    value: 'upcoming',
    label: 'Upcoming Expiry',
    description: 'DOT medical certificate expires soon',
    icon: Clock,
    color: 'text-yellow-400'
  }
]

export function StreamlinedDotStatus({ 
  initialData, 
  onNext, 
  onSave, 
  onBack,
  onComplete,
  isLoading = false 
}: StreamlinedDotStatusProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<DotStatusData>({
    resolver: zodResolver(dotStatusSchema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit = (data: DotStatusData) => {
    onComplete(data)
  }

  const handleSave = () => {
    if (isValid) {
      onSave(watchedValues as DotStatusData)
    }
  }

  const handleStatusSelect = (value: string) => {
    setValue('dot_medical_status', value as any, { shouldValidate: true })
  }

  const selectedStatus = DOT_STATUS_OPTIONS.find(option => option.value === watchedValues.dot_medical_status)

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 bg-gray-900 border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            DOT Medical Status
          </h2>
          <p className="text-gray-400">
            What is your DOT medical certification status?
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* DOT Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              DOT Medical Certificate Status *
            </label>
            <div className="space-y-3">
              {DOT_STATUS_OPTIONS.map((option) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.value}
                    className={`
                      relative p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${watchedValues.dot_medical_status === option.value
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }
                    `}
                    onClick={() => handleStatusSelect(option.value)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3
                        ${watchedValues.dot_medical_status === option.value
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-500'
                        }
                      `}>
                        {watchedValues.dot_medical_status === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white flex items-center">
                          <Icon className={`w-4 h-4 mr-2 ${option.color}`} />
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {errors.dot_medical_status && (
              <p className="mt-2 text-sm text-red-400">{errors.dot_medical_status.message}</p>
            )}
          </div>

          {/* Expiry Date (conditional) */}
          {(watchedValues.dot_medical_status === 'expired' || watchedValues.dot_medical_status === 'upcoming') && (
            <div>
              <label htmlFor="dot_expiry_date" className="block text-sm font-medium text-gray-300 mb-2">
                DOT Medical Certificate Expiry Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  {...register('dot_expiry_date')}
                  type="date"
                  id="dot_expiry_date"
                  className={`
                    w-full pl-12 pr-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all
                    ${errors.dot_expiry_date 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                    }
                  `}
                />
              </div>
              {errors.dot_expiry_date && (
                <p className="mt-1 text-sm text-red-400">{errors.dot_expiry_date.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                This helps us provide timely reminders
              </p>
            </div>
          )}

          {/* Status Summary */}
          {selectedStatus && (
            <div className={`
              p-4 rounded-lg border-2
              ${watchedValues.dot_medical_status === 'current'
                ? 'border-green-500 bg-green-500/10'
                : watchedValues.dot_medical_status === 'expired'
                ? 'border-red-500 bg-red-500/10'
                : 'border-yellow-500 bg-yellow-500/10'
              }
            `}>
              <div className="flex items-center">
                <selectedStatus.icon className={`w-5 h-5 mr-2 ${selectedStatus.color}`} />
                <div>
                  <div className="font-medium text-white">
                    {selectedStatus.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    {selectedStatus.description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-4 text-lg font-semibold bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Saving...' : 'Complete Onboarding'}
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