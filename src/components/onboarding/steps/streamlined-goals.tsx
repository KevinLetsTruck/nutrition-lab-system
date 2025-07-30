'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Target } from 'lucide-react'

interface StreamlinedGoalsProps {
  data?: any
  onNext: (data: any) => void
  onBack?: () => void
}

export function StreamlinedGoals({ data, onNext, onBack }: StreamlinedGoalsProps) {
  const [formData, setFormData] = useState({
    healthGoals: data?.healthGoals || [],
    primaryConcern: data?.primaryConcern || '',
    timeline: data?.timeline || ''
  })

  const healthGoalOptions = [
    'Weight Management',
    'Energy & Vitality',
    'Digestive Health',
    'Hormone Balance',
    'Immune Support',
    'Heart Health',
    'Mental Clarity',
    'Sleep Quality',
    'Stress Management',
    'Muscle Building',
    'Recovery & Performance',
    'General Wellness'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.includes(goal)
        ? prev.healthGoals.filter((g: string) => g !== goal)
        : [...prev.healthGoals, goal]
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-primary-400" />
          <span>Health Goals</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Health Goals */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-4 block">What are your primary health goals? (Select all that apply)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-3 p-3 bg-dark-700 border border-dark-600 rounded-lg">
                  <Checkbox
                    id={goal}
                    checked={formData.healthGoals.includes(goal)}
                    onCheckedChange={() => handleGoalToggle(goal)}
                    className="text-primary-500"
                  />
                  <Label htmlFor={goal} className="text-white text-sm cursor-pointer">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Health Concern */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-3 block">What is your most pressing health concern?</Label>
            <textarea
              className="w-full px-4 py-3 bg-dark-800 border border-dark-600 text-white rounded-lg shadow-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20 transition-all duration-200"
              rows={4}
              value={formData.primaryConcern}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryConcern: e.target.value }))}
              placeholder="Describe your main health concern..."
            />
          </div>

          {/* Timeline */}
          <div className="form-field">
            <Label className="text-base font-medium text-white mb-4 block">What is your timeline for achieving these goals?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['1-3 months', '3-6 months', '6-12 months', '1+ years'].map((timeline) => (
                <div key={timeline} className="flex items-center space-x-3 p-3 bg-dark-700 border border-dark-600 rounded-lg">
                  <input
                    type="radio"
                    id={timeline}
                    name="timeline"
                    value={timeline}
                    checked={formData.timeline === timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    className="text-primary-500"
                  />
                  <Label htmlFor={timeline} className="text-white text-sm cursor-pointer">{timeline}</Label>
                </div>
              ))}
            </div>
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