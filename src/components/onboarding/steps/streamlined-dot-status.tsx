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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current DOT Status */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Current DOT Status</Label>
            <Select value={formData.dotStatus} onValueChange={(value) => handleInputChange('dotStatus', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your current DOT status" />
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

          {/* Medical Restrictions */}
          <div className="form-field">
            <div className="flex items-center space-x-3 p-4 bg-dark-700 border border-dark-600 rounded-lg">
              <Checkbox
                id="hasRestrictions"
                checked={formData.hasRestrictions}
                onCheckedChange={(checked) => handleInputChange('hasRestrictions', checked)}
                className="text-primary-500"
              />
              <Label htmlFor="hasRestrictions" className="text-white font-medium cursor-pointer">
                Do you have any medical restrictions?
              </Label>
            </div>

            {formData.hasRestrictions && (
              <div className="mt-6 p-4 bg-dark-700 border border-dark-600 rounded-lg">
                <Label className="text-base font-medium text-white mb-4 block">Medical Restrictions (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Vision', 'Hearing', 'Diabetes', 'Cardiac', 'Respiratory', 'Neurological', 'Musculoskeletal', 'Other'].map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-3">
                      <Checkbox
                        id={restriction}
                        checked={formData.restrictions.includes(restriction)}
                        onCheckedChange={(checked) => {
                          const newRestrictions = checked
                            ? [...formData.restrictions, restriction]
                            : formData.restrictions.filter((r: string) => r !== restriction)
                          handleInputChange('restrictions', newRestrictions)
                        }}
                        className="text-primary-500"
                      />
                      <Label htmlFor={restriction} className="text-white text-sm cursor-pointer">{restriction}</Label>
                    </div>
                  ))}
                </div>
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
              {onComplete ? 'Complete Onboarding' : 'Next'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 