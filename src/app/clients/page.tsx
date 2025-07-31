'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  status?: string
  archived_at?: string | null
  created_at: string
}

function ClientsContent() {
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        
        // Fetch clients from the database
        const { data: clientsData, error } = await supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching clients:', error)
          setClients([])
          setLoading(false)
          return
        }

        // Transform the data to match the expected format
        const transformedClients: Client[] = clientsData.map(client => ({
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.email,
          phone: client.phone,
          status: client.status || 'active',
          archived_at: client.archived_at,
          created_at: client.created_at
        }))

        setClients(transformedClients)
        setLoading(false)
      } catch (error) {
        console.error('Error in fetchClients:', error)
        setClients([])
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const archiveClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'archived',
          archived_at: new Date().toISOString()
        })
      })

      if (response.ok) {
        setClients(prev => 
          prev.map(client => 
            client.id === clientId 
              ? { ...client, status: 'archived', archived_at: new Date().toISOString() }
              : client
          )
        )
        alert('Client archived successfully')
      } else {
        const error = await response.json()
        alert(`Failed to archive client: ${error.error}`)
      }
    } catch (error) {
      console.error('Error archiving client:', error)
      alert('Failed to archive client')
    }
  }

  const unarchiveClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'active',
          archived_at: null
        })
      })

      if (response.ok) {
        setClients(prev => 
          prev.map(client => 
            client.id === clientId 
              ? { ...client, status: 'active', archived_at: null }
              : client
          )
        )
        alert('Client restored successfully')
      } else {
        const error = await response.json()
        alert(`Failed to restore client: ${error.error}`)
      }
    } catch (error) {
      console.error('Error restoring client:', error)
      alert('Failed to restore client')
    }
  }

  const deleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to permanently delete this client? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setClients(prev => prev.filter(client => client.id !== clientId))
        alert('Client deleted successfully')
      } else {
        const error = await response.json()
        alert(`Failed to delete client: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client')
    }
  }

  // Filter clients based on search query and archived status
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone && client.phone.includes(searchQuery))

    const matchesArchivedStatus = showArchived 
      ? client.status === 'archived' || client.archived_at
      : client.status !== 'archived' && !client.archived_at

    return matchesSearch && matchesArchivedStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-gray-400">
            Manage your client relationships and view their information.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
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
            
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                showArchived 
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {showArchived ? 'Show Active Clients' : 'Show Archived Clients'}
            </button>
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">
                {showArchived 
                  ? 'No archived clients found.' 
                  : searchQuery 
                    ? 'No clients found matching your search.' 
                    : 'No clients found.'
                }
              </p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <div key={client.id} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {client.first_name} {client.last_name}
                      </h3>
                      {client.status === 'archived' && (
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                          Archived
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mb-1">{client.email}</p>
                    {client.phone && (
                      <p className="text-gray-400">{client.phone}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Added: {new Date(client.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/client/${client.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </Link>
                    
                    {client.status === 'archived' ? (
                      <>
                        <button
                          onClick={() => unarchiveClient(client.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => archiveClient(client.id)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Archive
                      </button>
                    )}
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

export default function ClientsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-8"></div>
          </div>
        </div>
      </div>
    }>
      <ClientsContent />
    </Suspense>
  )
} 