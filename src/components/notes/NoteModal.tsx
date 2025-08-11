"use client";

import { useState, useEffect } from "react";
import { X, Save, Star, AlertCircle, Trash2 } from "lucide-react";

interface Note {
  id?: string;
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
}

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (note: Omit<Note, "id">) => void;
  onDelete?: (noteId: string) => void;
  clientId: string;
  noteType: "INTERVIEW" | "COACHING";
  initialData?: Note;
  isEditing?: boolean;
}

export default function NoteModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  clientId,
  noteType,
  initialData,
  isEditing = false,
}: NoteModalProps) {
  const [formData, setFormData] = useState<Omit<Note, "id">>({
    noteType,
    title: "",
    chiefComplaints: "",
    healthHistory: "",
    currentMedications: "",
    goals: "",
    protocolAdjustments: "",
    complianceNotes: "",
    progressMetrics: "",
    nextSteps: "",
    generalNotes: "",
    isImportant: false,
    followUpNeeded: false,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        noteType: initialData.noteType,
        title: initialData.title || "",
        chiefComplaints: initialData.chiefComplaints || "",
        healthHistory: initialData.healthHistory || "",
        currentMedications: initialData.currentMedications || "",
        goals: initialData.goals || "",
        protocolAdjustments: initialData.protocolAdjustments || "",
        complianceNotes: initialData.complianceNotes || "",
        progressMetrics: initialData.progressMetrics || "",
        nextSteps: initialData.nextSteps || "",
        generalNotes: initialData.generalNotes || "",
        isImportant: initialData.isImportant,
        followUpNeeded: initialData.followUpNeeded,
      });
    } else {
      setFormData({
        noteType,
        title: "",
        chiefComplaints: "",
        healthHistory: "",
        currentMedications: "",
        goals: "",
        protocolAdjustments: "",
        complianceNotes: "",
        progressMetrics: "",
        nextSteps: "",
        generalNotes: "",
        isImportant: false,
        followUpNeeded: false,
      });
    }
  }, [initialData, isEditing, noteType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      clientId,
    });
    onClose();
  };

  const handleInputChange = (
    field: keyof Omit<Note, "id">,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDelete = () => {
    if (initialData?.id && onDelete) {
      onDelete(initialData.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--bg-card)" }}
      >
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: "1px solid var(--border-primary)" }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {isEditing ? "Edit" : "Create"}{" "}
            {noteType === "INTERVIEW" ? "Interview" : "Coaching"} Note
          </h2>
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 rounded-md transition-colors hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={
                {
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--primary-green)",
                } as React.CSSProperties
              }
              placeholder={`${
                noteType === "INTERVIEW" ? "Interview" : "Coaching"
              } Note Title`}
            />
          </div>

          {/* Single Note Content Field */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {noteType === "INTERVIEW" ? "Interview" : "Coaching"} Notes
            </label>
            <textarea
              value={formData.generalNotes}
              onChange={(e) =>
                handleInputChange("generalNotes", e.target.value)
              }
              rows={12}
              className="w-full px-3 py-2 rounded-md transition-colors resize-none hover:border-opacity-75 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={
                {
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-primary)",
                  "--tw-ring-color": "var(--primary-green)",
                } as React.CSSProperties
              }
              placeholder={
                noteType === "INTERVIEW"
                  ? "Enter interview notes, health concerns, medical history, medications, goals, and observations..."
                  : "Enter coaching notes, protocol adjustments, compliance observations, progress metrics, next steps, and recommendations..."
              }
            />
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isImportant}
                onChange={(e) =>
                  handleInputChange("isImportant", e.target.checked)
                }
                className="mr-2 w-4 h-4"
                style={{ accentColor: "var(--primary-green)" }}
              />
              <Star className="w-4 h-4 mr-2" style={{ color: "#fbbf24" }} />
              <span
                className="text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Important
              </span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.followUpNeeded}
                onChange={(e) =>
                  handleInputChange("followUpNeeded", e.target.checked)
                }
                className="mr-2 w-4 h-4"
                style={{ accentColor: "var(--primary-green)" }}
              />
              <AlertCircle
                className="w-4 h-4 mr-2"
                style={{ color: "#3b82f6" }}
              />
              <span
                className="text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                Follow-up Needed
              </span>
            </label>
          </div>

          {/* Actions */}
          <div
            className="flex justify-between items-center gap-3 pt-4"
            style={{ borderTop: "1px solid var(--border-primary)" }}
          >
            {/* Delete Button (only show when editing) */}
            <div>
              {isEditing && initialData?.id && onDelete && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center px-4 py-2 rounded-md transition-colors hover:opacity-80"
                  style={{
                    background: "#dc2626",
                    color: "white",
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Note
                </button>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md transition-colors hover:opacity-80"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 rounded-md transition-colors hover:opacity-90"
                style={{
                  background: "var(--primary-green)",
                  color: "white",
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update" : "Create"} Note
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div
            className="rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Delete Note
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="mb-6" style={{ color: "var(--text-primary)" }}>
              Are you sure you want to delete this {noteType.toLowerCase()}{" "}
              note?
              {formData.title && (
                <span className="font-medium"> "{formData.title}"</span>
              )}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-md transition-colors hover:opacity-80"
                style={{
                  background: "var(--bg-secondary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 rounded-md transition-colors hover:opacity-80"
                style={{
                  background: "#dc2626",
                  color: "white",
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
