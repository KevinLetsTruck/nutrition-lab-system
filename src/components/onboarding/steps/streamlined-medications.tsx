'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StreamlinedMedicationsProps {
  onNext: (data: any) => void
  onBack: () => void
  initialData?: any
}

export function StreamlinedMedications({ onNext, onBack, initialData }: StreamlinedMedicationsProps) {
  const [formData, setFormData] = useState({
    currentMedications: initialData?.currentMedications || '',
    supplements: initialData?.supplements || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Store data locally for now (no API calls)
    localStorage.setItem('medicationsData', JSON.stringify(formData))
    
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
          Medications & Supplements
        </CardTitle>
        <p className="text-gray-400 text-center">
          Tell us about your current medications and supplements
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Medications */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Prescription Medications
            </label>
            <textarea
              value={formData.currentMedications}
              onChange={(e) => handleInputChange('currentMedications', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
              placeholder="List any prescription medications you're currently taking (or type 'None' if not applicable)"
            />
          </div>

          {/* Supplements */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Supplements
            </label>
            <textarea
              value={formData.supplements}
              onChange={(e) => handleInputChange('supplements', e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-y"
              placeholder="List any vitamins, minerals, or other supplements you're currently taking (or type 'None' if not applicable)"
            />
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