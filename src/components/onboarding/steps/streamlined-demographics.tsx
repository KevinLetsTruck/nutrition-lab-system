'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from 'lucide-react'

interface StreamlinedDemographicsProps {
  initialData?: any
  onNext: (data: any) => void
  onBack?: () => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedDemographics({ data, onNext, onBack, onSave, isLoading }: StreamlinedDemographicsProps) {
  const [formData, setFormData] = useState({
    first_name: data?.first_name || '',
    last_name: data?.last_name || '',
    email: data?.email || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // FIXED: Removed aggressive auto-save that was preventing user input
  // Auto-save is now handled by the parent component with proper debouncing

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5 text-primary-400" />
          <span>Basic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-field">
              <Label className="text-base font-medium text-white mb-3 block">
                First Name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
                disabled={isLoading}
                className={`${errors.first_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.first_name && <p className="text-sm text-red-400 mt-2">{errors.first_name}</p>}
            </div>

            <div className="form-field">
              <Label className="text-base font-medium text-white mb-3 block">
                Last Name <span className="text-red-400">*</span>
              </Label>
              <Input
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
                disabled={isLoading}
                className={`${errors.last_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.last_name && <p className="text-sm text-red-400 mt-2">{errors.last_name}</p>}
            </div>
          </div>

          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Email Address <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              disabled={isLoading}
              className={`${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.email && <p className="text-sm text-red-400 mt-2">{errors.email}</p>}
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