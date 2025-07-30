'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck } from 'lucide-react'

interface StreamlinedTruckInfoProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedTruckInfo({ data, onNext, onBack, onSave, isLoading }: StreamlinedTruckInfoProps) {
  const [formData, setFormData] = useState({
    routeType: data?.routeType || '',
    hoursPerWeek: data?.hoursPerWeek || '',
    sleepSchedule: data?.sleepSchedule || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    if (onSave && Object.keys(formData).some(key => formData[key as keyof typeof formData])) {
      const timeoutId = setTimeout(() => {
        onSave(formData)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [formData, onSave])

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
              <SelectTrigger className={`w-full ${errors.routeType ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select your route type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="long-haul">Long Haul</SelectItem>
                <SelectItem value="dedicated">Dedicated</SelectItem>
                <SelectItem value="team">Team Driving</SelectItem>
              </SelectContent>
            </Select>
            {errors.routeType && (
              <p className="text-red-400 text-sm mt-1">{errors.routeType}</p>
            )}
          </div>

          {/* Average Hours Per Week */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Average Hours Per Week</Label>
            <Select 
              value={formData.hoursPerWeek} 
              onValueChange={(value) => handleInputChange('hoursPerWeek', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your average hours per week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<40">Less than 40 hours</SelectItem>
                <SelectItem value="40-50">40-50 hours</SelectItem>
                <SelectItem value="50-60">50-60 hours</SelectItem>
                <SelectItem value="60-70">60-70 hours</SelectItem>
                <SelectItem value=">70">More than 70 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sleep Schedule */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Sleep Schedule</Label>
            <Select 
              value={formData.sleepSchedule} 
              onValueChange={(value) => handleInputChange('sleepSchedule', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your typical sleep schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular schedule</SelectItem>
                <SelectItem value="irregular">Irregular schedule</SelectItem>
                <SelectItem value="night-shift">Night shift</SelectItem>
                <SelectItem value="split-sleep">Split sleep</SelectItem>
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