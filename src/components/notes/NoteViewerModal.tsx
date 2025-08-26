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
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface NoteViewerModalProps {
  isOpen: boolean;
  note: Note | null;
  client: Client | null;
  onClose: () => void;
  onEdit?: (note: Note) => void;
}

export default function NoteViewerModal({
  isOpen,
  note,
  client,
  onClose,
  onEdit,
}: NoteViewerModalProps) {
  if (!isOpen || !note || !client) return null;

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
        <h3 className="text-sm font-semibold mb-2 text-primary">{label}</h3>
        <div className="p-4 rounded-lg leading-relaxed whitespace-pre-wrap bg-secondary text-foreground border border-border">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-lg shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden bg-card border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  note.noteType === "INTERVIEW"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {note.noteType === "INTERVIEW" ? "📋 Interview" : "🎯 Coaching"}{" "}
                Note
              </div>
              {note.isImportant && <Star className="w-5 h-5 text-yellow-400" />}
              {note.followUpNeeded && (
                <AlertCircle className="w-5 h-5 text-primary" />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(note)}
                className="flex items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
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
                <h1 className="text-2xl font-bold text-foreground">
                  {note.title}
                </h1>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 p-4 rounded-lg bg-secondary">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm font-medium text-foreground">
                  {client.firstName} {client.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium text-foreground">
                  {formatDate(note.createdAt)}
                </span>
              </div>
              {note.createdAt !== note.updatedAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Updated:
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Note Content */}
            <div className="space-y-6">
              {renderField(
                `${
                  note.noteType === "INTERVIEW" ? "Interview" : "Coaching"
                } Notes`,
                note.generalNotes
              )}
            </div>

            {/* Flags */}
            {(note.isImportant || note.followUpNeeded) && (
              <div className="mt-8 p-4 rounded-lg bg-secondary">
                <h3 className="text-sm font-semibold mb-3 text-foreground">
                  Flags
                </h3>
                <div className="flex flex-wrap gap-3">
                  {note.isImportant && (
                    <div className="flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                      <Star className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Important</span>
                    </div>
                  )}
                  {note.followUpNeeded && (
                    <div className="flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Follow-up Needed
                      </span>
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
