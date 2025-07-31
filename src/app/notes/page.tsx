'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
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

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true)
        
        // Fetch notes with client information
        const { data: notesData, error } = await supabase
          .from('client_notes')
          .select(`
            *,
            client:clients(first_name, last_name, email)
          `)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching notes:', error)
          setNotes([])
          setLoading(false)
          return
        }

        setNotes(notesData || [])
        setLoading(false)
      } catch (error) {
        console.error('Error in fetchNotes:', error)
        setNotes([])
        setLoading(false)
      }
    }

    fetchNotes()
  }, [])

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
        return 'bg-blue-600'
      case 'follow-up':
        return 'bg-green-600'
      case 'group coaching':
        return 'bg-purple-600'
      case 'coaching_call':
        return 'bg-orange-600'
      default:
        return 'bg-gray-600'
    }
  }

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
                <div key={i} className="h-32 bg-slate-700 rounded"></div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Client Notes</h1>
          <p className="text-gray-400">
            View and manage client consultation notes and follow-up records.
          </p>
        </div>

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
    </div>
  )
} 