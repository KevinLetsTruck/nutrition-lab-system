"use client";

import { useState } from "react";
import { X, Edit, Star, AlertCircle, Calendar, User } from "lucide-react";

interface Note {
  id: string;
  noteType: "INTERVIEW" | "COACHING";
  title?: string;
  chiefComplaints?: string;
  healthHistory?: string;
  currentMedications?: string;
  goals?: string;
  protocolAdjustments?: string;
  complianceNotes?: string;
  progressMetrics?: string;
  nextSteps?: string;
  generalNotes?: string;
  isImportant: boolean;
  followUpNeeded: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface NoteViewerModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onEdit?: (note: Note) => void;
}

export default function NoteViewerModal({
  isOpen,
  note,
  onClose,
  onEdit,
}: NoteViewerModalProps) {
  if (!isOpen || !note) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderField = (label: string, content: string | undefined) => {
    if (!content || content.trim() === "") return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--primary-green)' }}>
          {label}
        </h3>
        <div 
          className="p-4 rounded-lg leading-relaxed whitespace-pre-wrap"
          style={{ 
            background: 'var(--bg-secondary)', 
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)'
          }}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div 
        className="rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden"
        style={{ background: 'var(--bg-card)' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--border-primary)' }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  background: note.noteType === "INTERVIEW" 
                    ? "rgba(34, 197, 94, 0.2)" 
                    : "rgba(59, 130, 246, 0.2)",
                  color: note.noteType === "INTERVIEW" 
                    ? "#22c55e" 
                    : "#3b82f6"
                }}
              >
                {note.noteType === "INTERVIEW" ? "📋 Interview" : "🎯 Coaching"} Note
              </div>
              {note.isImportant && (
                <Star className="w-5 h-5" style={{ color: '#fbbf24' }} />
              )}
              {note.followUpNeeded && (
                <AlertCircle className="w-5 h-5" style={{ color: 'var(--primary-green)' }} />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(note)}
                className="flex items-center px-4 py-2 rounded-lg transition-colors"
                style={{ 
                  background: 'var(--primary-green)', 
                  color: 'var(--bg-primary)' 
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)]">
          <div className="p-6">
            {/* Title */}
            {note.title && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {note.title}
                </h1>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" style={{ color: 'var(--primary-green)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Client:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {note.client.firstName} {note.client.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" style={{ color: 'var(--primary-green)' }} />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Created:</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(note.createdAt)}
                </span>
              </div>
              {note.createdAt !== note.updatedAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--primary-green)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Updated:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Note Content */}
            <div className="space-y-6">
              {renderField(
                `${note.noteType === "INTERVIEW" ? "Interview" : "Coaching"} Notes`, 
                note.generalNotes
              )}
            </div>

            {/* Flags */}
            {(note.isImportant || note.followUpNeeded) && (
              <div className="mt-8 p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Flags
                </h3>
                <div className="flex flex-wrap gap-3">
                  {note.isImportant && (
                    <div className="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      <Star className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Important</span>
                    </div>
                  )}
                  {note.followUpNeeded && (
                    <div className="flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Follow-up Needed</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
