"use client";

import { useState, useEffect } from "react";
import { X, Save, Star, AlertCircle } from "lucide-react";

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
  onSubmit: (note: Omit<Note, 'id'>) => void;
  clientId: string;
  noteType: "INTERVIEW" | "COACHING";
  initialData?: Note;
  isEditing?: boolean;
}

export default function NoteModal({
  isOpen,
  onClose,
  onSubmit,
  clientId,
  noteType,
  initialData,
  isEditing = false,
}: NoteModalProps) {
  const [formData, setFormData] = useState<Omit<Note, 'id'>>({
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
    field: keyof Omit<Note, 'id'>,
    value: string | boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Edit" : "Create"} {noteType === "INTERVIEW" ? "Interview" : "Coaching"} Note
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`${noteType === "INTERVIEW" ? "Interview" : "Coaching"} Note Title`}
            />
          </div>

          {/* Note Type Specific Fields */}
          {noteType === "INTERVIEW" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chief Complaints
                </label>
                <textarea
                  value={formData.chiefComplaints}
                  onChange={(e) => handleInputChange("chiefComplaints", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What are the main health concerns?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health History
                </label>
                <textarea
                  value={formData.healthHistory}
                  onChange={(e) => handleInputChange("healthHistory", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Relevant medical history, surgeries, conditions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medications
                </label>
                <textarea
                  value={formData.currentMedications}
                  onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List current medications and dosages"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goals
                </label>
                <textarea
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What are the client's health goals?"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protocol Adjustments
                </label>
                <textarea
                  value={formData.protocolAdjustments}
                  onChange={(e) => handleInputChange("protocolAdjustments", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What changes were made to the nutrition protocol?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compliance Notes
                </label>
                <textarea
                  value={formData.complianceNotes}
                  onChange={(e) => handleInputChange("complianceNotes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How well is the client following the protocol?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress Metrics
                </label>
                <textarea
                  value={formData.progressMetrics}
                  onChange={(e) => handleInputChange("progressMetrics", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Measurable improvements, weight changes, energy levels..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps
                </label>
                <textarea
                  value={formData.nextSteps}
                  onChange={(e) => handleInputChange("nextSteps", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What should the client focus on next?"
                />
              </div>
            </>
          )}

          {/* General Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.generalNotes}
              onChange={(e) => handleInputChange("generalNotes", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional observations or notes..."
            />
          </div>

          {/* Flags */}
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isImportant}
                onChange={(e) => handleInputChange("isImportant", e.target.checked)}
                className="mr-2"
              />
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-700">Important</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.followUpNeeded}
                onChange={(e) => handleInputChange("followUpNeeded", e.target.checked)}
                className="mr-2"
              />
              <AlertCircle className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-gray-700">Follow-up Needed</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Update" : "Create"} Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
