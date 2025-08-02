'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Plus, Archive, Users, UserCheck, Clock } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import { Badge } from '@/components/ui/badge'

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

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }
  }, [user, authLoading, router])

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
        
        let query = supabase
          .from('clients')
          .select('*')
          .order('created_at', { ascending: false })

        // Comment out archived filtering until column is added
        // if (!showArchived) {
        //   query = query.is('archived_at', null)
        // }

        const { data, error } = await query

        console.log('📊 Supabase response:', { data, error })
        console.log('📊 Number of clients:', data?.length || 0)

        if (error) {
          console.error('❌ Error fetching clients:', error)
          return
        }

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
      
      <div className="container mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold gradient-text mb-2">
            Client Management
          </h1>
          <p className="text-foreground-secondary text-lg">
            Manage your client base and track health journeys
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-400">{clients.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <Users className="w-4 h-4 text-emerald-400/60" />
                <span className="text-xs text-foreground-muted">All time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{activeClients.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <UserCheck className="w-4 h-4 text-blue-400/60" />
                <span className="text-xs text-foreground-muted">Currently active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-400">
                {clients.filter(c => {
                  const createdDate = new Date(c.created_at)
                  const thisMonth = new Date()
                  return createdDate.getMonth() === thisMonth.getMonth() && 
                         createdDate.getFullYear() === thisMonth.getFullYear()
                }).length}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-purple-400/60" />
                <span className="text-xs text-foreground-muted">New this month</span>
              </div>
            </CardContent>
          </Card>

          {/* Hide archived card until archived_at column is added
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground-secondary">Archived</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">{archivedClients.length}</div>
              <div className="flex items-center gap-1 mt-1">
                <Archive className="w-4 h-4 text-orange-400/60" />
                <span className="text-xs text-foreground-muted">Inactive clients</span>
              </div>
            </CardContent>
          </Card> */}
        </div>

        {/* Search and Actions */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  placeholder="Search clients by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {/* Hide archive button until archived_at column is added
                <Button variant={showArchived ? "secondary" : "outline"} onClick={() => setShowArchived(!showArchived)}>
                  <Archive className="w-4 h-4 mr-2" />
                  {showArchived ? 'Hide' : 'Show'} Archived
                </Button> */}
                <Button asChild>
                  <Link href="/streamlined-onboarding">
                    <Plus className="w-4 h-4 mr-2" />
                    New Client
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Clients List */}
        <div className="grid gap-4">
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-foreground-secondary mb-4">
                  {searchQuery ? 'No clients found matching your search.' : 'No clients yet.'}
                </p>
                <Button asChild>
                  <Link href="/streamlined-onboarding">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Client
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredClients.map((client) => (
              <Card key={client.id} className="hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {client.first_name} {client.last_name}
                        </h3>
                        {getStatusBadge(client.status)}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-foreground-secondary">
                        <span>{client.email}</span>
                        {client.phone && <span>{client.phone}</span>}
                        <span>Added {new Date(client.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/client/${client.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ClientsContent />
    </Suspense>
  )
}