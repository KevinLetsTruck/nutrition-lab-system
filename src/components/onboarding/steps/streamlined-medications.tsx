'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Pill } from 'lucide-react'

interface StreamlinedMedicationsProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function StreamlinedMedications({ data, onNext, onBack }: StreamlinedMedicationsProps) {
  const [formData, setFormData] = useState({
    currentMedications: data?.currentMedications || [],
    supplements: data?.supplements || [],
    medicalConditions: data?.medicalConditions || []
  })

  const [newMedication, setNewMedication] = useState('')
  const [newSupplement, setNewSupplement] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const addMedication = () => {
    if (newMedication.trim()) {
      setFormData(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication.trim()]
      }))
      setNewMedication('')
    }
  }

  const addSupplement = () => {
    if (newSupplement.trim()) {
      setFormData(prev => ({
        ...prev,
        supplements: [...prev.supplements, newSupplement.trim()]
      }))
      setNewSupplement('')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pill className="w-5 h-5 text-primary-400" />
          <span>Medications & Supplements</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current Medications Section */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Current Medications</Label>
            <div className="flex space-x-3">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Enter medication name (e.g., lisinopril)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addMedication}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Add
              </Button>
            </div>
            {formData.currentMedications.length > 0 && (
              <div className="space-y-3 mt-4">
                {formData.currentMedications.map((med: string, index: number) => (
                  <div key={index} className="medication-item">
                    <span className="text-white font-medium">{med}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        currentMedications: prev.currentMedications.filter((_: string, i: number) => i !== index)
                      }))}
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supplements Section */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Supplements</Label>
            <div className="flex space-x-3">
              <Input
                value={newSupplement}
                onChange={(e) => setNewSupplement(e.target.value)}
                placeholder="Enter supplement name (e.g., vitamin D, fish oil)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSupplement())}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={addSupplement}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200"
              >
                Add
              </Button>
            </div>
            {formData.supplements.length > 0 && (
              <div className="space-y-3 mt-4">
                {formData.supplements.map((supp: string, index: number) => (
                  <div key={index} className="medication-item">
                    <span className="text-white font-medium">{supp}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        supplements: prev.supplements.filter((_: string, i: number) => i !== index)
                      }))}
                      className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                    >
                      Remove
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
                className="px-8 py-3 bg-dark-700 hover:bg-dark-600 text-white font-medium rounded-lg transition-all duration-200 border border-dark-600"
              >
                Back
              </Button>
            )}
            <Button 
              type="submit" 
              className="ml-auto px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              Next
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 