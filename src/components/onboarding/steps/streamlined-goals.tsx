'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target } from 'lucide-react'

interface StreamlinedGoalsProps {
  initialData?: any
  onNext: (data: any) => void
  onBack?: () => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedGoals({ initialData, onNext, onBack, onSave, isLoading }: StreamlinedGoalsProps) {
  const [formData, setFormData] = useState({
    healthGoals: initialData?.healthGoals || [],
    primaryConcern: initialData?.primaryConcern || '',
    timeline: initialData?.timeline || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const healthGoalOptions = [
    'Weight Management',
    'Energy & Vitality',
    'Digestive Health',
    'Hormone Balance',
    'Immune Support',
    'Heart Health',
    'Mental Clarity',
    'Sleep Quality',
    'Stress Management',
    'Muscle Building',
    'Recovery & Performance',
    'General Wellness'
  ]

  const primaryConcernOptions = [
    'Low Energy',
    'Weight Gain',
    'Digestive Issues',
    'Poor Sleep',
    'Stress & Anxiety',
    'Joint Pain',
    'Brain Fog',
    'Mood Swings',
    'Hormone Imbalance',
    'Immune Issues',
    'Other'
  ]

  const timelineOptions = [
    '1-3 months',
    '3-6 months',
    '6-12 months',
    '1+ years',
    'Ongoing maintenance'
  ]

  // FIXED: Removed aggressive auto-save that was preventing user input
  // Auto-save is now handled by the parent component with proper debouncing

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (formData.healthGoals.length === 0) {
      newErrors.healthGoals = 'Please select at least one health goal'
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

  const handleGoalToggle = (goal: string) => {
    const newGoals = formData.healthGoals.includes(goal)
      ? formData.healthGoals.filter((g: string) => g !== goal)
      : [...formData.healthGoals, goal]
    
    setFormData(prev => ({ ...prev, healthGoals: newGoals }))
    
    // Clear error when user starts selecting
    if (errors.healthGoals) {
      setErrors(prev => ({ ...prev, healthGoals: '' }))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary-400" />
          <span>Health Goals & Concerns</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Health Goals */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Health Goals <span className="text-red-400">*</span>
            </Label>
            <p className="text-sm text-gray-400 mb-4">Select all that apply to your health objectives</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthGoalOptions.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  disabled={isLoading}
                  className={`p-3 text-left rounded-lg border transition-all duration-200 ${
                    formData.healthGoals.includes(goal)
                      ? 'bg-primary-600 border-primary-500 text-white'
                      : 'bg-dark-700 border-dark-600 text-gray-300 hover:bg-dark-600 hover:border-dark-500'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {goal}
                </button>
              ))}
            </div>
            {errors.healthGoals && <p className="text-sm text-red-400 mt-2">{errors.healthGoals}</p>}
          </div>

          {/* Primary Health Concern */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Primary Health Concern
            </Label>
            <Select
              value={formData.primaryConcern}
              onValueChange={(value) => handleInputChange('primaryConcern', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your primary health concern" />
              </SelectTrigger>
              <SelectContent>
                {primaryConcernOptions.map((concern) => (
                  <SelectItem key={concern} value={concern}>
                    {concern}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Timeline */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Desired Timeline
            </Label>
            <Select
              value={formData.timeline}
              onValueChange={(value) => handleInputChange('timeline', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your desired timeline" />
              </SelectTrigger>
              <SelectContent>
                {timelineOptions.map((timeline) => (
                  <SelectItem key={timeline} value={timeline}>
                    {timeline}
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