'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck } from 'lucide-react'

interface StreamlinedTruckInfoProps {
  initialData?: any
  onNext: (data: any) => void
  onBack?: () => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedTruckInfo({ initialData, onNext, onBack, onSave, isLoading }: StreamlinedTruckInfoProps) {
  const [formData, setFormData] = useState({
    routeType: initialData?.routeType || '',
    hoursPerWeek: initialData?.hoursPerWeek || '',
    sleepSchedule: initialData?.sleepSchedule || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // FIXED: Removed aggressive auto-save that was preventing user input
  // Auto-save is now handled by the parent component with proper debouncing

  const routeTypeOptions = [
    'Local/Regional',
    'Over-the-Road (OTR)',
    'Team Driving',
    'Owner Operator',
    'Specialized Hauling',
    'Intermodal',
    'Other'
  ]

  const hoursPerWeekOptions = [
    'Less than 40 hours',
    '40-50 hours',
    '50-60 hours',
    '60-70 hours',
    'More than 70 hours',
    'Variable schedule'
  ]

  const sleepScheduleOptions = [
    'Regular day schedule (6AM-10PM)',
    'Night shift (10PM-6AM)',
    'Split schedule',
    'Irregular/rotating shifts',
    'Sleep when possible',
    'Other'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.routeType) {
      newErrors.routeType = 'Please select your route type'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // FIXED: Save data when user clicks Next
      if (onSave) {
        onSave(formData)
      }
      await onNext(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts selecting
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-primary-400" />
          <span>Truck Driver Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Route Type */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Route Type <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.routeType}
              onValueChange={(value) => handleInputChange('routeType', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={`${errors.routeType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                <SelectValue placeholder="Select your route type" />
              </SelectTrigger>
              <SelectContent>
                {routeTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.routeType && <p className="text-sm text-red-400 mt-2">{errors.routeType}</p>}
          </div>

          {/* Hours Per Week */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Typical Hours Per Week
            </Label>
            <Select
              value={formData.hoursPerWeek}
              onValueChange={(value) => handleInputChange('hoursPerWeek', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your typical hours" />
              </SelectTrigger>
              <SelectContent>
                {hoursPerWeekOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sleep Schedule */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Typical Sleep Schedule
            </Label>
            <Select
              value={formData.sleepSchedule}
              onValueChange={(value) => handleInputChange('sleepSchedule', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your sleep schedule" />
              </SelectTrigger>
              <SelectContent>
                {sleepScheduleOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-dark-600">
            {onBack && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                disabled={isLoading || isSubmitting}
                className="px-8 py-3 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-lg transition-all duration-200 border border-dark-600"
              >
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitting}
              className="ml-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Next'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 