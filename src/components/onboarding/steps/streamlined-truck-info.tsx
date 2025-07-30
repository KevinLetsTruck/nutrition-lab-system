'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    truckNumber: data?.truckNumber || '',
    company: data?.company || '',
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="truckNumber">Truck Number</Label>
              <Input
                id="truckNumber"
                value={formData.truckNumber}
                onChange={(e) => handleInputChange('truckNumber', e.target.value)}
                placeholder="Enter truck number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Route Type</Label>
            <Select value={formData.routeType} onValueChange={(value) => handleInputChange('routeType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select route type" />
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

          <div className="space-y-2">
            <Label>Average Hours Per Week</Label>
            <Select value={formData.hoursPerWeek} onValueChange={(value) => handleInputChange('hoursPerWeek', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hours per week" />
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

          <div className="space-y-2">
            <Label>Sleep Schedule</Label>
            <Select value={formData.sleepSchedule} onValueChange={(value) => handleInputChange('sleepSchedule', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sleep schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular schedule</SelectItem>
                <SelectItem value="irregular">Irregular schedule</SelectItem>
                <SelectItem value="night-shift">Night shift</SelectItem>
                <SelectItem value="split-sleep">Split sleep</SelectItem>
              </SelectContent>
            </Select>
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