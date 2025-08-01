'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface OnboardingData {
  age: number
  occupation: string
  primaryHealthConcern: string
  currentMedications: string
  dietaryRestrictions: string
  sleepQuality: string
  stressLevel: string
  exerciseFrequency: string
  goals: string
  truckDriver: boolean
  dotCompliance: boolean
}

export default function ClientOnboardingPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<OnboardingData>({
    age: 0,
    occupation: '',
    primaryHealthConcern: '',
    currentMedications: '',
    dietaryRestrictions: '',
    sleepQuality: '',
    stressLevel: '',
    exerciseFrequency: '',
    goals: '',
    truckDriver: false,
    dotCompliance: false
  })

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      const result = await response.json()
      
      if (!response.ok || result.user?.role !== 'client') {
        router.push('/auth')
        return
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/auth')
    }
  }, [router])

  useEffect(() => {
    // Check if user is authenticated and is a client
    checkAuth()
  }, [checkAuth])

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/client/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Onboarding completed successfully!')
        router.push('/client/success')
      } else {
        toast.error(result.error || 'Failed to save onboarding data')
      }
    } catch (error) {
      console.error('Error saving onboarding:', error)
      toast.error('An error occurred while saving your data')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="age" className="text-white">Age *</Label>
        <Input
          id="age"
          type="number"
          required
          min="18"
          max="120"
          value={formData.age || ''}
          onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Enter your age"
        />
      </div>

      <div>
        <Label htmlFor="occupation" className="text-white">Occupation *</Label>
        <Input
          id="occupation"
          type="text"
          required
          value={formData.occupation}
          onChange={(e) => handleInputChange('occupation', e.target.value)}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="What do you do for work?"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="truckDriver"
          checked={formData.truckDriver}
          onCheckedChange={(checked) => handleInputChange('truckDriver', checked)}
        />
        <Label htmlFor="truckDriver" className="text-white">
          I am a truck driver
        </Label>
      </div>

      {formData.truckDriver && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="dotCompliance"
            checked={formData.dotCompliance}
            onCheckedChange={(checked) => handleInputChange('dotCompliance', checked)}
          />
          <Label htmlFor="dotCompliance" className="text-white">
            I need to maintain DOT medical compliance
          </Label>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="primaryHealthConcern" className="text-white">Primary Health Concern *</Label>
        <Textarea
          id="primaryHealthConcern"
          required
          value={formData.primaryHealthConcern}
          onChange={(e) => handleInputChange('primaryHealthConcern', e.target.value)}
          className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
          placeholder="What is your main health concern or goal?"
        />
      </div>

      <div>
        <Label htmlFor="currentMedications" className="text-white">Current Medications</Label>
        <Textarea
          id="currentMedications"
          value={formData.currentMedications}
          onChange={(e) => handleInputChange('currentMedications', e.target.value)}
          className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
          placeholder="List any medications you're currently taking..."
        />
      </div>

      <div>
        <Label htmlFor="dietaryRestrictions" className="text-white">Dietary Restrictions</Label>
        <Textarea
          id="dietaryRestrictions"
          value={formData.dietaryRestrictions}
          onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
          className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
          placeholder="Any food allergies, intolerances, or dietary preferences?"
        />
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="sleepQuality" className="text-white">Sleep Quality</Label>
        <Select value={formData.sleepQuality} onValueChange={(value) => handleInputChange('sleepQuality', value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="How would you rate your sleep quality?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excellent">Excellent (8+ hours, feel rested)</SelectItem>
            <SelectItem value="good">Good (7-8 hours, mostly rested)</SelectItem>
            <SelectItem value="fair">Fair (6-7 hours, sometimes tired)</SelectItem>
            <SelectItem value="poor">Poor (less than 6 hours, often tired)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="stressLevel" className="text-white">Stress Level</Label>
        <Select value={formData.stressLevel} onValueChange={(value) => handleInputChange('stressLevel', value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="How would you rate your current stress level?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low (manageable stress)</SelectItem>
            <SelectItem value="moderate">Moderate (some stress, but coping)</SelectItem>
            <SelectItem value="high">High (significant stress affecting daily life)</SelectItem>
            <SelectItem value="severe">Severe (overwhelming stress)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="exerciseFrequency" className="text-white">Exercise Frequency</Label>
        <Select value={formData.exerciseFrequency} onValueChange={(value) => handleInputChange('exerciseFrequency', value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="How often do you exercise?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="3-5x_week">3-5 times per week</SelectItem>
            <SelectItem value="1-2x_week">1-2 times per week</SelectItem>
            <SelectItem value="rarely">Rarely or never</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="goals" className="text-white">Health Goals *</Label>
        <Textarea
          id="goals"
          required
          value={formData.goals}
          onChange={(e) => handleInputChange('goals', e.target.value)}
          className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
          placeholder="What are your main health goals? (e.g., lose weight, improve energy, better sleep, manage stress, etc.)"
        />
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h3 className="text-blue-300 font-semibold mb-2">What happens next?</h3>
        <ul className="text-blue-200 text-sm space-y-1">
          <li>• Kevin will review your information</li>
          <li>• You&apos;ll receive personalized recommendations</li>
          <li>• Schedule your first consultation</li>
          <li>• Start your health transformation journey</li>
        </ul>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (step) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return renderStep1()
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.age > 0 && formData.occupation.trim() !== ''
      case 2:
        return formData.primaryHealthConcern.trim() !== ''
      case 3:
        return true // Optional fields
      case 4:
        return formData.goals.trim() !== ''
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white">
              Welcome to Your Health Journey
            </CardTitle>
            <CardDescription className="text-slate-400">
              Step {step} of 4 - Let&apos;s get to know you better
            </CardDescription>
            
            {/* Progress bar */}
            <div className="w-full bg-slate-700 rounded-full h-2 mt-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {renderCurrentStep()}
              
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Previous
                </Button>
                
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!canProceed() || isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isLoading ? 'Saving...' : 'Complete Onboarding'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 