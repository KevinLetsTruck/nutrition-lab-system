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
  analyses?: Analysis[]
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
  filePath?: string
  fileUrl?: string
}

interface Protocol {
  id: string
  phase: string
  startDate: string
  content?: string
}

interface Analysis {
  id: string
  reportType: string
  status: string
  results?: any
  createdAt: string
}

export default function ClientDashboard() {
  const params = useParams()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteType, setNoteType] = useState<'interview' | 'group_coaching' | 'coaching_call'>('interview')
  const [uploading, setUploading] = useState(false)
  const [generatingProtocol, setGeneratingProtocol] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'analyses' | 'protocols' | 'notes' | 'documents'>('overview')

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
        },
        {
          id: '3',
          type: 'Coaching Call',
          content: 'Weekly check-in - client has been consistent with supplement protocol. Energy levels continue to improve. Discussed stress management techniques for truck driving.',
          date: '2024-01-08'
        }
      ],
      documents: [
        { id: '1', name: 'NutriQ Lab Results', type: 'Lab Report', filePath: '2025/07/30/test_1753917130144_00hd6dpauqmli.pdf', fileUrl: 'https://ajwudhwruxxdshqjeqij.supabase.co/storage/v1/object/public/general/2025/07/30/test_1753917130144_00hd6dpauqmli.pdf' },
        { id: '2', name: 'Health Assessment Form', type: 'Intake Form' }
      ],
      currentProtocol: {
        id: '1',
        phase: 'Phase 1: Gut Restoration',
        startDate: '2024-01-15',
        content: 'GREETING\nHello John,\n\nThank you for completing your comprehensive health assessment. Based on your lab results and our consultation, I\'ve created a personalized protocol to address your health goals.\n\nPHASE 1: GUT RESTORATION & INFLAMMATION REDUCTION\n\nDURATION: 8 weeks\nCLINICAL FOCUS: Reduce inflammation, improve gut health, increase energy levels\nCURRENT STATUS: Based on your assessment data, we\'ll focus on foundational health improvements\n\nPRIORITY SUPPLEMENTS\n\nNAME OF PRODUCT: Biotics Research - Bio-D-Mulsion Forte\nDOSE: 1 drop daily\nTIMING: With breakfast\nPURPOSE: Optimize vitamin D levels for immune function and inflammation reduction\n\nNAME OF PRODUCT: Biotics Research - CytoFlora\nDOSE: 1 capsule twice daily\nTIMING: 30 minutes before meals\nPURPOSE: Support healthy gut microbiome and reduce inflammation\n\nNAME OF PRODUCT: Biotics Research - Magnesium Glycinate\nDOSE: 200mg twice daily\nTIMING: With meals\nPURPOSE: Support muscle function and energy production\n\nDAILY PROTOCOL SCHEDULE\n\nUPON WAKING: 16oz water with lemon, 1 drop Bio-D-Mulsion Forte\nBEFORE BREAKFAST: 1 CytoFlora capsule\nBETWEEN BREAKFAST & LUNCH: 200mg Magnesium Glycinate\nBEFORE LUNCH: 1 CytoFlora capsule\nWITH LARGEST MEAL: 200mg Magnesium Glycinate\nBETWEEN LUNCH & DINNER: Hydration focus, herbal tea\n\nPROTOCOL NOTES\n\n• Focus on whole foods, avoiding processed foods and added sugars\n• Prioritize sleep hygiene - aim for 7-8 hours per night\n• Consider meal prep strategies for truck stops\n• Monitor energy levels and digestive symptoms'
      },
      analyses: [
        {
          id: '1',
          reportType: 'NutriQ',
          status: 'completed',
          createdAt: '2024-01-15',
          results: {
            totalScore: 75,
            energyScore: 8,
            moodScore: 7,
            sleepScore: 6,
            stressScore: 5,
            digestionScore: 9,
            immunityScore: 8
          }
        }
      ]
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

  const openCoachingCallNotes = () => {
    setNoteType('coaching_call')
    setShowNoteModal(true)
  }

  const uploadDocument = async () => {
    if (!client) {
      alert('Client data not available. Please refresh the page.')
      return
    }
    
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
    if (!client) {
      alert('Client data not available. Please refresh the page.')
      return
    }
    
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
        // Refresh the page to show new protocol
        window.location.reload()
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

  const openDocument = (document: Document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    } else {
      alert('Document URL not available')
    }
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
            onClick={openCoachingCallNotes} 
            className="bg-teal-600 hover:bg-teal-700 p-4 rounded-lg text-white font-medium transition-colors"
          >
            + Coaching Call Notes
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

        {/* Tab Navigation */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analyses')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analyses' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Lab Analyses
            </button>
            <button
              onClick={() => setActiveTab('protocols')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'protocols' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Protocols
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'notes' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Notes
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'documents' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Documents
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-lg p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Client Overview</h2>
              
              {/* Current Protocol Status */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Current Protocol</h3>
                {client.currentProtocol ? (
                  <div>
                    <p className="text-green-400 mb-2">{client.currentProtocol.phase}</p>
                    <p className="text-gray-400">Started: {formatDate(client.currentProtocol.startDate)}</p>
                  </div>
                ) : (
                  <p className="text-gray-400">No active protocol</p>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Recent Activity</h3>
                <div className="space-y-2">
                  {client.notes.slice(0, 3).map(note => (
                    <div key={note.id} className="text-sm text-gray-300">
                      <span className="text-blue-400">{note.type}:</span> {note.content.substring(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{client.notes.length}</div>
                  <div className="text-sm text-gray-400">Total Notes</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{client.documents.length}</div>
                  <div className="text-sm text-gray-400">Documents</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{client.analyses?.length || 0}</div>
                  <div className="text-sm text-gray-400">Lab Analyses</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analyses' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Lab Analyses</h2>
              {client.analyses && client.analyses.length > 0 ? (
                <div className="space-y-4">
                  {client.analyses.map(analysis => (
                    <div key={analysis.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-medium text-white">{analysis.reportType} Analysis</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          analysis.status === 'completed' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                        }`}>
                          {analysis.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">Created: {formatDate(analysis.createdAt)}</p>
                      
                      {analysis.results && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(analysis.results as Record<string, any>).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-lg font-bold text-blue-400">{String(value)}</div>
                              <div className="text-xs text-gray-400 capitalize">{key.replace('Score', '')}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No lab analyses available</p>
              )}
            </div>
          )}

          {activeTab === 'protocols' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Protocols</h2>
              {client.currentProtocol ? (
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">{client.currentProtocol.phase}</h3>
                      <p className="text-gray-400">Started: {formatDate(client.currentProtocol.startDate)}</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm">
                      View Full Protocol
                    </button>
                  </div>
                  
                  {client.currentProtocol.content && (
                    <div className="bg-slate-600 rounded p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap">{client.currentProtocol.content}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">No protocols available</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Notes</h2>
              <div className="space-y-4">
                {client.notes.map(note => (
                  <div key={note.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">{note.type}</span>
                      <span>{formatDate(note.date)}</span>
                    </div>
                    <p className="text-gray-300">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Documents</h2>
              <div className="space-y-3">
                {client.documents.map(doc => (
                  <div key={doc.id} className="flex justify-between items-center bg-slate-700 rounded-lg p-4">
                    <div>
                      <span className="text-white font-medium">{doc.name}</span>
                      <span className="text-gray-400 ml-2">({doc.type})</span>
                    </div>
                    {doc.fileUrl ? (
                      <button 
                        onClick={() => openDocument(doc)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
                      >
                        View
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">No file available</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
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