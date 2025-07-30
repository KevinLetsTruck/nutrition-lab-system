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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>Current Medications</Label>
            <div className="flex space-x-2">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Add medication"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
              />
              <Button type="button" onClick={addMedication}>Add</Button>
            </div>
            {formData.currentMedications.length > 0 && (
              <div className="space-y-2">
                {formData.currentMedications.map((med: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span>{med}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        currentMedications: prev.currentMedications.filter((_: string, i: number) => i !== index)
                      }))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Supplements</Label>
            <div className="flex space-x-2">
              <Input
                value={newSupplement}
                onChange={(e) => setNewSupplement(e.target.value)}
                placeholder="Add supplement"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSupplement())}
              />
              <Button type="button" onClick={addSupplement}>Add</Button>
            </div>
            {formData.supplements.length > 0 && (
              <div className="space-y-2">
                {formData.supplements.map((supp: string, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span>{supp}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        supplements: prev.supplements.filter((_: string, i: number) => i !== index)
                      }))}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-6">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button type="submit" className="ml-auto">
              Next
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 