'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  lastContact: string
}

function ClientsContent() {
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

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
          .select('id, first_name, last_name, email, phone, created_at')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching clients:', error)
          setClients([])
          return
        }

        // Transform the data to match our interface
        const transformedClients: Client[] = clientsData.map(client => ({
          id: client.id,
          name: `${client.first_name} ${client.last_name}`,
          email: client.email,
          phone: client.phone || '',
          lastContact: client.created_at
        }))

        setClients(transformedClients)
      } catch (error) {
        console.error('Error loading clients:', error)
        setClients([])
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery)
  )

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
        <h1 className="text-2xl font-bold text-white mb-4">Client Management</h1>
        <input
          type="text"
          placeholder="Search clients by name, email, or phone..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-slate-500"
        />
      </div>

      <div className="grid gap-4">
        {filteredClients.map(client => (
          <Link href={`/client/${client.id}`} key={client.id}>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-500 transition-colors cursor-pointer">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-white">{client.name}</h3>
                  <p className="text-gray-400 text-sm">{client.email} • {client.phone}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-400">Last contact:</span>
                  <p className="text-sm text-white">{formatDate(client.lastContact)}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No clients found matching your search.</p>
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