"use client";

import { format } from "date-fns";
import { Star, AlertCircle, Edit, Trash2 } from "lucide-react";

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

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

const Badge = ({ 
  variant, 
  children 
}: { 
  variant: "warning" | "info" | "success"; 
  children: React.ReactNode;
}) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  const variantClasses = {
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {variant === "warning" && <Star className="w-3 h-3 mr-1" />}
      {variant === "info" && <AlertCircle className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <div className="note-card border border-gray-200 rounded-lg p-6 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="note-header flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {note.title || `${note.noteType === 'INTERVIEW' ? 'Interview' : 'Coaching'} Note`}
          </h3>
          <div className="flex gap-2 mt-1">
            <span className="text-sm text-gray-500">
              {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
            </span>
            {note.updatedAt !== note.createdAt && (
              <span className="text-sm text-gray-400">
                (edited {format(new Date(note.updatedAt), 'MMM d, yyyy')})
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {note.isImportant && <Badge variant="warning">Important</Badge>}
          {note.followUpNeeded && <Badge variant="info">Follow-up</Badge>}
          <button 
            onClick={() => onEdit(note)} 
            className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </button>
          <button 
            onClick={() => onDelete(note)} 
            className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        </div>
      </div>

      <div className="note-content space-y-4">
        {note.noteType === 'INTERVIEW' ? (
          <>
            {note.chiefComplaints && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Chief Complaints:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.chiefComplaints}</p>
              </div>
            )}
            {note.healthHistory && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Health History:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.healthHistory}</p>
              </div>
            )}
            {note.currentMedications && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Current Medications:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.currentMedications}</p>
              </div>
            )}
            {note.goals && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Goals:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.goals}</p>
              </div>
            )}
          </>
        ) : (
          <>
            {note.protocolAdjustments && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Protocol Adjustments:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.protocolAdjustments}</p>
              </div>
            )}
            {note.complianceNotes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Compliance:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.complianceNotes}</p>
              </div>
            )}
            {note.progressMetrics && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Progress Metrics:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.progressMetrics}</p>
              </div>
            )}
            {note.nextSteps && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Next Steps:</h4>
                <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.nextSteps}</p>
              </div>
            )}
          </>
        )}
        {note.generalNotes && (
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Additional Notes:</h4>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{note.generalNotes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
