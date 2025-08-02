'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import NoteModal from '@/components/NoteModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Note {
  id: string
  client_id: string
  type: string
  content: string
  author: string
  created_at: string
  client?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteType, setNoteType] = useState<'interview' | 'coaching_call' | null>(null)
  const [clientData, setClientData] = useState<any>(null)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const clientId = searchParams.get('clientId')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // If clientId is provided, fetch client data
        if (clientId) {
          const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', clientId)
            .single()
          
          if (!clientError && client) {
            setClientData(client)
          }
        }
        
        // Fetch notes query
        let query = supabase
          .from('client_notes')
          .select(`
            *,
            client:clients(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false })
        
        // Filter by clientId if provided
        if (clientId) {
          query = query.eq('client_id', clientId)
        }

        const { data: notesData, error } = await query

        if (error) {
          console.error('Error fetching notes:', error)
          setNotes([])
          setLoading(false)
          return
        }

        setNotes(notesData || [])
        setLoading(false)
      } catch (error) {
        console.error('Error in fetchData:', error)
        setNotes([])
        setLoading(false)
      }
    }

    fetchData()
  }, [clientId])

  const openInterviewNotes = () => {
    setNoteType('interview')
    setShowNoteModal(true)
  }

  const openCoachingCallNotes = () => {
    setNoteType('coaching_call')
    setShowNoteModal(true)
  }

  const handleNoteSaved = () => {
    setShowNoteModal(false)
    // Refresh the notes
    window.location.reload()
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch('/api/notes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ noteId })
      })

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId))
        alert('Note deleted successfully')
      } else {
        const error = await response.json()
        alert(`Failed to delete note: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
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

  const getNoteTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'interview':
        return 'bg-accent'
      case 'follow-up':
        return 'bg-success'
      case 'group coaching':
        return 'bg-accent-purple'
      case 'coaching_call':
        return 'bg-accent-orange'
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
                <div key={i} className="h-32 bg-card rounded"></div>
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
          <h1 className="text-3xl font-bold gradient-text mb-2">
            {clientData ? `${clientData.first_name} ${clientData.last_name}'s Notes` : 'Client Notes'}
          </h1>
          <p className="text-foreground-secondary">
            {clientData ? 'Select a note type to add or view existing notes below.' : 'View and manage client consultation notes and follow-up records.'}
          </p>
        </div>

        {/* Note Type Selection Buttons - only show when clientId is provided */}
        {clientId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card 
              className="cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={openInterviewNotes}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-brand rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Interview Notes</CardTitle>
                <CardDescription>
                  Initial consultation and assessment notes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={openCoachingCallNotes}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-brand rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <CardTitle>Coaching Call Notes</CardTitle>
                <CardDescription>
                  Session notes and progress tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-gray-400 text-lg">No notes found.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-slate-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {note.client && (
                        <Link 
                          href={`/client/${note.client_id}`}
                          className="text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {note.client.first_name} {note.client.last_name}
                        </Link>
                      )}
                      <span className={`px-2 py-1 text-white text-xs rounded-full ${getNoteTypeColor(note.type)}`}>
                        {note.type.replace('_', ' ')}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-2">{note.content}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Author: {note.author}</span>
                      {note.client && (
                        <span>Email: {note.client.email}</span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-400 hover:text-red-300 transition-colors ml-4"
                    title="Delete note"
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && noteType && clientId && (
        <NoteModal
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          clientId={clientId}
          noteType={noteType}
          onNoteSaved={handleNoteSaved}
        />
      )}
    </div>
  )
} 