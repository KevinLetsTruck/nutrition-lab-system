'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield } from 'lucide-react'

interface StreamlinedDotStatusProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
  onComplete?: (data: any) => void
}

export function StreamlinedDotStatus({ data, onNext, onBack, onComplete }: StreamlinedDotStatusProps) {
  const [formData, setFormData] = useState({
    dotStatus: data?.dotStatus || '',
    lastPhysical: data?.lastPhysical || '',
    medicalCardExpiry: data?.medicalCardExpiry || '',
    hasRestrictions: data?.hasRestrictions || false,
    restrictions: data?.restrictions || [],
    medications: data?.medications || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onComplete) {
      onComplete(formData)
    } else {
      onNext(formData)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary-400" />
          <span>DOT Medical Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Current DOT Status</Label>
            <Select value={formData.dotStatus} onValueChange={(value) => handleInputChange('dotStatus', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select DOT status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clear">Clear - No restrictions</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="pending">Pending renewal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Last Physical Exam Date</Label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={formData.lastPhysical}
                onChange={(e) => handleInputChange('lastPhysical', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Medical Card Expiry Date</Label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-md"
                value={formData.medicalCardExpiry}
                onChange={(e) => handleInputChange('medicalCardExpiry', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasRestrictions"
                checked={formData.hasRestrictions}
                onCheckedChange={(checked) => handleInputChange('hasRestrictions', checked)}
              />
              <Label htmlFor="hasRestrictions">Do you have any medical restrictions?</Label>
            </div>

            {formData.hasRestrictions && (
              <div className="space-y-2">
                <Label>Medical Restrictions (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Vision', 'Hearing', 'Diabetes', 'Cardiac', 'Respiratory', 'Neurological', 'Musculoskeletal', 'Other'].map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-2">
                      <Checkbox
                        id={restriction}
                        checked={formData.restrictions.includes(restriction)}
                        onCheckedChange={(checked) => {
                          const newRestrictions = checked
                            ? [...formData.restrictions, restriction]
                            : formData.restrictions.filter((r: string) => r !== restriction)
                          handleInputChange('restrictions', newRestrictions)
                        }}
                      />
                      <Label htmlFor={restriction} className="text-sm">{restriction}</Label>
                    </div>
                  ))}
                </div>
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
              {onComplete ? 'Complete Onboarding' : 'Next'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 