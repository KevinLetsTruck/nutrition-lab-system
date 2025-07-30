'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Utensils, Plus, X } from 'lucide-react'

interface StreamlinedDietProps {
  initialData?: any
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
  const [newSupplement, setNewSupplement] = useState('')

  // FIXED: Removed aggressive auto-save that was preventing user input
  // Auto-save is now handled by the parent component with proper debouncing

  const dietTypeOptions = [
    'Standard American',
    'Mediterranean',
    'Keto',
    'Paleo',
    'Vegetarian',
    'Vegan',
    'Low-Carb',
    'High-Protein',
    'Gluten-Free',
    'Dairy-Free',
    'Other'
  ]

  const allergyOptions = [
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Eggs',
    'Soy',
    'Wheat',
    'Fish',
    'Shellfish',
    'Gluten',
    'Lactose'
  ]

  const restrictionOptions = [
    'Low Sodium',
    'Low Sugar',
    'Low Fat',
    'High Fiber',
    'Low Cholesterol',
    'No Red Meat',
    'No Processed Foods',
    'Organic Only'
  ]

  const mealFrequencyOptions = [
    '3 meals per day',
    '4-5 small meals',
    '2 meals + snacks',
    'Intermittent fasting',
    'Variable schedule'
  ]

  const waterIntakeOptions = [
    'Less than 4 cups',
    '4-6 cups',
    '6-8 cups',
    '8-10 cups',
    'More than 10 cups'
  ]

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

  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    const newRestrictions = checked
      ? [...formData.dietaryRestrictions, restriction]
      : formData.dietaryRestrictions.filter((r: string) => r !== restriction)
    handleInputChange('dietaryRestrictions', newRestrictions)
  }

  const addSupplement = () => {
    if (newSupplement.trim()) {
      const newSupplements = [...formData.supplements, newSupplement.trim()]
      handleInputChange('supplements', newSupplements)
      setNewSupplement('')
    }
  }

  const removeSupplement = (index: number) => {
    const newSupplements = formData.supplements.filter((_: string, i: number) => i !== index)
    handleInputChange('supplements', newSupplements)
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
              <SelectTrigger className={`${errors.dietType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                <SelectValue placeholder="Select your primary diet type" />
              </SelectTrigger>
              <SelectContent>
                {dietTypeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dietType && <p className="text-sm text-red-400 mt-2">{errors.dietType}</p>}
          </div>

          {/* Food Allergies */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Food Allergies
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {allergyOptions.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={formData.foodAllergies.includes(allergy)}
                    onCheckedChange={(checked) => handleAllergyChange(allergy, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`allergy-${allergy}`} className="text-sm text-gray-300">
                    {allergy}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Dietary Restrictions
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {restrictionOptions.map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                    id={`restriction-${restriction}`}
                    checked={formData.dietaryRestrictions.includes(restriction)}
                    onCheckedChange={(checked) => handleRestrictionChange(restriction, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`restriction-${restriction}`} className="text-sm text-gray-300">
                    {restriction}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Meal Frequency */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Typical Meal Frequency
            </Label>
            <Select
              value={formData.mealFrequency}
              onValueChange={(value) => handleInputChange('mealFrequency', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your meal frequency" />
              </SelectTrigger>
              <SelectContent>
                {mealFrequencyOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Water Intake */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Daily Water Intake
            </Label>
            <Select
              value={formData.waterIntake}
              onValueChange={(value) => handleInputChange('waterIntake', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your water intake" />
              </SelectTrigger>
              <SelectContent>
                {waterIntakeOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplements */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Current Supplements
            </Label>
            <div className="flex gap-3">
              <Input
                value={newSupplement}
                onChange={(e) => setNewSupplement(e.target.value)}
                placeholder="Enter supplement name"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSupplement()
                  }
                }}
              />
              <Button
                type="button"
                onClick={addSupplement}
                disabled={isLoading || !newSupplement.trim()}
                className="px-4 bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.supplements.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.supplements.map((supplement: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                    <span className="text-sm text-gray-300">{supplement}</span>
                    <Button
                      type="button"
                      onClick={() => removeSupplement(index)}
                      disabled={isLoading}
                      className="p-1 h-auto bg-transparent hover:bg-dark-600 text-gray-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
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
              {isSubmitting ? 'Saving...' : 'Next'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 