'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Utensils } from 'lucide-react'

interface StreamlinedDietProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedDiet({ data, onNext, onBack, onSave, isLoading }: StreamlinedDietProps) {
  const [formData, setFormData] = useState({
    dietType: data?.dietType || '',
    foodAllergies: data?.foodAllergies || [],
    dietaryRestrictions: data?.dietaryRestrictions || [],
    mealFrequency: data?.mealFrequency || '',
    waterIntake: data?.waterIntake || '',
    supplements: data?.supplements || []
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
    
    if (!formData.dietType) {
      newErrors.dietType = 'Please select your primary diet type'
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAllergyChange = (allergy: string, checked: boolean) => {
    const newAllergies = checked
      ? [...formData.foodAllergies, allergy]
      : formData.foodAllergies.filter((a: string) => a !== allergy)
    handleInputChange('foodAllergies', newAllergies)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Utensils className="w-5 h-5 text-primary-400" />
          <span>Diet & Nutrition</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Primary Diet Type */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Primary Diet Type <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={formData.dietType} 
              onValueChange={(value) => handleInputChange('dietType', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={`w-full ${errors.dietType ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select your primary diet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard American Diet</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
                <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                <SelectItem value="carnivore">Carnivore</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.dietType && (
              <p className="text-red-400 text-sm mt-1">{errors.dietType}</p>
            )}
          </div>

          {/* Food Allergies & Sensitivities */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-4 block">
              Food Allergies & Sensitivities (Select all that apply)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Wheat', 'Fish'].map((allergy) => (
                <div key={allergy} className="flex items-center space-x-3 p-3 bg-dark-700 border border-dark-600 rounded-lg hover:bg-dark-600 transition-colors">
                  <Checkbox
                    id={allergy}
                    checked={formData.foodAllergies.includes(allergy)}
                    onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                    disabled={isLoading}
                    className="text-primary-500"
                  />
                  <Label 
                    htmlFor={allergy} 
                    className="text-white text-sm cursor-pointer flex-1"
                  >
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Meals Per Day */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Meals Per Day</Label>
            <Select 
              value={formData.mealFrequency} 
              onValueChange={(value) => handleInputChange('mealFrequency', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="How many meals do you eat per day?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 meals</SelectItem>
                <SelectItem value="3">3 meals</SelectItem>
                <SelectItem value="4-5">4-5 meals</SelectItem>
                <SelectItem value="6+">6+ meals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Daily Water Intake */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Daily Water Intake</Label>
            <Select 
              value={formData.waterIntake} 
              onValueChange={(value) => handleInputChange('waterIntake', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="How much water do you drink daily?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<32oz">Less than 32 oz</SelectItem>
                <SelectItem value="32-64oz">32-64 oz</SelectItem>
                <SelectItem value="64-96oz">64-96 oz</SelectItem>
                <SelectItem value=">96oz">More than 96 oz</SelectItem>
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