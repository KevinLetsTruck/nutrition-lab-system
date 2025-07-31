'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface Note {
  id: string
  clientId: string
  clientName: string
  noteType: string
  content: string
  createdAt: string
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch notes from API
    // For now, using mock data
    const mockNotes: Note[] = [
      {
        id: '1',
        clientId: '1',
        clientName: 'John Smith',
        noteType: 'Interview',
        content: 'Initial consultation completed. Client reports fatigue, digestive issues, and difficulty maintaining healthy eating habits while on the road. Currently taking blood pressure medication.',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        clientId: '2',
        clientName: 'Sarah Johnson',
        noteType: 'Group Coaching',
        content: 'Follow-up call - client has been implementing meal prep strategies. Reports 30% improvement in energy levels. Still struggling with sleep quality.',
        createdAt: '2024-01-10T14:20:00Z'
      },
      {
        id: '3',
        clientId: '3',
        clientName: 'Mike Wilson',
        noteType: 'Follow-up',
        content: 'Monthly check-in. Client reports significant improvement in inflammation markers. Protocol Phase 1 showing positive results. Ready to transition to Phase 2.',
        createdAt: '2024-01-08T09:15:00Z'
      }
    ]
    
    setTimeout(() => {
      setNotes(mockNotes)
      setLoading(false)
    }, 500)
  }, [])

  const deleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/notes`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ noteId })
      })

      if (response.ok) {
        alert('Note deleted successfully!')
        // Remove the note from the local state
        setNotes(notes.filter(note => note.id !== noteId))
      } else {
        const error = await response.json()
        alert(`Failed to delete note: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note. Please try again.')
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

  const getNoteTypeColor = (noteType: string) => {
    switch (noteType.toLowerCase()) {
      case 'interview':
        return 'bg-blue-100 text-blue-800'
      case 'coaching_call':
        return 'bg-green-100 text-green-800'
      case 'follow_up':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading notes...</p>
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
          <h1 className="text-2xl font-bold text-white mb-4">Recent Notes</h1>
          <p className="text-gray-400">Latest client interactions and progress notes</p>
        </div>

        <div className="grid gap-4">
          {notes.map(note => (
            <div key={note.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Link 
                    href={`/client/${note.clientId}`}
                    className="font-semibold text-lg text-white hover:text-blue-400 transition-colors"
                  >
                    {note.clientName}
                  </Link>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(note.noteType)}`}>
                    {note.noteType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{formatDate(note.createdAt)}</span>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                    title="Delete Note"
                  >
                    ✗
                  </button>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {note.content.length > 200 
                  ? `${note.content.substring(0, 200)}...` 
                  : note.content
                }
              </p>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No notes found.</p>
          </div>
        )}
      </div>
    </div>
  )
} 