'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Protocol {
  id: string
  clientId: string
  content: string
  createdAt: string
  clientName?: string
  clientEmail?: string
  status?: string
}

export default function ProtocolPage() {
  const params = useParams()
  const router = useRouter()
  const protocolId = params.id as string
  
  const [protocol, setProtocol] = useState<Protocol | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [settingActive, setSettingActive] = useState(false)

  useEffect(() => {
    const fetchProtocol = async () => {
      try {
        setLoading(true)
        
        // Try to fetch from API first
        const response = await fetch(`/api/protocols/${protocolId}`)
        
        if (response.ok) {
          const { protocol: apiProtocol } = await response.json()
          const transformedProtocol: Protocol = {
            id: apiProtocol.id,
            clientId: apiProtocol.client_id,
            content: apiProtocol.content || '',
            createdAt: apiProtocol.created_at,
            clientName: apiProtocol.client ? `${apiProtocol.client.first_name} ${apiProtocol.client.last_name}` : 'Unknown Client',
            clientEmail: apiProtocol.client?.email,
            status: apiProtocol.status
          }
          setProtocol(transformedProtocol)
          setEditedContent(transformedProtocol.content)
        } else {
          // Fallback to mock data if API fails
          const mockProtocol: Protocol = {
            id: protocolId,
            clientId: '1',
            clientName: 'John Smith',
            clientEmail: 'john.smith@example.com',
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
            createdAt: '2024-01-15T10:30:00Z',
            status: 'draft'
          }
          setProtocol(mockProtocol)
          setEditedContent(mockProtocol.content)
        }
      } catch (error) {
        console.error('Error fetching protocol:', error)
        // Fallback to mock data
        const mockProtocol: Protocol = {
          id: protocolId,
          clientId: '1',
          clientName: 'John Smith',
          clientEmail: 'john.smith@example.com',
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
          createdAt: '2024-01-15T10:30:00Z',
          status: 'draft'
        }
        setProtocol(mockProtocol)
        setEditedContent(mockProtocol.content)
      } finally {
        setLoading(false)
      }
    }

    fetchProtocol()
  }, [protocolId])

  const copyToClipboard = async () => {
    if (!protocol) return
    
    try {
      await navigator.clipboard.writeText(protocol.content)
      alert('Protocol copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const downloadPDF = () => {
    // TODO: Implement PDF download
    alert('PDF download feature coming soon!')
  }

  const editProtocol = () => {
    setIsEditing(true)
  }

  const saveProtocol = async () => {
    if (!protocol) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent })
      })

      if (response.ok) {
        const { protocol: updatedProtocol } = await response.json()
        setProtocol({
          ...protocol,
          content: updatedProtocol.content
        })
        setIsEditing(false)
        alert('Protocol saved successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to save protocol: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving protocol:', error)
      alert('Failed to save protocol. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditedContent(protocol?.content || '')
    setIsEditing(false)
  }

  const emailToClient = async () => {
    if (!protocol || !protocol.clientEmail || !protocol.clientName) {
      alert('Client information not available')
      return
    }
    
    setSendingEmail(true)
    try {
      const response = await fetch('/api/email-protocol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          protocolId: protocol.id,
          clientId: protocol.clientId,
          clientEmail: protocol.clientEmail,
          clientName: protocol.clientName,
          protocolContent: protocol.content
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Protocol sent to ${protocol.clientName} at ${protocol.clientEmail}!`)
      } else {
        const error = await response.json()
        alert(`Failed to send protocol: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending protocol:', error)
      alert('Failed to send protocol. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  const markAsActive = async () => {
    if (!protocol) return
    
    setSettingActive(true)
    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'active' })
      })

      if (response.ok) {
        setProtocol({
          ...protocol,
          status: 'active'
        })
        alert('Protocol set as active!')
      } else {
        const error = await response.json()
        alert(`Failed to set protocol as active: ${error.error}`)
      }
    } catch (error) {
      console.error('Error setting protocol as active:', error)
      alert('Failed to set protocol as active. Please try again.')
    } finally {
      setSettingActive(false)
    }
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
            {protocol.status && (
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                protocol.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {protocol.status === 'active' ? 'Active Protocol' : 'Draft Protocol'}
              </span>
            )}
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

          {/* Protocol Content */}
          <div className="protocol-content whitespace-pre-wrap font-mono text-sm text-gray-300 bg-slate-700 p-6 rounded-lg border border-slate-600">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-96 bg-slate-600 text-gray-300 font-mono text-sm border border-slate-500 rounded p-4 focus:outline-none focus:border-slate-400"
                placeholder="Enter protocol content..."
              />
            ) : (
              protocol.content
            )}
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="mt-4 flex gap-4 justify-end">
              <button 
                onClick={cancelEdit}
                className="px-4 py-2 bg-slate-600 rounded text-white hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveProtocol}
                disabled={saving}
                className={`px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Admin Actions */}
          <div className="mt-8 pt-8 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Admin Actions</h3>
            <div className="flex gap-4">
              <button 
                onClick={isEditing ? saveProtocol : editProtocol}
                disabled={saving}
                className={`px-4 py-2 bg-slate-700 rounded text-white hover:bg-slate-600 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isEditing ? (saving ? 'Saving...' : 'Save Protocol') : 'Edit Protocol'}
              </button>
              <button 
                onClick={emailToClient}
                disabled={sendingEmail}
                className={`px-4 py-2 bg-green-600 rounded text-white hover:bg-green-700 transition-colors ${sendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {sendingEmail ? 'Sending...' : 'Send to Client'}
              </button>
              <button 
                onClick={markAsActive}
                disabled={settingActive || protocol.status === 'active'}
                className={`px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors ${(settingActive || protocol.status === 'active') ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {settingActive ? 'Setting...' : protocol.status === 'active' ? 'Already Active' : 'Set as Active Protocol'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 