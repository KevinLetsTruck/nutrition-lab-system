'use client'

import { useEffect } from 'react'

export default function RedirectToClients() {
  useEffect(() => {
    // Force a hard redirect to bypass any client-side routing issues
    window.location.href = '/clients'
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Redirecting to clients...</div>
    </div>
  )
}