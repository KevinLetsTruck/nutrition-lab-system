'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Plus, Archive, Users, UserCheck, Clock } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { prisma } from '@/lib/prisma'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RouteGuard } from '@/components/RouteGuard'

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
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // No need to check auth here - RouteGuard handles it

  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchClients = async () => {
      try {
        console.log('🔍 Starting to fetch clients...')
        setLoading(true)
        
        const response = await fetch('/api/clients')
        
        if (!response.ok) {
          console.error('❌ Error fetching clients:', response.statusText)
          return
        }

        const data = await response.json()

        console.log('📊 API response:', data)
        console.log('📊 Number of clients:', data?.length || 0)

        setClients(data || [])
        console.log('✅ Clients set in state:', data?.length || 0)
      } catch (error) {
        console.error('❌ Catch block error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [showArchived])

  const filteredClients = clients.filter(client => {
    const searchLower = searchQuery.toLowerCase()
    return (
      client.first_name?.toLowerCase().includes(searchLower) ||
      client.last_name?.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.includes(searchQuery)
    )
  })

  // Handle missing archived_at field
  const activeClients = filteredClients.filter(c => !c.archived_at)
  const archivedClients = filteredClients.filter(c => c.archived_at)

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>
      case 'pending':
        return <Badge variant="warning">Pending</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">New</Badge>
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground-secondary">Loading clients...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-bold gradient-text">
              Clients
            </h1>
            <p className="text-foreground-secondary text-sm">
              {filteredClients.length} of {clients.length} clients
            </p>
          </div>
          
          <Button asChild className="whitespace-nowrap">
            <Link href="/admin/quick-add-client">
              <Plus className="w-4 h-4 mr-2" />
              New Client
            </Link>
          </Button>
        </div>

        {/* Debug Info - Remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 border-orange-500/50 bg-orange-500/10">
            <CardContent className="p-4">
              <h3 className="font-bold text-orange-400 mb-2">🐛 Debug Info:</h3>
              <div className="text-sm space-y-1">
                <p>Total clients in state: {clients.length}</p>
                <p>Filtered clients: {filteredClients.length}</p>
                <p>Active clients: {activeClients.length}</p>
                <p>Archived clients: {archivedClients.length}</p>
                <p>Show archived: {showArchived ? 'Yes' : 'No'}</p>
                <p>Search query: &ldquo;{searchQuery}&rdquo;</p>
                <p>Auth user: {user?.email || 'Not authenticated'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clients Grid */}
        {filteredClients.length === 0 ? (
          <Card className="mt-8">
            <CardContent className="text-center py-16">
              <div className="max-w-sm mx-auto">
                <Users className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                <p className="text-foreground-secondary mb-6">
                  {searchQuery ? 'No clients found matching your search.' : 'No clients yet. Start by adding your first client.'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href="/admin/quick-add-client">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Client
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredClients.map((client) => (
              <Card 
                key={client.id} 
                className="hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => router.push(`/client/${client.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-sm text-foreground-secondary truncate">
                        {client.email}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {getStatusBadge(client.status)}
                    </div>
                  </div>
                  
                  {client.phone && (
                    <p className="text-sm text-foreground-muted mb-3">
                      {client.phone}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-foreground-muted">
                      Added {new Date(client.created_at).toLocaleDateString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/client/${client.id}`)
                      }}
                    >
                      View →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClientsPage() {
  return (
    <RouteGuard allowedRoles={['admin']}>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <ClientsContent />
      </Suspense>
    </RouteGuard>
  )
}