'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'

interface Protocol {
  id: string
  client_id: string
  phase: string
  content: string
  status: string
  start_date: string
  created_at: string
  client?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function ProtocolsPage() {
  const [protocols, setProtocols] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        setLoading(true)
        
        // Fetch protocols with client information
        const { data: protocolsData, error } = await supabase
          .from('protocols')
          .select(`
            *,
            client:clients(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching protocols:', error)
          setProtocols([])
          setLoading(false)
          return
        }

        setProtocols(protocolsData || [])
        setLoading(false)
      } catch (error) {
        console.error('Error in fetchProtocols:', error)
        setProtocols([])
        setLoading(false)
      }
    }

    fetchProtocols()
  }, [])

  const deleteProtocol = async (protocolId: string) => {
    if (!confirm('Are you sure you want to delete this protocol? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/protocols/${protocolId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProtocols(prev => prev.filter(protocol => protocol.id !== protocolId))
      } else {
        const error = await response.json()
        alert(`Failed to delete protocol: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting protocol:', error)
      alert('Failed to delete protocol')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success'
      case 'draft':
        return 'bg-warning'
      case 'completed':
        return 'bg-accent'
      default:
        return 'bg-muted'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-card rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-card rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-card rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Protocols</h1>
          <p className="text-foreground-secondary">
            View and manage client treatment protocols and health plans.
          </p>
        </div>

        <div className="space-y-4">
          {protocols.length === 0 ? (
            <div className="bg-card rounded-lg p-8 text-center">
              <p className="text-foreground-secondary text-lg">No protocols found.</p>
            </div>
          ) : (
            protocols.map((protocol) => (
              <div key={protocol.id} className="bg-card rounded-lg p-6 hover:border-primary/30 border border-border transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {protocol.client && (
                        <Link 
                          href={`/client/${protocol.client_id}`}
                          className="text-lg font-semibold text-primary hover:text-primary-hover transition-colors"
                        >
                          {protocol.client.first_name} {protocol.client.last_name}
                        </Link>
                      )}
                      <span className={`px-2 py-1 text-foreground text-xs rounded-full ${getStatusColor(protocol.status)}`}>
                        {protocol.status}
                      </span>
                    </div>
                    
                    <h3 className="text-foreground font-medium mb-1">{protocol.phase}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-foreground-muted">
                      <span>Started: {formatDate(protocol.start_date)}</span>
                      <span>Created: {formatDate(protocol.created_at)}</span>
                      {protocol.client && (
                        <span>Email: {protocol.client.email}</span>
                      )}
                    </div>
                    
                    {protocol.content && (
                      <p className="text-foreground-secondary text-sm mt-2 line-clamp-2">
                        {protocol.content.length > 200 
                          ? `${protocol.content.substring(0, 200)}...` 
                          : protocol.content
                        }
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/protocol/${protocol.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Protocol
                    </Link>
                    
                    <button
                      onClick={() => deleteProtocol(protocol.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete protocol"
                    >
                      ✗
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 