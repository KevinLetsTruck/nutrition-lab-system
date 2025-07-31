'use client'

import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import PractitionerAnalysis from '@/components/reports/PractitionerAnalysis'

export default function PractitionerAnalysisPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const clientId = params.clientId as string
  const mode = (searchParams.get('mode') as 'full' | 'coaching') || 'full'
  const sessionDate = searchParams.get('sessionDate') 
    ? new Date(searchParams.get('sessionDate')!) 
    : new Date()

  return (
    <PractitionerAnalysis
      clientId={clientId}
      sessionDate={sessionDate}
      mode={mode}
    />
  )
} 