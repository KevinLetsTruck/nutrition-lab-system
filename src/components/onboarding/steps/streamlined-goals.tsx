'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Target } from 'lucide-react'

interface StreamlinedGoalsProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedGoals({ data, onNext, onBack, onSave, isLoading }: StreamlinedGoalsProps) {
  const [formData, setFormData] = useState({
    healthGoals: data?.healthGoals || [],
    primaryConcern: data?.primaryConcern || '',
    timeline: data?.timeline || ''
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

  // Auto-save functionality
  useEffect(() => {
    if (onSave && (formData.healthGoals.length > 0 || formData.primaryConcern || formData.timeline)) {
      const timeoutId = setTimeout(() => {
        onSave(formData)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [formData, onSave])

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
      await onNext(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter((g: string) => g !== goal)
        : [...prev.healthGoals, goal]
    }))
    // Clear error when user selects a goal
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
          <span>Health Goals</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Health Goals */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-4 block">
              What are your primary health goals? <span className="text-red-400">*</span>
            </Label>
            <p className="text-sm text-gray-400 mb-4">Select all that apply</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-3 p-3 bg-dark-700 border border-dark-600 rounded-lg hover:bg-dark-600 transition-colors">
                  <Checkbox
                    id={goal}
                    checked={formData.healthGoals.includes(goal)}
                    onCheckedChange={() => handleGoalToggle(goal)}
                    disabled={isLoading}
                    className="text-primary-500"
                  />
                  <Label 
                    htmlFor={goal} 
                    className="text-white text-sm cursor-pointer flex-1"
                  >
                    {goal}
                  </Label>
                </div>
              ))}
            </div>
            {errors.healthGoals && (
              <p className="text-red-400 text-sm mt-2">{errors.healthGoals}</p>
            )}
          </div>

          {/* Primary Health Concern */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              What is your most pressing health concern?
            </Label>
            <textarea
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 text-white rounded-lg shadow-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-all duration-200 disabled:opacity-50"
              rows={4}
              value={formData.primaryConcern}
              onChange={(e) => handleInputChange('primaryConcern', e.target.value)}
              placeholder="Describe your main health concern..."
              disabled={isLoading}
            />
          </div>

          {/* Timeline */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-4 block">
              What is your timeline for achieving these goals?
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['1-3 months', '3-6 months', '6-12 months', '1+ years'].map((timeline) => (
                <div key={timeline} className="flex items-center space-x-3 p-3 bg-dark-700 border border-dark-600 rounded-lg hover:bg-dark-600 transition-colors">
                  <input
                    type="radio"
                    id={timeline}
                    name="timeline"
                    value={timeline}
                    checked={formData.timeline === timeline}
                    onChange={(e) => handleInputChange('timeline', e.target.value)}
                    disabled={isLoading}
                    className="text-primary-500"
                  />
                  <Label 
                    htmlFor={timeline} 
                    className="text-white text-sm cursor-pointer flex-1"
                  >
                    {timeline}
                  </Label>
                </div>
              ))}
            </div>
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