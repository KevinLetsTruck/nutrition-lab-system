'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StreamlinedDotStatusProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

export function StreamlinedDotStatus({ onNext, onBack, initialData }: StreamlinedDotStatusProps) {
  const [formData, setFormData] = useState({
    dotStatus: initialData?.dotStatus || '',
    hasRestrictions: initialData?.hasRestrictions || '',
    restrictions: initialData?.restrictions || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Store data locally for now (no API calls)
    localStorage.setItem('dotStatusData', JSON.stringify(formData))
    
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
          DOT Medical Status
        </CardTitle>
        <p className="text-gray-400 text-center">
          Tell us about your DOT medical certification status
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DOT Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What is your current DOT medical status?
            </label>
            <select
              value={formData.dotStatus}
              onChange={(e) => handleInputChange('dotStatus', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select DOT status</option>
              <option value="Current">Current</option>
              <option value="Expired">Expired</option>
              <option value="Upcoming renewal">Upcoming renewal</option>
              <option value="Not applicable">Not applicable</option>
            </select>
          </div>

          {/* Medical Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Do you have any medical restrictions on your DOT card?
            </label>
            <select
              value={formData.hasRestrictions}
              onChange={(e) => handleInputChange('hasRestrictions', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select option</option>
              <option value="No restrictions">No restrictions</option>
              <option value="Yes, I have restrictions">Yes, I have restrictions</option>
              <option value="Not sure">Not sure</option>
            </select>
          </div>

          {/* Restrictions Details */}
          {formData.hasRestrictions === 'Yes, I have restrictions' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Please describe your medical restrictions:
              </label>
              <textarea
                value={formData.restrictions}
                onChange={(e) => handleInputChange('restrictions', e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-y"
                placeholder="Describe any medical restrictions on your DOT card..."
              />
            </div>
          )}

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
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Saving...' : 'Complete'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 