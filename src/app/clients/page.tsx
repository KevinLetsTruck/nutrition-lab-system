'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  lastContact: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch clients from API
    // For now, using mock data
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        lastContact: '2024-01-15'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '(555) 234-5678',
        lastContact: '2024-01-10'
      },
      {
        id: '3',
        name: 'Mike Wilson',
        email: 'mike.wilson@email.com',
        phone: '(555) 345-6789',
        lastContact: '2024-01-08'
      }
    ]
    
    setTimeout(() => {
      setClients(mockClients)
      setLoading(false)
    }, 500)
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
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading clients...</p>
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
    </div>
  )
} 