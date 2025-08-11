"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  Truck,
  FileText,
  Activity,
  Eye,
  Plus,
  MessageSquare,
  Clock,
  Star,
  AlertCircle,
} from "lucide-react";
import NoteCard from "@/components/notes/NoteCard";
import NoteModal from "@/components/notes/NoteModal";
import ClientDocumentViewer from "@/components/clients/ClientDocumentViewer";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  isTruckDriver: boolean;
  dotNumber?: string;
  cdlNumber?: string;
  status: string;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  labType?: string;
  status: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  aiAnalysis?: any;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

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

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteCounts, setNoteCounts] = useState({ interview: 0, coaching: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"interview" | "coaching">(
    "interview"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showImportant, setShowImportant] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "updated">(
    "newest"
  );
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    const fetchClientAndDocuments = async () => {
      try {
        console.log("Fetching client data for ID:", params.id);
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch client data
        const clientResponse = await fetch(`/api/clients/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!clientResponse.ok) {
          throw new Error("Failed to fetch client");
        }

        const clientData = await clientResponse.json();
        setClient(clientData);

        // Fetch documents for this client
        const documentsResponse = await fetch(
          `/api/documents?clientId=${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json();
          console.log("📄 Documents fetched:", documentsData);
          setDocuments(documentsData);
        } else {
          console.error(
            "❌ Failed to fetch documents:",
            documentsResponse.status,
            documentsResponse.statusText
          );
        }

        // Fetch notes for this client and note counts
        if (params.id) {
          console.log("Fetching notes for client ID:", params.id);
          await Promise.all([fetchNotesWithFilters(), fetchNoteCounts()]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load client");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClientAndDocuments();
    }
  }, [params.id, router]);

  // Refetch notes when filters change
  useEffect(() => {
    if (params.id) {
      fetchNotesWithFilters();
    }
  }, [activeTab, searchTerm, showImportant, showFollowUp, sortBy, params.id]);

  const handleDelete = async () => {
    if (!client || !confirm("Are you sure you want to delete this client?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.push("/dashboard/clients");
      } else {
        throw new Error("Failed to delete client");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete client");
    }
  };

  const openNewNoteModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleCreateNote = async (
    noteData: Omit<Note, "id" | "createdAt" | "updatedAt" | "client">
  ) => {
    try {
      const token = localStorage.getItem("token");

      if (editingNote) {
        // Update existing note
        const response = await fetch(`/api/notes/${editingNote.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(noteData),
        });

        if (response.ok) {
          const updatedNote = await response.json();
          setNotes((prev) =>
            prev.map((note) =>
              note.id === editingNote.id ? updatedNote : note
            )
          );
        } else {
          throw new Error("Failed to update note");
        }
      } else {
        // Create new note
        const response = await fetch(`/api/clients/${params.id}/notes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(noteData),
        });

        if (response.ok) {
          const newNote = await response.json();
          setNotes((prev) => [newNote, ...prev]);
          // Refresh the note counts to ensure accuracy
          await fetchNoteCounts();
        } else {
          throw new Error("Failed to create note");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    }
  };

  const fetchNoteCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !params.id) return;

      // Fetch counts for both note types
      const [interviewResponse, coachingResponse] = await Promise.all([
        fetch(`/api/clients/${params.id}/notes?type=INTERVIEW`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/clients/${params.id}/notes?type=COACHING`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (interviewResponse.ok && coachingResponse.ok) {
        const [interviewNotes, coachingNotes] = await Promise.all([
          interviewResponse.json(),
          coachingResponse.json(),
        ]);

        setNoteCounts({
          interview: interviewNotes.length,
          coaching: coachingNotes.length,
        });
      }
    } catch (err) {
      console.error("Failed to fetch note counts:", err);
    }
  };

  const fetchNotesWithFilters = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !params.id) return;

      const searchParams = new URLSearchParams();
      if (activeTab === "interview") searchParams.append("type", "INTERVIEW");
      if (activeTab === "coaching") searchParams.append("type", "COACHING");
      if (searchTerm) searchParams.append("search", searchTerm);
      if (showImportant) searchParams.append("important", "true");
      if (showFollowUp) searchParams.append("followUp", "true");
      searchParams.append("sortBy", sortBy);

      const response = await fetch(
        `/api/clients/${params.id}/notes?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData);
      }
    } catch (err) {
      console.error("Failed to fetch notes with filters:", err);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleDeleteNote = async (note: Note) => {
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the note from the local state
        setNotes(notes.filter((n) => n.id !== note.id));
        // Refresh the note counts to ensure accuracy
        await fetchNoteCounts();
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  // Since we're now fetching filtered data from the server, we can use notes directly
  const filteredNotes = notes;

  // Use the note counts from state
  const interviewNotesCount = noteCounts.interview;
  const coachingNotesCount = noteCounts.coaching;

  const formatNoteContent = (note: Note) => {
    if (note.noteType === "INTERVIEW") {
      return [
        note.chiefComplaints && `Chief Complaints: ${note.chiefComplaints}`,
        note.healthHistory && `Health History: ${note.healthHistory}`,
        note.currentMedications &&
          `Current Medications: ${note.currentMedications}`,
        note.goals && `Goals: ${note.goals}`,
        note.generalNotes && `General Notes: ${note.generalNotes}`,
      ]
        .filter(Boolean)
        .join("\n\n");
    } else {
      return [
        note.protocolAdjustments &&
          `Protocol Adjustments: ${note.protocolAdjustments}`,
        note.complianceNotes && `Compliance Notes: ${note.complianceNotes}`,
        note.progressMetrics && `Progress Metrics: ${note.progressMetrics}`,
        note.nextSteps && `Next Steps: ${note.nextSteps}`,
        note.generalNotes && `General Notes: ${note.generalNotes}`,
      ]
        .filter(Boolean)
        .join("\n\n");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 rounded w-1/4 mb-6" style={{ background: 'var(--bg-hover)' }}></div>
            <div className="card">
              <div className="h-6 rounded w-1/3 mb-4" style={{ background: 'var(--bg-hover)' }}></div>
              <div className="space-y-3">
                <div className="h-4 rounded w-1/2" style={{ background: 'var(--bg-hover)' }}></div>
                <div className="h-4 rounded w-2/3" style={{ background: 'var(--bg-hover)' }}></div>
                <div className="h-4 rounded w-1/3" style={{ background: 'var(--bg-hover)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="card" style={{ borderColor: 'var(--red-accent)', background: 'rgba(239, 68, 68, 0.1)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--red-accent)' }}>Error</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <Link
              href="/dashboard/clients"
              className="inline-block mt-4 hover:underline transition-colors duration-200"
              style={{ color: 'var(--primary-green)' }}
            >
              ← Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="card" style={{ borderColor: 'var(--orange-accent)', background: 'rgba(251, 146, 60, 0.1)' }}>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--orange-accent)' }}>
              Client Not Found
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              The client you're looking for doesn't exist.
            </p>
            <Link
              href="/dashboard/clients"
              className="inline-block mt-4 hover:underline transition-colors duration-200"
              style={{ color: 'var(--primary-green)' }}
            >
              ← Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/clients"
              className="flex items-center transition-colors duration-200 hover:underline"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Clients
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {client.firstName} {client.lastName}
            </h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="btn-primary flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 rounded-lg transition-colors duration-200"
              style={{ 
                background: 'var(--red-accent)', 
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--red-accent)';
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Token Management Debug Section */}
        {error && error.includes("authentication") && (
          <div className="mb-6 card" style={{ borderColor: 'var(--red-accent)', background: 'rgba(239, 68, 68, 0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--red-accent)' }}>
                  🔐 Authentication Issue Detected
                </h3>
                <p className="mb-3" style={{ color: 'var(--text-secondary)' }}>
                  There's an issue with your authentication token. This can
                  happen if the token is corrupted or expired.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="px-4 py-2 rounded-md transition-colors duration-200"
                    style={{ background: 'var(--red-accent)', color: 'var(--text-primary)' }}
                  >
                    Clear Token & Log In Again
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      fetchClientAndDocuments();
                    }}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                </div>
              </div>
              <div style={{ color: 'var(--red-accent)' }} className="text-4xl">🔐</div>
            </div>
          </div>
        )}

        {/* Client Information */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Client Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3" style={{ color: 'var(--text-secondary)' }} />
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Email</p>
                    <p style={{ color: 'var(--text-primary)' }}>{client.email}</p>
                  </div>
                </div>
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-3" style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Phone</p>
                      <p style={{ color: 'var(--text-primary)' }}>{client.phone}</p>
                    </div>
                  </div>
                )}
                {client.dateOfBirth && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-3" style={{ color: 'var(--text-secondary)' }} />
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Date of Birth</p>
                      <p style={{ color: 'var(--text-primary)' }}>
                        {new Date(client.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Icon */}
            <div className="flex flex-col items-center ml-6">
              <div
                className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-2"
                style={{
                  background: client.status === "SIGNED_UP"
                    ? "rgba(59, 130, 246, 0.2)"
                    : client.status === "INITIAL_INTERVIEW_COMPLETED"
                    ? "rgba(34, 197, 94, 0.2)"
                    : client.status === "ASSESSMENT_COMPLETED"
                    ? "rgba(251, 191, 36, 0.2)"
                    : client.status === "DOCS_UPLOADED"
                    ? "rgba(147, 51, 234, 0.2)"
                    : client.status === "SCHEDULED"
                    ? "rgba(99, 102, 241, 0.2)"
                    : client.status === "ONGOING"
                    ? "var(--primary-green-light)"
                    : client.status === "ARCHIVED"
                    ? "rgba(107, 114, 128, 0.2)"
                    : "rgba(107, 114, 128, 0.2)"
                }}
              >
                {client.status === "SIGNED_UP" && (
                  <span className="text-sm" style={{ color: '#3b82f6' }}>📝</span>
                )}
                {client.status === "INITIAL_INTERVIEW_COMPLETED" && (
                  <span className="text-sm" style={{ color: '#22c55e' }}>✅</span>
                )}
                {client.status === "ASSESSMENT_COMPLETED" && (
                  <span className="text-sm" style={{ color: '#fbbf24' }}>📋</span>
                )}
                {client.status === "DOCS_UPLOADED" && (
                  <span className="text-sm" style={{ color: '#9333ea' }}>📄</span>
                )}
                {client.status === "SCHEDULED" && (
                  <span className="text-sm" style={{ color: '#6366f1' }}>📅</span>
                )}
                {client.status === "ONGOING" && (
                  <span className="text-sm" style={{ color: 'var(--primary-green)' }}>🔄</span>
                )}
                {client.status === "ARCHIVED" && (
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>📦</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Status</p>
                <p
                  className="text-xs font-medium"
                  style={{
                    color: client.status === "SIGNED_UP"
                      ? "#3b82f6"
                      : client.status === "INITIAL_INTERVIEW_COMPLETED"
                      ? "#22c55e"
                      : client.status === "ASSESSMENT_COMPLETED"
                      ? "#fbbf24"
                      : client.status === "DOCS_UPLOADED"
                      ? "#9333ea"
                      : client.status === "SCHEDULED"
                      ? "#6366f1"
                      : client.status === "ONGOING"
                      ? "var(--primary-green)"
                      : client.status === "ARCHIVED"
                      ? "var(--text-secondary)"
                      : "var(--text-secondary)"
                  }}
                >
                  {client.status === "SIGNED_UP"
                    ? "Signed Up"
                    : client.status === "INITIAL_INTERVIEW_COMPLETED"
                    ? "Interview Done"
                    : client.status === "ASSESSMENT_COMPLETED"
                    ? "Assessment Done"
                    : client.status === "DOCS_UPLOADED"
                    ? "Docs Uploaded"
                    : client.status === "SCHEDULED"
                    ? "Scheduled"
                    : client.status === "ONGOING"
                    ? "Ongoing"
                    : client.status === "ARCHIVED"
                    ? "Archived"
                    : client.status}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Client Notes
            </h2>
            <button
              onClick={openNewNoteModal}
              className="btn-primary flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </button>
          </div>

          <div className="flex space-x-1 mb-6 rounded-lg p-1" style={{ background: 'var(--bg-secondary)' }}>
            <button
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
              style={{
                background: activeTab === "interview" ? 'var(--bg-card)' : 'transparent',
                color: activeTab === "interview" ? 'var(--primary-green)' : 'var(--text-secondary)',
                borderColor: activeTab === "interview" ? 'var(--border-primary)' : 'transparent'
              }}
              onClick={() => setActiveTab("interview")}
            >
              Interview Notes ({interviewNotesCount})
            </button>
            <button
              className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200"
              style={{
                background: activeTab === "coaching" ? 'var(--bg-card)' : 'transparent',
                color: activeTab === "coaching" ? 'var(--primary-green)' : 'var(--text-secondary)',
                borderColor: activeTab === "coaching" ? 'var(--border-primary)' : 'transparent'
              }}
              onClick={() => setActiveTab("coaching")}
            >
              Coaching Calls ({coachingNotesCount})
            </button>
          </div>

          {/* Search and Filter Controls */}
          <div className="notes-filter mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input text-sm"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "updated")
                }
                className="input text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-1 text-sm rounded-md transition-colors duration-200"
                style={{
                  background: showImportant ? 'rgba(251, 191, 36, 0.2)' : 'var(--bg-secondary)',
                  color: showImportant ? '#fbbf24' : 'var(--text-secondary)',
                  border: showImportant ? '1px solid #fbbf24' : '1px solid var(--border-primary)'
                }}
                onClick={() => setShowImportant(!showImportant)}
              >
                Important Only
              </button>
              <button
                className="px-3 py-1 text-sm rounded-md transition-colors duration-200"
                style={{
                  background: showFollowUp ? 'var(--primary-green-light)' : 'var(--bg-secondary)',
                  color: showFollowUp ? 'var(--primary-green)' : 'var(--text-secondary)',
                  border: showFollowUp ? '1px solid var(--primary-green)' : '1px solid var(--border-primary)'
                }}
                onClick={() => setShowFollowUp(!showFollowUp)}
              >
                Follow-up Needed
              </button>
              {(searchTerm || showImportant || showFollowUp) && (
                <button
                  className="px-3 py-1 text-sm transition-colors duration-200 hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => {
                    setSearchTerm("");
                    setShowImportant(false);
                    setShowFollowUp(false);
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" style={{ color: 'var(--text-secondary)' }} />
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {searchTerm || showImportant || showFollowUp
                    ? "No notes match your current filters"
                    : `No ${
                        activeTab === "interview" ? "interview" : "coaching"
                      } notes yet`}
                </p>
                {searchTerm || showImportant || showFollowUp ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setShowImportant(false);
                      setShowFollowUp(false);
                    }}
                    className="btn-primary"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    onClick={openNewNoteModal}
                    className="btn-primary"
                  >
                    Create your first{" "}
                    {activeTab === "interview" ? "interview" : "coaching"} note
                  </button>
                )}
              </div>
            ) : (
              <>
                {(searchTerm || showImportant || showFollowUp) && (
                  <div className="mb-4 text-sm text-gray-500">
                    Showing {filteredNotes.length} notes
                  </div>
                )}
                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Documents Section - Enhanced PDF Viewer */}
        <ClientDocumentViewer
          clientId={client.id}
          documents={documents}
          onRefresh={() => {
            // Refresh documents
            fetchClientAndDocuments();
          }}
        />
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateNote}
        clientId={params.id as string}
        noteType={activeTab === "interview" ? "INTERVIEW" : "COACHING"}
        initialData={editingNote || undefined}
        isEditing={!!editingNote}
      />
    </div>
  );
}
