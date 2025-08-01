'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

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
        setLoading(true)
        
        // Test Supabase connection first
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count')
          .limit(1)
        
        
        if (testError) {
          setClients([])
          setLoading(false)
          return
        }
        
        // Fetch clients from the database
        const { data: clientsData, error } = await supabase
          .from('client_profiles')
          .select(`
            *,
            users!client_profiles_user_id_fkey (
              email,
              email_verified,
              created_at
            )
          `)
          .order('created_at', { ascending: false })


        if (error) {
          setClients([])
          setLoading(false)
          return
        }


        // Transform the data to match the expected format
        const transformedClients: Client[] = clientsData.map(client => ({
          id: client.id,
          first_name: client.first_name,
          last_name: client.last_name,
          email: client.users?.email || '',
          phone: client.phone,
          status: 'active', // client_profiles doesn't have status field
          archived_at: null, // client_profiles doesn't have archived_at field
          created_at: client.created_at
        }))

        setClients(transformedClients)
        setLoading(false)
      } catch (error) {
        setClients([])
        setLoading(false)
      }
    }

    if (user) {
      fetchClients()
    }
  }, [user])

  // Don't render anything if still loading auth or not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }


  // Show a simple loading state while fetching clients
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Clients</h1>
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-slate-800 rounded-lg p-6">
                  <div className="h-6 bg-slate-700 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show a simple success message even if no clients
  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Clients</h1>
        
        {clients.length === 0 ? (
          <div className="bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 text-lg mb-4">No clients found.</p>
            <p className="text-gray-500 text-sm">Clients will appear here once added to the system.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div key={client.id} className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white">
                  {client.first_name} {client.last_name}
                </h3>
                <p className="text-gray-400">{client.email}</p>
                {client.phone && (
                  <p className="text-gray-400">{client.phone}</p>
                )}
              </div>
            ))}
          </div>
        )}
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