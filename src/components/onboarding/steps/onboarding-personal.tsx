'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User, Phone, Mail, Calendar, MapPin, Shield } from 'lucide-react'
import { processSafeFormData, validateFormData, debugFormData } from '@/lib/utils'

interface PersonalData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  occupation: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  preferredCommunication: string
  insuranceProvider: string
  insuranceId: string
}

interface OnboardingPersonalProps {
  data: Partial<PersonalData>
  onUpdate: (data: Partial<PersonalData>) => void
  onComplete: () => void
}

export function OnboardingPersonal({ data, onUpdate, onComplete }: OnboardingPersonalProps) {
  const [formData, setFormData] = useState<PersonalData>({
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    phone: data.phone || '',
    dateOfBirth: data.dateOfBirth || '',
    gender: data.gender || '',
    occupation: data.occupation || '',
    emergencyContactName: data.emergencyContactName || '',
    emergencyContactPhone: data.emergencyContactPhone || '',
    emergencyContactRelationship: data.emergencyContactRelationship || '',
    preferredCommunication: data.preferredCommunication || 'email',
    insuranceProvider: data.insuranceProvider || '',
    insuranceId: data.insuranceId || ''
  })

  const [errors, setErrors] = useState<Partial<PersonalData>>({})

  useEffect(() => {
    onUpdate(formData)
  }, [formData, onUpdate])

  const validateForm = (): boolean => {
    // Debug form data to help identify issues
    debugFormData(formData, 'Onboarding Personal Form')
    
    // Process form data safely
    const safeData = processSafeFormData(formData)
    const validation = validateFormData(safeData)
    
    setErrors(validation.errors)
    return validation.valid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onComplete()
    }
  }

  const handleInputChange = (field: keyof PersonalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.phone && formData.dateOfBirth && formData.gender
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl">
          <User className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Personal Information
        </h2>
        <p className="text-dark-300">
          Please provide your basic contact and demographic information. This helps us personalize your care experience.
        </p>
      </div>

      {/* Basic Information */}
      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <User className="w-5 h-5 text-primary-400" />
          <span>Basic Information</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-3 py-2 bg-dark-600 border rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.firstName ? 'border-red-500' : 'border-dark-500'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-3 py-2 bg-dark-600 border rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.lastName ? 'border-red-500' : 'border-dark-500'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 bg-dark-600 border rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.email ? 'border-red-500' : 'border-dark-500'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 bg-dark-600 border rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.phone ? 'border-red-500' : 'border-dark-500'
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone && (
              <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date of Birth *
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className={`w-full px-3 py-2 bg-dark-600 border rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.dateOfBirth ? 'border-red-500' : 'border-dark-500'
              }`}
            />
            {errors.dateOfBirth && (
              <p className="text-red-400 text-sm mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={`w-full px-3 py-2 bg-dark-600 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.gender ? 'border-red-500' : 'border-dark-500'
              }`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-red-400 text-sm mt-1">{errors.gender}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Occupation
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter your occupation"
            />
          </div>
        </div>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Phone className="w-5 h-5 text-primary-400" />
          <span>Emergency Contact</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Emergency Contact Name
            </label>
            <input
              type="text"
              value={formData.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter emergency contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Emergency Contact Phone
            </label>
            <input
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter emergency contact phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Relationship
            </label>
            <input
              type="text"
              value={formData.emergencyContactRelationship}
              onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Spouse, Parent, Friend"
            />
          </div>
        </div>
      </Card>

      {/* Communication Preferences */}
      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Mail className="w-5 h-5 text-primary-400" />
          <span>Communication Preferences</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Communication Method
            </label>
            <select
              value={formData.preferredCommunication}
              onChange={(e) => handleInputChange('preferredCommunication', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text Message</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Insurance Information (Optional) */}
      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary-400" />
          <span>Insurance Information (Optional)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Insurance Provider
            </label>
            <input
              type="text"
              value={formData.insuranceProvider}
              onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter insurance provider name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Insurance ID/Member Number
            </label>
            <input
              type="text"
              value={formData.insuranceId}
              onChange={(e) => handleInputChange('insuranceId', e.target.value)}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-md text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter insurance ID or member number"
            />
          </div>
        </div>
      </Card>

      {/* Continue Button */}
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid()}
          size="lg"
          className="px-8 py-3"
        >
          Continue to Health History
        </Button>
        <p className="text-sm text-dark-400 mt-3">
          * Required fields
        </p>
      </div>
    </div>
  )
} 