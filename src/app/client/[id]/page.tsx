'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import NoteModal from '@/components/NoteModal'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  notes: Note[]
  documents: Document[]
  currentProtocol?: Protocol
}

interface Note {
  id: string
  type: string
  content: string
  date: string
}

interface Document {
  id: string
  name: string
  type: string
}

interface Protocol {
  id: string
  phase: string
  startDate: string
}

export default function ClientDashboard() {
  const params = useParams()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteType, setNoteType] = useState<'interview' | 'group_coaching'>('interview')
  const [uploading, setUploading] = useState(false)
  const [generatingProtocol, setGeneratingProtocol] = useState(false)

  useEffect(() => {
    // TODO: Fetch client data from API
    // For now, using mock data
    const mockClient: Client = {
      id: clientId,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      notes: [
        {
          id: '1',
          type: 'Interview',
          content: 'Initial consultation completed. Client reports fatigue, digestive issues, and difficulty maintaining healthy eating habits while on the road. Currently taking blood pressure medication.',
          date: '2024-01-15'
        },
        {
          id: '2',
          type: 'Group Coaching',
          content: 'Follow-up call - client has been implementing meal prep strategies. Reports 30% improvement in energy levels. Still struggling with sleep quality.',
          date: '2024-01-10'
        }
      ],
      documents: [
        { id: '1', name: 'NutriQ Lab Results', type: 'Lab Report' },
        { id: '2', name: 'Health Assessment Form', type: 'Intake Form' }
      ],
      currentProtocol: {
        id: '1',
        phase: 'Phase 1: Gut Restoration',
        startDate: '2024-01-15'
      }
    }
    
    setTimeout(() => {
      setClient(mockClient)
      setLoading(false)
    }, 500)
  }, [clientId])

  const openInterviewNotes = () => {
    setNoteType('interview')
    setShowNoteModal(true)
  }

  const openGroupNotes = () => {
    setNoteType('group_coaching')
    setShowNoteModal(true)
  }

  const uploadDocument = async () => {
    try {
      // Create a file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf,.jpg,.jpeg,.png,.txt'
      input.multiple = true
      
      input.onchange = async (event) => {
        const files = (event.target as HTMLInputElement).files
        if (!files || files.length === 0) return
        
        setUploading(true)
        
        const formData = new FormData()
        for (let i = 0; i < files.length; i++) {
          formData.append('file', files[i])
        }
        
        // Add client information
        formData.append('clientEmail', client.email)
        formData.append('clientFirstName', client.name.split(' ')[0])
        formData.append('clientLastName', client.name.split(' ').slice(1).join(' '))
        formData.append('category', 'client_documents')
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (response.ok) {
            alert('Documents uploaded successfully!')
            // Refresh the page to show new documents
            window.location.reload()
          } else {
            const error = await response.json()
            alert(`Upload failed: ${error.error}`)
          }
        } catch (error) {
          console.error('Upload error:', error)
          alert('Upload failed. Please try again.')
        } finally {
          setUploading(false)
        }
      }
      
      input.click()
    } catch (error) {
      console.error('Upload document error:', error)
      alert('Failed to open file selector')
      setUploading(false)
    }
  }

  const generateProtocol = async () => {
    setGeneratingProtocol(true)
    try {
      const response = await fetch('/api/generate-protocol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clientId })
      })
      
      if (response.ok) {
        const result = await response.json()
        alert('Protocol generated successfully!')
        // You could open the protocol in a new window or modal
        console.log('Generated protocol:', result)
      } else {
        const error = await response.json()
        alert(`Protocol generation failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Generate protocol error:', error)
      alert('Failed to generate protocol. Please try again.')
    } finally {
      setGeneratingProtocol(false)
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
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading client data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-gray-400">Client not found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Client Header */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">{client.name}</h1>
          <p className="text-gray-400">{client.email} • {client.phone}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={openInterviewNotes} 
            className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-white font-medium transition-colors"
          >
            + Interview Notes
          </button>
          <button 
            onClick={openGroupNotes} 
            className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-white font-medium transition-colors"
          >
            + Group Call Notes
          </button>
          <button 
            onClick={uploadDocument} 
            disabled={uploading}
            className={`bg-purple-600 hover:bg-purple-700 p-4 rounded-lg text-white font-medium transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : '+ Upload Document'}
          </button>
          <button 
            onClick={generateProtocol} 
            disabled={generatingProtocol}
            className={`bg-orange-600 hover:bg-orange-700 p-4 rounded-lg text-white font-medium transition-colors ${generatingProtocol ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generatingProtocol ? 'Generating...' : 'Generate Protocol'}
          </button>
        </div>

        {/* Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notes Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Notes</h2>
            <div className="space-y-4">
              {client.notes.map(note => (
                <div key={note.id} className="border-l-4 border-slate-600 pl-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>{note.type}</span>
                    <span>{formatDate(note.date)}</span>
                  </div>
                  <p className="text-sm text-gray-300">{note.content.substring(0, 150)}...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Documents</h2>
            <div className="space-y-3">
              {client.documents.map(doc => (
                <div key={doc.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{doc.name}</span>
                  <span className="text-xs text-gray-400">{doc.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current Protocol Status */}
        <div className="bg-slate-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Protocol</h2>
          {client.currentProtocol ? (
            <div>
              <p className="text-green-400 mb-2">{client.currentProtocol.phase}</p>
              <p className="text-gray-400">Started: {formatDate(client.currentProtocol.startDate)}</p>
            </div>
          ) : (
            <p className="text-gray-400">No active protocol</p>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <NoteModal
          clientId={clientId}
          noteType={noteType}
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </div>
  )
} 