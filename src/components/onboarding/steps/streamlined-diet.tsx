'use client'

import React, { useState } from 'react'
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
}

export function StreamlinedDiet({ data, onNext, onBack }: StreamlinedDietProps) {
  const [formData, setFormData] = useState({
    dietType: data?.dietType || '',
    foodAllergies: data?.foodAllergies || [],
    dietaryRestrictions: data?.dietaryRestrictions || [],
    mealFrequency: data?.mealFrequency || '',
    waterIntake: data?.waterIntake || '',
    supplements: data?.supplements || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-dark-800 border-dark-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <Utensils className="w-5 h-5 text-primary-400" />
          <span>Diet & Nutrition</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-white">Primary Diet Type</Label>
            <Select value={formData.dietType} onValueChange={(value) => handleInputChange('dietType', value)}>
              <SelectTrigger className="bg-dark-700 border-dark-600 text-white">
                <SelectValue placeholder="Select your primary diet" />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-600">
                <SelectItem value="standard">Standard American Diet</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="mediterranean">Mediterranean</SelectItem>
                <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Food Allergies & Sensitivities</Label>
            <div className="grid grid-cols-2 gap-2">
              {['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Wheat', 'Fish'].map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={allergy}
                    checked={formData.foodAllergies.includes(allergy)}
                    onCheckedChange={(checked) => {
                      const newAllergies = checked
                        ? [...formData.foodAllergies, allergy]
                        : formData.foodAllergies.filter((a: string) => a !== allergy)
                      handleInputChange('foodAllergies', newAllergies)
                    }}
                    className="border-dark-600 bg-dark-700"
                  />
                  <Label htmlFor={allergy} className="text-sm text-white">{allergy}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Meals Per Day</Label>
            <Select value={formData.mealFrequency} onValueChange={(value) => handleInputChange('mealFrequency', value)}>
              <SelectTrigger className="bg-dark-700 border-dark-600 text-white">
                <SelectValue placeholder="How many meals do you eat per day?" />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-600">
                <SelectItem value="1-2">1-2 meals</SelectItem>
                <SelectItem value="3">3 meals</SelectItem>
                <SelectItem value="4-5">4-5 meals</SelectItem>
                <SelectItem value="6+">6+ meals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Daily Water Intake</Label>
            <Select value={formData.waterIntake} onValueChange={(value) => handleInputChange('waterIntake', value)}>
              <SelectTrigger className="bg-dark-700 border-dark-600 text-white">
                <SelectValue placeholder="How much water do you drink daily?" />
              </SelectTrigger>
              <SelectContent className="bg-dark-700 border-dark-600">
                <SelectItem value="<32oz">Less than 32 oz</SelectItem>
                <SelectItem value="32-64oz">32-64 oz</SelectItem>
                <SelectItem value="64-96oz">64-96 oz</SelectItem>
                <SelectItem value=">96oz">More than 96 oz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-6">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="bg-dark-700 border-dark-600 text-white hover:bg-dark-600">
                Back
              </Button>
            )}
            <Button type="submit" className="ml-auto bg-primary-600 hover:bg-primary-700 text-white">
              Next
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 