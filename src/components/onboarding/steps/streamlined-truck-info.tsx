'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Truck } from 'lucide-react'

interface StreamlinedTruckInfoProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function StreamlinedTruckInfo({ data, onNext, onBack }: StreamlinedTruckInfoProps) {
  const [formData, setFormData] = useState({
    routeType: data?.routeType || '',
    hoursPerWeek: data?.hoursPerWeek || '',
    sleepSchedule: data?.sleepSchedule || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-primary-400" />
          <span>Truck Driver Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Route Type */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Route Type</Label>
            <Select value={formData.routeType} onValueChange={(value) => handleInputChange('routeType', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your route type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="long-haul">Long Haul</SelectItem>
                <SelectItem value="dedicated">Dedicated</SelectItem>
                <SelectItem value="team">Team Driving</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Average Hours Per Week */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Average Hours Per Week</Label>
            <Select value={formData.hoursPerWeek} onValueChange={(value) => handleInputChange('hoursPerWeek', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your average hours per week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<40">Less than 40 hours</SelectItem>
                <SelectItem value="40-50">40-50 hours</SelectItem>
                <SelectItem value="50-60">50-60 hours</SelectItem>
                <SelectItem value="60-70">60-70 hours</SelectItem>
                <SelectItem value=">70">More than 70 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sleep Schedule */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">Sleep Schedule</Label>
            <Select value={formData.sleepSchedule} onValueChange={(value) => handleInputChange('sleepSchedule', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your typical sleep schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular schedule</SelectItem>
                <SelectItem value="irregular">Irregular schedule</SelectItem>
                <SelectItem value="night-shift">Night shift</SelectItem>
                <SelectItem value="split-sleep">Split sleep</SelectItem>
              </SelectContent>
            </Select>
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