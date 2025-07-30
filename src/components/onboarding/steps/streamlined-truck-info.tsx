'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StreamlinedTruckInfoProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

export function StreamlinedTruckInfo({ onNext, onBack, initialData }: StreamlinedTruckInfoProps) {
  const [formData, setFormData] = useState({
    yearsDriving: initialData?.yearsDriving || '',
    routeType: initialData?.routeType || '',
    schedulePattern: initialData?.schedulePattern || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Store data locally for now (no API calls)
    localStorage.setItem('truckInfoData', JSON.stringify(formData))
    
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
          Truck Driver Information
        </CardTitle>
        <p className="text-gray-400 text-center">
          Tell us about your driving schedule and experience
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Years Driving */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How many years have you been driving professionally?
            </label>
            <select
              value={formData.yearsDriving}
              onChange={(e) => handleInputChange('yearsDriving', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select years of experience</option>
              <option value="Less than 1 year">Less than 1 year</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5-10 years">5-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>

          {/* Route Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What type of route do you typically drive?
            </label>
            <select
              value={formData.routeType}
              onChange={(e) => handleInputChange('routeType', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select route type</option>
              <option value="OTR (Over the Road)">OTR (Over the Road)</option>
              <option value="Regional">Regional</option>
              <option value="Local">Local</option>
              <option value="Dedicated">Dedicated</option>
              <option value="Team Driving">Team Driving</option>

            </select>
          </div>

          {/* Schedule Pattern */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What&apos;s your typical driving schedule?
            </label>
            <select
              value={formData.schedulePattern}
              onChange={(e) => handleInputChange('schedulePattern', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select schedule pattern</option>
              <option value="Standard (Day shifts)">Standard (Day shifts)</option>
              <option value="Night shifts">Night shifts</option>
              <option value="Irregular schedule">Irregular schedule</option>
              <option value="Split shifts">Split shifts</option>
              <option value="On-call">On-call</option>
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
              disabled={isSubmitting}
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