'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield } from 'lucide-react'

interface StreamlinedDotStatusProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
  onComplete?: (data: any) => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedDotStatus({ data, onNext, onBack, onComplete, onSave, isLoading }: StreamlinedDotStatusProps) {
  const [formData, setFormData] = useState({
    dotStatus: data?.dotStatus || '',
    hasRestrictions: data?.hasRestrictions || false,
    restrictions: data?.restrictions || [],
    medications: data?.medications || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    if (onSave && (formData.dotStatus || formData.hasRestrictions || formData.restrictions.length > 0)) {
      const timeoutId = setTimeout(() => {
        onSave(formData)
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [formData, onSave])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.dotStatus) {
      newErrors.dotStatus = 'Please select your current DOT status'
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
      if (onComplete) {
        await onComplete(formData)
      } else {
        await onNext(formData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts selecting
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    const newRestrictions = checked
      ? [...formData.restrictions, restriction]
      : formData.restrictions.filter((r: string) => r !== restriction)
    handleInputChange('restrictions', newRestrictions)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary-400" />
          <span>DOT Medical Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current DOT Status */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Current DOT Status <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={formData.dotStatus} 
              onValueChange={(value) => handleInputChange('dotStatus', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={`w-full ${errors.dotStatus ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select your current DOT status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear - No restrictions</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending renewal</SelectItem>
              </SelectContent>
            </Select>
            {errors.dotStatus && (
              <p className="text-red-400 text-sm mt-1">{errors.dotStatus}</p>
            )}
          </div>

          {/* Medical Restrictions */}
          <div className="form-field">
            <div className="flex items-center space-x-3 p-4 bg-dark-700 border border-dark-600 rounded-lg hover:bg-dark-600 transition-colors">
              <Checkbox
                id="hasRestrictions"
                checked={formData.hasRestrictions}
                onCheckedChange={(checked) => handleInputChange('hasRestrictions', checked)}
                disabled={isLoading}
                className="text-primary-500"
              />
              <Label 
                htmlFor="hasRestrictions" 
                className="text-white font-medium cursor-pointer flex-1"
              >
                Do you have any medical restrictions?
              </Label>
            </div>

            {formData.hasRestrictions && (
              <div className="mt-6 p-4 bg-dark-700 border border-dark-600 rounded-lg">
                <Label className="text-base font-medium text-white mb-4 block">
                  Medical Restrictions (Select all that apply)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Vision', 'Hearing', 'Diabetes', 'Cardiac', 'Respiratory', 'Neurological', 'Musculoskeletal', 'Other'].map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-3 p-2 bg-dark-800 rounded-lg hover:bg-dark-600 transition-colors">
                      <Checkbox
                        id={restriction}
                        checked={formData.restrictions.includes(restriction)}
                        onCheckedChange={(checked) => handleRestrictionChange(restriction, checked as boolean)}
                        disabled={isLoading}
                        className="text-primary-500"
                      />
                      <Label 
                        htmlFor={restriction} 
                        className="text-white text-sm cursor-pointer flex-1"
                      >
                        {restriction}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {isSubmitting ? 'Saving...' : (onComplete ? 'Complete Onboarding' : 'Next')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 