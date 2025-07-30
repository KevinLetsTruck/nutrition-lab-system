'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StreamlinedGoalsProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

export function StreamlinedGoals({ onNext, onBack, initialData }: StreamlinedGoalsProps) {
  const [formData, setFormData] = useState({
    healthGoals: initialData?.healthGoals || '',
    primaryConcern: initialData?.primaryConcern || '',
    timeline: initialData?.timeline || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Store data locally for now (no API calls)
    localStorage.setItem('goalsData', JSON.stringify(formData))
    
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
          Health Goals
        </CardTitle>
        <p className="text-gray-400 text-center">
          What are your primary health and wellness goals?
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Health Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What is your primary health goal? <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.healthGoals}
              onChange={(e) => handleInputChange('healthGoals', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select your primary goal</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Weight Gain">Weight Gain</option>
              <option value="Energy Improvement">Energy Improvement</option>
              <option value="Better Sleep">Better Sleep</option>
              <option value="Digestive Health">Digestive Health</option>
              <option value="Blood Sugar Management">Blood Sugar Management</option>
              <option value="Heart Health">Heart Health</option>
              <option value="Mental Clarity">Mental Clarity</option>
              <option value="Inflammation Reduction">Inflammation Reduction</option>
              <option value="Athletic Performance">Athletic Performance</option>
              <option value="General Wellness">General Wellness</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Primary Health Concern */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What is your biggest health concern right now?
            </label>
            <textarea
              value={formData.primaryConcern}
              onChange={(e) => handleInputChange('primaryConcern', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-y"
              placeholder="Describe your main health concern or what you&apos;d like to improve..."
            />
          </div>

          {/* Timeline */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What's your timeline for achieving these goals?
            </label>
            <select
              value={formData.timeline}
              onChange={(e) => handleInputChange('timeline', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select timeline</option>
              <option value="1-3 months">1-3 months</option>
              <option value="3-6 months">3-6 months</option>
              <option value="6-12 months">6-12 months</option>
              <option value="1+ years">1+ years</option>
              <option value="No specific timeline">No specific timeline</option>
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
              disabled={isSubmitting || !formData.healthGoals}
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