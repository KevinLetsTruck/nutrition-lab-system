'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StreamlinedDietProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

export function StreamlinedDiet({ onNext, onBack, initialData }: StreamlinedDietProps) {
  const [formData, setFormData] = useState({
    dietType: initialData?.dietType || '',
    mealFrequency: initialData?.mealFrequency || '',
    waterIntake: initialData?.waterIntake || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Store data locally for now (no API calls)
    localStorage.setItem('dietData', JSON.stringify(formData))
    
    // Simulate processing time
    setTimeout(() => {
      onNext(formData)
      setIsSubmitting(false)
    }, 500)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white text-center">
          Current Diet & Nutrition
        </CardTitle>
        <p className="text-gray-400 text-center">
          Tell us about your current eating habits
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Diet Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What is your primary diet type?
            </label>
            <select
              value={formData.dietType}
              onChange={(e) => handleInputChange('dietType', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your primary diet</option>
              <option value="Standard American Diet">Standard American Diet</option>
              <option value="Low Carb Paleo">Low Carb Paleo</option>
              <option value="Keto Paleo">Keto Paleo</option>
              <option value="Carnivore">Carnivore</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Gluten-Free">Gluten-Free</option>
              <option value="Dairy-Free">Dairy-Free</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Meal Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How many meals do you typically eat per day?
            </label>
            <select
              value={formData.mealFrequency}
              onChange={(e) => handleInputChange('mealFrequency', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select meal frequency</option>
              <option value="1 meal per day">1 meal per day</option>
              <option value="2 meals per day">2 meals per day</option>
              <option value="3 meals per day">3 meals per day</option>
              <option value="4+ meals per day">4+ meals per day</option>
              <option value="Intermittent fasting">Intermittent fasting</option>
              <option value="Grazing throughout day">Grazing throughout day</option>
            </select>
          </div>

          {/* Water Intake */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How much water do you drink daily?
            </label>
            <select
              value={formData.waterIntake}
              onChange={(e) => handleInputChange('waterIntake', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select water intake</option>
              <option value="Less than 4 cups">Less than 4 cups</option>
              <option value="4-6 cups">4-6 cups</option>
              <option value="6-8 cups">6-8 cups</option>
              <option value="8+ cups">8+ cups</option>
              <option value="Not sure">Not sure</option>
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !formData.dietType}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Saving...' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 