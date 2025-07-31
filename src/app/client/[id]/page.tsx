'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import NoteModal from '@/components/NoteModal'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { supabase } from '@/lib/supabase'

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
  const router = useRouter()
  const clientId = params.id as string
  
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [noteType, setNoteType] = useState<'interview' | 'coaching_call'>('interview')
  const [uploading, setUploading] = useState(false)
  const [generatingProtocol, setGeneratingProtocol] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'analyses' | 'protocols' | 'notes' | 'documents'>('overview')
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; title: string; fileName: string } | null>(null)

  const loadClientData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(clientId)) {
        console.error('Invalid UUID format:', clientId)
        setLoading(false)
        return
      }

      // Fetch client data from the database
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) {
        console.error('Error fetching client:', clientError)
        setLoading(false)
        return
      }

      if (!client) {
        console.error('Client not found')
        setLoading(false)
        return
      }

      // Fetch notes for this client
      const { data: notes, error: notesError } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (notesError) {
        console.error('Error fetching notes:', notesError)
      }

      // Fetch protocols for this client
      const { data: protocols, error: protocolsError } = await supabase
        .from('protocols')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (protocolsError) {
        console.error('Error fetching protocols:', protocolsError)
      }

      // Fetch lab reports (documents) for this client
      const { data: labReports, error: labReportsError } = await supabase
        .from('lab_reports')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (labReportsError) {
        console.error('Error fetching lab reports:', labReportsError)
      }

      // Transform the client data
      const transformedClient: Client = {
        id: client.id,
        name: `${client.first_name} ${client.last_name}`,
        email: client.email,
        phone: client.phone || '',
        notes: notes?.map(note => ({
          id: note.id,
          type: note.type,
          content: note.content,
          date: note.created_at
        })) || [],
        documents: labReports?.map(report => ({
          id: report.id,
          name: `${report.report_type.toUpperCase()} Report`,
          type: report.report_type,
          filePath: report.file_path,
          fileUrl: report.file_path ? `/api/file-url` : undefined
        })) || [],
        currentProtocol: protocols?.[0] ? {
          id: protocols[0].id,
          phase: protocols[0].phase,
          startDate: protocols[0].start_date,
          content: protocols[0].content
        } : undefined,
        analyses: labReports?.map(report => ({
          id: report.id,
          reportType: report.report_type,
          status: report.status,
          results: report.analysis_results || {},
          createdAt: report.created_at
        })) || []
      }

      setClient(transformedClient)
    } catch (error) {
      console.error('Error loading client data:', error)
    } finally {
      setLoading(false)
    }
  }, [clientId])

  useEffect(() => {
    loadClientData()
  }, [loadClientData])

  const openInterviewNotes = () => {
    setNoteType('interview')
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

  const openDocument = async (document: Document) => {
    if (document.filePath && document.fileUrl) {
      try {
        // Get signed URL from API
        const response = await fetch(document.fileUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: document.filePath })
        })

        if (!response.ok) {
          throw new Error('Failed to get file URL')
        }

        const { url } = await response.json()
        
        setSelectedPDF({
          url: url,
          title: document.name,
          fileName: document.name
        })
        setShowPDFViewer(true)
      } catch (error) {
        console.error('Error getting file URL:', error)
        alert('Failed to load document. Please try again.')
      }
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <button 
            onClick={openInterviewNotes} 
            className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-white font-medium transition-colors"
          >
            + Interview Notes
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
          <button 
            onClick={() => router.push(`/reports/practitioner-analysis/${clientId}`)}
            className="bg-indigo-600 hover:bg-indigo-700 p-4 rounded-lg text-white font-medium transition-colors"
          >
            Generate Coaching Report
          </button>
          <button 
            onClick={() => setActiveTab('documents')}
            className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-white font-medium transition-colors"
          >
            View Documents
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
              <h2 className="text-xl font-semibold text-white mb-4">Documents & Forms</h2>
              {client.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {client.documents.map(doc => (
                    <div key={doc.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-medium text-sm mb-1 truncate">{doc.name}</h3>
                          <span className="text-gray-400 text-xs px-2 py-1 bg-slate-600 rounded">
                            {doc.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {doc.fileUrl ? (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openDocument(doc)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white text-sm font-medium transition-colors"
                          >
                            View PDF
                          </button>
                          <button 
                            onClick={async () => {
                              if (doc.filePath && doc.fileUrl) {
                                try {
                                  const response = await fetch(doc.fileUrl, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ filePath: doc.filePath })
                                  })
                                  if (response.ok) {
                                    const { url } = await response.json()
                                    window.open(url, '_blank')
                                  }
                                } catch (error) {
                                  console.error('Error getting file URL:', error)
                                  alert('Failed to open document')
                                }
                              }
                            }}
                            className="bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded text-white text-sm transition-colors"
                            title="Open in new tab"
                          >
                            ↗
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No file available</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No documents uploaded yet</p>
                  <button 
                    onClick={uploadDocument}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-medium transition-colors"
                  >
                    Upload First Document
                  </button>
                </div>
              )}
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
          onSave={loadClientData}
        />
      )}

      {/* PDF Viewer Modal */}
      {showPDFViewer && selectedPDF && (
        <PDFViewer
          isOpen={showPDFViewer}
          onClose={() => {
            setShowPDFViewer(false)
            setSelectedPDF(null)
          }}
          pdfUrl={selectedPDF.url}
          title={selectedPDF.title}
          fileName={selectedPDF.fileName}
        />
      )}
    </div>
  )
} 