'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pill, AlertTriangle } from 'lucide-react'

interface OnboardingMedicationsProps {
  data: any
  onUpdate: (data: any) => void
  onComplete: () => void
}

export function OnboardingMedications({ data, onUpdate, onComplete }: OnboardingMedicationsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl">
          <Pill className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          Medications & Supplements
        </h2>
        <p className="text-dark-300">
          Tell us about your current medications and supplements.
        </p>
      </div>

      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">
            Medications Step
          </h3>
          <p className="text-dark-300">
            This step will include current medications, supplements, and treatment history.
          </p>
          <Button onClick={onComplete} className="mt-4">
            Continue (Placeholder)
          </Button>
        </div>
      </Card>
    </div>
  )
} 