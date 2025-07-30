'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, X } from 'lucide-react'

interface StreamlinedMedicationsProps {
  initialData?: any
  onNext: (data: any) => void
  onBack?: () => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedMedications({ initialData, onNext, onBack, onSave, isLoading }: StreamlinedMedicationsProps) {
  const [formData, setFormData] = useState({
    currentMedications: initialData?.currentMedications || [],
    supplements: initialData?.supplements || [],
    medicalConditions: initialData?.medicalConditions || []
  })

  const [newMedication, setNewMedication] = useState('')
  const [newSupplement, setNewSupplement] = useState('')
  const [newCondition, setNewCondition] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // FIXED: Removed aggressive auto-save that was preventing user input
  // Auto-save is now handled by the parent component with proper debouncing

  const commonConditions = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Asthma',
    'Arthritis',
    'Depression',
    'Anxiety',
    'Sleep Apnea',
    'High Cholesterol',
    'Thyroid Issues',
    'None'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const addMedication = () => {
    if (newMedication.trim()) {
      const newMedications = [...formData.currentMedications, newMedication.trim()]
      setFormData(prev => ({
        ...prev,
        currentMedications: newMedications
      }))
      setNewMedication('')
    }
  }

  const addSupplement = () => {
    if (newSupplement.trim()) {
      const newSupplements = [...formData.supplements, newSupplement.trim()]
      setFormData(prev => ({
        ...prev,
        supplements: newSupplements
      }))
      setNewSupplement('')
    }
  }

  const addCondition = () => {
    if (newCondition.trim()) {
      const newConditions = [...formData.medicalConditions, newCondition.trim()]
      setFormData(prev => ({
        ...prev,
        medicalConditions: newConditions
      }))
      setNewCondition('')
    }
  }

  const removeMedication = (index: number) => {
    const newMedications = formData.currentMedications.filter((_: string, i: number) => i !== index)
    setFormData(prev => ({
      ...prev,
      currentMedications: newMedications
    }))
  }

  const removeSupplement = (index: number) => {
    const newSupplements = formData.supplements.filter((_: string, i: number) => i !== index)
    setFormData(prev => ({
      ...prev,
      supplements: newSupplements
    }))
  }

  const removeCondition = (index: number) => {
    const newConditions = formData.medicalConditions.filter((_: string, i: number) => i !== index)
    setFormData(prev => ({
      ...prev,
      medicalConditions: newConditions
    }))
  }

  const handleConditionToggle = (condition: string, checked: boolean) => {
    if (condition === 'None') {
      // If "None" is selected, clear all other conditions
      setFormData(prev => ({
        ...prev,
        medicalConditions: checked ? [] : []
      }))
    } else {
      // Remove "None" if it exists and add/remove the selected condition
      const currentConditions = formData.medicalConditions.filter((c: string) => c !== 'None')
      const newConditions = checked
        ? [...currentConditions, condition]
        : currentConditions.filter((c: string) => c !== condition)
      
      setFormData(prev => ({
        ...prev,
        medicalConditions: newConditions
      }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-primary-400">💊</span>
          <span>Medications & Health</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current Medications */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Current Medications
            </Label>
            <div className="flex gap-3">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Enter medication name"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addMedication()
                  }
                }}
              />
              <Button
                type="button"
                onClick={addMedication}
                disabled={isLoading || !newMedication.trim()}
                className="px-4 bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.currentMedications.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.currentMedications.map((medication: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                    <span className="text-sm text-gray-300">{medication}</span>
                    <Button
                      type="button"
                      onClick={() => removeMedication(index)}
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

          {/* Medical Conditions */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Medical Conditions (Select all that apply)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {commonConditions.map((condition) => (
                <div key={condition} className="flex items-center space-x-2">
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={formData.medicalConditions.includes(condition)}
                    onCheckedChange={(checked) => handleConditionToggle(condition, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`condition-${condition}`} className="text-sm text-gray-300">
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Custom condition input */}
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-400 mb-2 block">
                Add Other Condition
              </Label>
              <div className="flex gap-3">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Enter other medical condition"
                  disabled={isLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCondition()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addCondition}
                  disabled={isLoading || !newCondition.trim()}
                  className="px-4 bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.medicalConditions.filter((c: string) => !commonConditions.includes(c)).length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.medicalConditions
                    .filter((condition: string) => !commonConditions.includes(condition))
                    .map((condition: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                      <span className="text-sm text-gray-300">{condition}</span>
                      <Button
                        type="button"
                        onClick={() => removeCondition(index)}
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