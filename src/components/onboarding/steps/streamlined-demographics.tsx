'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Calendar } from 'lucide-react'

interface StreamlinedDemographicsProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function StreamlinedDemographics({ data, onNext, onBack }: StreamlinedDemographicsProps) {
  const [formData, setFormData] = useState({
    first_name: data?.first_name || '',
    last_name: data?.last_name || '',
    email: data?.email || '',
    date_of_birth: data?.date_of_birth || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.date_of_birth?.trim()) {
      newErrors.date_of_birth = 'Date of birth is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-dark-800 border-dark-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <User className="w-5 h-5 text-primary-400" />
          <span>Basic Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-white">First Name *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                className={`bg-dark-700 border-dark-600 text-white placeholder:text-dark-400 ${errors.first_name ? 'border-red-500' : ''}`}
              />
              {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-white">Last Name *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                className={`bg-dark-700 border-dark-600 text-white placeholder:text-dark-400 ${errors.last_name ? 'border-red-500' : ''}`}
              />
              {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={`bg-dark-700 border-dark-600 text-white placeholder:text-dark-400 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth" className="text-white">Date of Birth *</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className={`bg-dark-700 border-dark-600 text-white ${errors.date_of_birth ? 'border-red-500' : ''}`}
            />
            {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
          </div>

          <div className="flex justify-between pt-6">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} className="bg-dark-700 border-dark-600 text-white hover:bg-dark-600">
                Back
              </Button>
            )}
            <Button type="submit" className="ml-auto bg-primary-600 hover:bg-primary-700 text-white">
              Next
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 