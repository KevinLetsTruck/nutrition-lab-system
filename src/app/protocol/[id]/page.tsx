'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Protocol {
  id: string
  clientId: string
  content: string
  createdAt: string
  clientName?: string
}

export default function ProtocolPage() {
  const params = useParams()
  const protocolId = params.id as string
  
  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch protocol from API
    // For now, using mock data
    const mockProtocol: Protocol = {
      id: protocolId,
      clientId: '1',
      clientName: 'John Smith',
      content: `GREETING
Hello John,

Thank you for completing your comprehensive health assessment. Based on your lab results and our consultation, I've created a personalized protocol to address your health goals.

PHASE 1: GUT RESTORATION & INFLAMMATION REDUCTION

DURATION: 8 weeks
CLINICAL FOCUS: Reduce inflammation, improve gut health, increase energy levels
CURRENT STATUS: Elevated inflammation markers, compromised gut health, low energy levels

PRIORITY SUPPLEMENTS

NAME OF PRODUCT: Biotics Research - Bio-D-Mulsion Forte
DOSE: 1 drop daily
TIMING: With breakfast
PURPOSE: Optimize vitamin D levels for immune function and inflammation reduction

NAME OF PRODUCT: Biotics Research - CytoFlora
DOSE: 1 capsule twice daily
TIMING: 30 minutes before meals
PURPOSE: Support healthy gut microbiome and reduce inflammation

NAME OF PRODUCT: Biotics Research - Magnesium Glycinate
DOSE: 200mg twice daily
TIMING: With meals
PURPOSE: Support muscle function and energy production

DAILY PROTOCOL SCHEDULE

UPON WAKING: 16oz water with lemon, 1 drop Bio-D-Mulsion Forte
BEFORE BREAKFAST: 1 CytoFlora capsule
BETWEEN BREAKFAST & LUNCH: 200mg Magnesium Glycinate
BEFORE LUNCH: 1 CytoFlora capsule
WITH LARGEST MEAL: 200mg Magnesium Glycinate
BETWEEN LUNCH & DINNER: Hydration focus, herbal tea

PROTOCOL NOTES

• Focus on whole foods, avoiding processed foods and added sugars
• Prioritize sleep hygiene - aim for 7-8 hours per night
• Consider meal prep strategies for truck stops
• Monitor energy levels and digestive symptoms
• Schedule follow-up in 4 weeks to assess progress
• Continue blood pressure medication as prescribed`,
      createdAt: '2024-01-15T10:30:00Z'
    }
    
    setTimeout(() => {
      setProtocol(mockProtocol)
      setLoading(false)
    }, 500)
  }, [protocolId])

  const copyToClipboard = async () => {
    if (!protocol) return
    
    try {
      await navigator.clipboard.writeText(protocol.content)
      // TODO: Show success toast
      console.log('Protocol copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const downloadPDF = () => {
    // TODO: Implement PDF download
    console.log('Downloading PDF for protocol:', protocolId)
  }

  const editProtocol = () => {
    // TODO: Implement protocol editing
    console.log('Edit protocol:', protocolId)
  }

  const emailToClient = () => {
    // TODO: Implement email functionality
    console.log('Email protocol to client:', protocol?.clientId)
  }

  const markAsActive = () => {
    // TODO: Implement marking as active protocol
    console.log('Mark as active protocol:', protocolId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading protocol...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!protocol) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-gray-400">Protocol not found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-slate-800 rounded-lg p-8">
          {/* Protocol Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">FNTP Protocol</h1>
            <p className="text-gray-400">
              Generated for {protocol.clientName} on {formatDate(protocol.createdAt)}
            </p>
          </div>

          {/* Copy/Print Actions */}
          <div className="flex justify-end gap-4 mb-6">
            <button 
              onClick={copyToClipboard} 
              className="px-4 py-2 bg-slate-700 rounded text-white hover:bg-slate-600 transition-colors"
            >
              Copy Text
            </button>
            <button 
              onClick={downloadPDF} 
              className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
          </div>

          {/* Protocol Content - Exactly Following Template */}
          <div className="protocol-content whitespace-pre-wrap font-mono text-sm text-gray-300 bg-slate-700 p-6 rounded-lg border border-slate-600">
            {protocol.content}
          </div>

          {/* Admin Actions */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Admin Actions</h3>
            <div className="flex gap-4">
              <button 
                onClick={editProtocol} 
                className="px-4 py-2 bg-slate-700 rounded text-white hover:bg-slate-600 transition-colors"
              >
                Edit Protocol
              </button>
              <button 
                onClick={emailToClient} 
                className="px-4 py-2 bg-green-600 rounded text-white hover:bg-green-700 transition-colors"
              >
                Send to Client
              </button>
              <button 
                onClick={markAsActive} 
                className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors"
              >
                Set as Active Protocol
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 