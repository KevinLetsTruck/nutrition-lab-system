'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface StreamlinedDotStatusProps {
  initialData?: any
  onNext: (data: any) => void
  onBack?: () => void
  onComplete?: (data: any) => void
  onSave?: (data: any) => void
  isLoading?: boolean
}

export function StreamlinedDotStatus({ data, onNext, onBack, onComplete, onSave, isLoading }: StreamlinedDotStatusProps) {
  const [formData, setFormData] = useState({
    dotStatus: data?.dotStatus || '',
    hasRestrictions: data?.hasRestrictions || false,
    restrictions: data?.restrictions || [],
    medications: data?.medications || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRestriction, setNewRestriction] = useState('')
  const [newMedication, setNewMedication] = useState('')

  // FIXED: Removed aggressive auto-save that was preventing user input
  // Auto-save is now handled by the parent component with proper debouncing

  const dotStatusOptions = [
    'Valid DOT Medical Card',
    'Expired DOT Medical Card',
    'No DOT Medical Card',
    'Exempt from DOT Medical Card',
    'Not Applicable'
  ]

  const commonRestrictions = [
    'Corrective Lenses Required',
    'Hearing Aid Required',
    'Diabetes Management',
    'Blood Pressure Monitoring',
    'Sleep Apnea Treatment',
    'No Commercial Driving',
    'Daytime Driving Only',
    'No Hazmat Transport',
    'Other'
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.dotStatus) {
      newErrors.dotStatus = 'Please select your current DOT status'
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
      // FIXED: Save data when user clicks Next/Complete
      if (onSave) {
        onSave(formData)
      }
      
      if (onComplete) {
        await onComplete(formData)
      } else {
        await onNext(formData)
      }
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts selecting
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    if (restriction === 'Other') {
      // Handle "Other" restriction specially
      if (checked) {
        // Don't add "Other" to the list, just enable the input
        setFormData(prev => ({ ...prev, hasRestrictions: true }))
      } else {
        // Remove any custom restrictions when "Other" is unchecked
        const filteredRestrictions = formData.restrictions.filter(r => !r.startsWith('Custom:'))
        setFormData(prev => ({ 
          ...prev, 
          restrictions: filteredRestrictions,
          hasRestrictions: filteredRestrictions.length > 0
        }))
      }
    } else {
      const newRestrictions = checked
        ? [...formData.restrictions, restriction]
        : formData.restrictions.filter((r: string) => r !== restriction)
      
      setFormData(prev => ({ 
        ...prev, 
        restrictions: newRestrictions,
        hasRestrictions: newRestrictions.length > 0
      }))
    }
  }

  const addCustomRestriction = () => {
    if (newRestriction.trim()) {
      const customRestriction = `Custom: ${newRestriction.trim()}`
      const newRestrictions = [...formData.restrictions, customRestriction]
      setFormData(prev => ({ 
        ...prev, 
        restrictions: newRestrictions,
        hasRestrictions: true
      }))
      setNewRestriction('')
    }
  }

  const removeRestriction = (index: number) => {
    const newRestrictions = formData.restrictions.filter((_: string, i: number) => i !== index)
    setFormData(prev => ({ 
      ...prev, 
      restrictions: newRestrictions,
      hasRestrictions: newRestrictions.length > 0
    }))
  }

  const addMedication = () => {
    if (newMedication.trim()) {
      const newMedications = [...formData.medications, newMedication.trim()]
      setFormData(prev => ({
        ...prev,
        medications: newMedications
      }))
      setNewMedication('')
    }
  }

  const removeMedication = (index: number) => {
    const newMedications = formData.medications.filter((_: string, i: number) => i !== index)
    setFormData(prev => ({
      ...prev,
      medications: newMedications
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-primary-400">🚛</span>
          <span>DOT Medical Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* DOT Status */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Current DOT Medical Status <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.dotStatus}
              onValueChange={(value) => handleInputChange('dotStatus', value)}
              disabled={isLoading}
            >
              <SelectTrigger className={`${errors.dotStatus ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}>
                <SelectValue placeholder="Select your DOT medical status" />
              </SelectTrigger>
              <SelectContent>
                {dotStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dotStatus && <p className="text-sm text-red-400 mt-2">{errors.dotStatus}</p>}
          </div>

          {/* Medical Restrictions */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              Medical Restrictions
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {commonRestrictions.map((restriction) => (
                <div key={restriction} className="flex items-center space-x-2">
                  <Checkbox
                    id={`restriction-${restriction}`}
                    checked={formData.restrictions.includes(restriction) || 
                             (restriction === 'Other' && formData.restrictions.some(r => r.startsWith('Custom:')))}
                    onCheckedChange={(checked) => handleRestrictionChange(restriction, checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`restriction-${restriction}`} className="text-sm text-gray-300">
                    {restriction}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Custom restriction input */}
            {(formData.restrictions.includes('Other') || formData.restrictions.some(r => r.startsWith('Custom:'))) && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-gray-400 mb-2 block">
                  Specify Other Restriction
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={newRestriction}
                    onChange={(e) => setNewRestriction(e.target.value)}
                    placeholder="Enter other restriction"
                    disabled={isLoading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addCustomRestriction()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addCustomRestriction}
                    disabled={isLoading || !newRestriction.trim()}
                    className="px-4 bg-primary-600 hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Display restrictions */}
            {formData.restrictions.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.restrictions.map((restriction: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-dark-700 rounded-lg">
                    <span className="text-sm text-gray-300">{restriction}</span>
                    <Button
                      type="button"
                      onClick={() => removeRestriction(index)}
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

          {/* DOT Medications */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">
              DOT-Reportable Medications
            </Label>
            <p className="text-sm text-gray-400 mb-3">
              List any medications that may affect your DOT medical certification
            </p>
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
            
            {formData.medications.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.medications.map((medication: string, index: number) => (
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
              {isSubmitting ? 'Saving...' : 'Complete Onboarding'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 