'use client'

import { useState } from 'react'

interface NoteModalProps {
  clientId: string
  noteType: 'interview' | 'coaching_call'
  onClose: () => void
  onSave?: () => void
}

const NoteModal = ({ clientId, noteType, onClose, onSave }: NoteModalProps) => {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const insertTemplate = (templateType: string) => {
    const templates = {
      symptoms: `SYMPTOMS ASSESSMENT:
• Primary concerns:
• Severity (1-10):
• Duration:
• Triggers:
• Current medications:
• Previous treatments:`,
      
      diet: `DIET HISTORY:
• Current eating pattern:
• Food sensitivities/allergies:
• Typical daily meals:
• Supplements currently taking:
• Water intake:
• Caffeine/alcohol consumption:`,
      
      goals: `HEALTH GOALS:
• Primary health objectives:
• Timeline for goals:
• Motivation factors:
• Barriers to success:
• Support system:
• Previous attempts:`,
      
      trucking: `TRUCKING LIFESTYLE:
• Route type (local/regional/OTR):
• Sleep schedule:
• Exercise opportunities:
• Meal preparation challenges:
• Stress factors:
• DOT medical requirements:`
    }

    const template = templates[templateType as keyof typeof templates] || ''
    setNote(prev => prev + '\n\n' + template)
  }

  const saveNote = async () => {
    if (!note.trim()) return

    setSaving(true)
    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          type: noteType,
          content: note,
          author: 'Kevin Rutherford, FNTP'
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save note')
      }
      
      onClose()
      onSave?.()
    } catch (error) {
      console.error('Failed to save note:', error)
      alert('Failed to save note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-card rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {noteType === 'interview' ? 'Interview Notes' : 
             'Coaching Call Notes'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-foreground-secondary hover:text-foreground text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Quick Templates */}
        <div className="mb-4">
          <p className="text-sm text-foreground-secondary mb-2">Quick Templates:</p>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => insertTemplate('symptoms')} 
              className="px-3 py-1 bg-card-hover rounded text-sm text-foreground hover:bg-card-hover transition-colors"
            >
              Symptoms
            </button>
            <button 
              onClick={() => insertTemplate('diet')} 
              className="px-3 py-1 bg-card-hover rounded text-sm text-foreground hover:bg-card-hover transition-colors"
            >
              Diet History
            </button>
            <button 
              onClick={() => insertTemplate('goals')} 
              className="px-3 py-1 bg-card-hover rounded text-sm text-foreground hover:bg-card-hover transition-colors"
            >
              Health Goals
            </button>
            <button 
              onClick={() => insertTemplate('trucking')} 
              className="px-3 py-1 bg-card-hover rounded text-sm text-foreground hover:bg-card-hover transition-colors"
            >
              Trucking Lifestyle
            </button>
          </div>
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-96 p-4 bg-card-hover border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:border-primary resize-none"
          placeholder="Enter notes during call..."
          autoFocus
        />

        <div className="flex justify-end gap-4 mt-6">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-card-hover rounded text-foreground hover:bg-card-hover transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            onClick={saveNote} 
            className="px-6 py-2 bg-blue-600 rounded text-foreground hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={saving || !note.trim()}
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteModal 