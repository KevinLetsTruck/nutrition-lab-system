'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface Protocol {
  id: string
  clientId: string
  clientName: string
  phaseName: string
  isActive: boolean
  createdAt: string
}

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch protocols from API
    // For now, using mock data
    const mockProtocols: Protocol[] = [
      {
        id: '1',
        clientId: '1',
        clientName: 'John Smith',
        phaseName: 'Phase 1: Gut Restoration',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        clientId: '2',
        clientName: 'Sarah Johnson',
        phaseName: 'Phase 2: Energy Optimization',
        isActive: true,
        createdAt: '2024-01-10T14:20:00Z'
      },
      {
        id: '3',
        clientId: '3',
        clientName: 'Mike Wilson',
        phaseName: 'Phase 1: Inflammation Reduction',
        isActive: false,
        createdAt: '2024-01-08T09:15:00Z'
      }
    ]
    
    setTimeout(() => {
      setProtocols(mockProtocols)
      setLoading(false)
    }, 500)
  }, [])

  const deleteProtocol = async (protocolId: string) => {
    if (!confirm('Are you sure you want to delete this protocol? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('Protocol deleted successfully!')
        // Remove the protocol from the local state
        setProtocols(protocols.filter(protocol => protocol.id !== protocolId))
      } else {
        const error = await response.json()
        alert(`Failed to delete protocol: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting protocol:', error)
      alert('Failed to delete protocol. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
            <p className="text-gray-400">Loading protocols...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-4">Protocols</h1>
          <p className="text-gray-400">All generated FNTP protocols for your clients</p>
        </div>

        <div className="grid gap-4">
          {protocols.map(protocol => (
            <div key={protocol.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <Link href={`/protocol/${protocol.id}`}>
                    <div className="hover:border-slate-500 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg text-white">{protocol.clientName}</h3>
                      <p className="text-gray-400 text-sm">{protocol.phaseName}</p>
                    </div>
                  </Link>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {protocol.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">{formatDate(protocol.createdAt)}</p>
                    <button 
                      onClick={() => deleteProtocol(protocol.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                      title="Delete Protocol"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {protocols.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No protocols found.</p>
          </div>
        )}
      </div>
    </div>
  )
} 