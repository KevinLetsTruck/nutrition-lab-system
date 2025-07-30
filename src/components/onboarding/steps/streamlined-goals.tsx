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
        ? prev.healthGoals.filter(g => g !== goal)
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label>What are your primary health goals? (Select all that apply)</Label>
            <div className="grid grid-cols-2 gap-3">
              {healthGoalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal}
                    checked={formData.healthGoals.includes(goal)}
                    onCheckedChange={() => handleGoalToggle(goal)}
                  />
                  <Label htmlFor={goal} className="text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>What is your most pressing health concern?</Label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={3}
              value={formData.primaryConcern}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryConcern: e.target.value }))}
              placeholder="Describe your main health concern..."
            />
          </div>

          <div className="space-y-4">
            <Label>What is your timeline for achieving these goals?</Label>
            <div className="grid grid-cols-2 gap-3">
              {['1-3 months', '3-6 months', '6-12 months', '1+ years'].map((timeline) => (
                <div key={timeline} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={timeline}
                    name="timeline"
                    value={timeline}
                    checked={formData.timeline === timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  />
                  <Label htmlFor={timeline} className="text-sm">{timeline}</Label>
                </div>
              ))}
            </div>
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