'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  lastContact: string
  status?: string
  archived_at?: string
}

function ClientsContent() {
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [archiving, setArchiving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    // Get search query from URL parameters
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        
        // Fetch clients from the database
        const { data: clientsData, error } = await supabase
          .from('clients')
          .select('id, first_name, last_name, email, phone, created_at, status, archived_at')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching clients:', error)
          // Fallback to test data if database error
          const fallbackClients: Client[] = [
            {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '(555) 123-4567',
              lastContact: new Date().toISOString(),
              status: 'active'
            },
            {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@example.com',
              phone: '(555) 234-5678',
              lastContact: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              status: 'active'
            },
            {
              id: '3',
              name: 'Mike Wilson',
              email: 'mike.wilson@example.com',
              phone: '(555) 345-6789',
              lastContact: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              status: 'active'
            }
          ]
          setClients(fallbackClients)
          return
        }

        // If no clients in database, use fallback data
        if (!clientsData || clientsData.length === 0) {
          console.log('No clients found in database, using fallback data')
          const fallbackClients: Client[] = [
            {
              id: '1',
              name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '(555) 123-4567',
              lastContact: new Date().toISOString(),
              status: 'active'
            },
            {
              id: '2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@example.com',
              phone: '(555) 234-5678',
              lastContact: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              status: 'active'
            },
            {
              id: '3',
              name: 'Mike Wilson',
              email: 'mike.wilson@example.com',
              phone: '(555) 345-6789',
              lastContact: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              status: 'active'
            }
          ]
          setClients(fallbackClients)
          return
        }

        // Transform the data to match our interface
        const transformedClients: Client[] = clientsData.map(client => ({
          id: client.id,
          name: `${client.first_name} ${client.last_name}`,
          email: client.email,
          phone: client.phone || '',
          lastContact: client.created_at,
          status: client.status,
          archived_at: client.archived_at
        }))

        setClients(transformedClients)
      } catch (error) {
        console.error('Error loading clients:', error)
        // Fallback to test data on any error
        const fallbackClients: Client[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '(555) 123-4567',
            lastContact: new Date().toISOString(),
            status: 'active'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            phone: '(555) 234-5678',
            lastContact: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            status: 'active'
          },
          {
            id: '3',
            name: 'Mike Wilson',
            email: 'mike.wilson@example.com',
            phone: '(555) 345-6789',
            lastContact: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            status: 'active'
          }
        ]
        setClients(fallbackClients)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
    
    const matchesArchiveFilter = showArchived ? client.archived_at : !client.archived_at
    
    return matchesSearch && matchesArchiveFilter
  })

  const archiveClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to archive ${clientName}? This will hide them from the main client list.`)) {
      return
    }

    setArchiving(clientId)
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'archived',
          archived_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        alert(`${clientName} has been archived successfully!`)
        // Update the local state
        setClients(clients.map(client => 
          client.id === clientId 
            ? { ...client, status: 'archived', archived_at: new Date().toISOString() }
            : client
        ))
      } else {
        const error = await response.json()
        alert(`Failed to archive client: ${error.error}`)
      }
    } catch (error) {
      console.error('Error archiving client:', error)
      alert('Failed to archive client. Please try again.')
    } finally {
      setArchiving(null)
    }
  }

  const unarchiveClient = async (clientId: string, clientName: string) => {
    setArchiving(clientId)
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'active',
          archived_at: null
        })
      })

      if (response.ok) {
        alert(`${clientName} has been restored successfully!`)
        // Update the local state
        setClients(clients.map(client => 
          client.id === clientId 
            ? { ...client, status: 'active', archived_at: undefined }
            : client
        ))
      } else {
        const error = await response.json()
        alert(`Failed to restore client: ${error.error}`)
      }
    } catch (error) {
      console.error('Error restoring client:', error)
      alert('Failed to restore client. Please try again.')
    } finally {
      setArchiving(null)
    }
  }

  const deleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${clientName}? This action cannot be undone and will delete all associated data (notes, protocols, lab reports).`)) {
      return
    }

    setDeleting(clientId)
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert(`${clientName} has been permanently deleted.`)
        // Remove from local state
        setClients(clients.filter(client => client.id !== clientId))
      } else {
        const error = await response.json()
        alert(`Failed to delete client: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading clients...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Client Management</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showArchived 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-slate-700 text-gray-300 hover:text-white'
              }`}
            >
              {showArchived ? 'Show Active Clients' : 'Show Archived Clients'}
            </button>
          </div>
        </div>
        <div className="relative flex items-center">
          <div className="absolute left-4 flex items-center justify-center w-5 h-5 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-slate-500"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredClients.map(client => (
          <div key={client.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <Link href={`/client/${client.id}`}>
                  <div className="hover:border-slate-500 transition-colors cursor-pointer">
                    <h3 className="font-semibold text-lg text-white">{client.name}</h3>
                    <p className="text-gray-400 text-sm">{client.email} • {client.phone}</p>
                  </div>
                </Link>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  {client.archived_at && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Archived
                    </span>
                  )}
                  <span className="text-sm text-gray-400">Last contact:</span>
                  <p className="text-sm text-white">{formatDate(client.lastContact)}</p>
                </div>
                <div className="flex gap-2">
                  {client.archived_at ? (
                    <button
                      onClick={() => unarchiveClient(client.id, client.name)}
                      disabled={archiving === client.id}
                      className={`px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors ${archiving === client.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {archiving === client.id ? 'Restoring...' : 'Restore'}
                    </button>
                  ) : (
                    <button
                      onClick={() => archiveClient(client.id, client.name)}
                      disabled={archiving === client.id}
                      className={`px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white text-sm transition-colors ${archiving === client.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {archiving === client.id ? 'Archiving...' : 'Archive'}
                    </button>
                  )}
                  <button
                    onClick={() => deleteClient(client.id, client.name)}
                    disabled={deleting === client.id}
                    className={`px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors ${deleting === client.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {deleting === client.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {showArchived ? 'No archived clients found.' : 'No clients found matching your search.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }>
        <ClientsContent />
      </Suspense>
    </div>
  )
} 