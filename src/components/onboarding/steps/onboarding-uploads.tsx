'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, AlertTriangle } from 'lucide-react'

interface OnboardingUploadsProps {
  data: any
  onUpdate: (data: any) => void
  onComplete: () => void
}

export function OnboardingUploads({ data, onUpdate, onComplete }: OnboardingUploadsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 rounded-2xl">
          <Upload className="w-8 h-8 text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">
          File Uploads
        </h2>
        <p className="text-dark-300">
          Upload lab reports, medical records, and other relevant documents.
        </p>
      </div>

      <Card className="bg-dark-700/50 border-dark-600 p-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto" />
          <h3 className="text-lg font-semibold text-white">
            File Uploads Step
          </h3>
          <p className="text-dark-300">
            This step will include categorized file uploads for lab reports, medical records, food photos, CGM data, and supplements.
          </p>
          <Button onClick={onComplete} className="mt-4">
            Continue (Placeholder)
          </Button>
        </div>
      </Card>
    </div>
  )
} 