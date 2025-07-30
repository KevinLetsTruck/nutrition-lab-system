'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { demographicsSchema, DemographicsData } from '@/lib/onboarding-schemas'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User, Mail, Phone } from 'lucide-react'

interface StreamlinedDemographicsProps {
  initialData?: Partial<DemographicsData>
  onNext: (data: DemographicsData) => void
  onSave: (data: DemographicsData) => void
  isLoading?: boolean
}

export function StreamlinedDemographics({ 
  initialData, 
  onNext, 
  onSave, 
  isLoading = false 
}: StreamlinedDemographicsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<DemographicsData>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: initialData,
    mode: 'onChange'
  })

  const watchedValues = watch()

  const onSubmit = (data: DemographicsData) => {
    onNext(data)
  }

  const handleSave = () => {
    if (isValid) {
      onSave(watchedValues as DemographicsData)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-6 bg-gray-900 border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Basic Information
          </h2>
          <p className="text-gray-400">
            Let&apos;s start with your contact details
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* First Name */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-300 mb-2">
              First Name *
            </label>
            <div className="relative">
              <input
                {...register('first_name')}
                type="text"
                id="first_name"
                className={`
                  w-full px-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${errors.first_name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }
                `}
                placeholder="Enter your first name"
              />
            </div>
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-400">{errors.first_name.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-300 mb-2">
              Last Name *
            </label>
            <div className="relative">
              <input
                {...register('last_name')}
                type="text"
                id="last_name"
                className={`
                  w-full px-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${errors.last_name 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }
                `}
                placeholder="Enter your last name"
              />
            </div>
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-400">{errors.last_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`
                  w-full pl-12 pr-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${errors.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }
                `}
                placeholder="your.email@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className={`
                  w-full pl-12 pr-4 py-3 text-lg bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-all
                  ${errors.phone 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }
                `}
                placeholder="(555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Saving...' : 'Continue'}
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