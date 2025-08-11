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
          setDocuments(documentsData);
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <Link
              href="/dashboard/clients"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800"
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">
              Client Not Found
            </h2>
            <p className="text-yellow-600">
              The client you're looking for doesn't exist.
            </p>
            <Link
              href="/dashboard/clients"
              className="inline-block mt-4 text-blue-600 hover:text-blue-800"
            >
              ← Back to Clients
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/clients"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Clients
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {client.firstName} {client.lastName}
            </h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Token Management Debug Section */}
        {error && error.includes("authentication") && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  🔐 Authentication Issue Detected
                </h3>
                <p className="text-red-700 mb-3">
                  There's an issue with your authentication token. This can
                  happen if the token is corrupted or expired.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      window.location.href = "/login";
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Clear Token & Log In Again
                  </button>
                  <button
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      fetchClientAndDocuments();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
              <div className="text-red-400 text-4xl">🔐</div>
            </div>
          </div>
        )}

        {/* Client Information */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{client.email}</p>
                </div>
              </div>
              {client.phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">{client.phone}</p>
                  </div>
                </div>
              )}
              {client.dateOfBirth && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="text-gray-900">
                      {new Date(client.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Truck Driver Information */}
          {client.isTruckDriver && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Truck Driver Information
              </h2>
              <div className="space-y-4">
                {client.dotNumber && (
                  <div>
                    <p className="text-sm text-gray-500">DOT Number</p>
                    <p className="text-gray-900 font-mono">
                      {client.dotNumber}
                    </p>
                  </div>
                )}
                {client.cdlNumber && (
                  <div>
                    <p className="text-sm text-gray-500">CDL Number</p>
                    <p className="text-gray-900 font-mono">
                      {client.cdlNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status and Dates */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Status & History
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    client.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {client.status}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="text-gray-900">
                {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
            {client.lastVisit && (
              <div>
                <p className="text-sm text-gray-500">Last Visit</p>
                <p className="text-gray-900">
                  {new Date(client.lastVisit).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Documents ({documents.length})
            </h2>
            <Link
              href={`/dashboard/documents/upload?clientId=${client.id}`}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Upload New
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No documents uploaded yet</p>
              <Link
                href={`/dashboard/documents/upload?clientId=${client.id}`}
                className="text-blue-600 hover:text-blue-700"
              >
                Upload your first document
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="capitalize">
                            {doc.documentType.replace("_", " ")}
                          </span>
                          {doc.labType && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{doc.labType}</span>
                            </>
                          )}
                          <span className="mx-2">•</span>
                          <span>
                            {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                          </span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          doc.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : doc.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {doc.status}
                      </span>
                      <Link
                        href={`/dashboard/documents/${doc.id}`}
                        className="text-blue-600 hover:text-blue-700"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  {doc.aiAnalysis && (
                    <div className="mt-3 p-3 bg-green-50 rounded-md">
                      <p className="text-xs text-green-800">
                        <strong>AI Analysis:</strong> {doc.aiAnalysis.summary}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Client Notes
            </h2>
            <button
              onClick={openNewNoteModal}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </button>
          </div>

          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                activeTab === "interview"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab("interview")}
            >
              Interview Notes ({interviewNotesCount})
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                activeTab === "coaching"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "newest" | "oldest" | "updated")
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="updated">Recently Updated</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                className={`px-3 py-1 text-sm rounded-md transition ${
                  showImportant
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setShowImportant(!showImportant)}
              >
                Important Only
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md transition ${
                  showFollowUp
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setShowFollowUp(!showFollowUp)}
              >
                Follow-up Needed
              </button>
              {(searchTerm || showImportant || showFollowUp) && (
                <button
                  className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
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
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">
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
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button
                    onClick={openNewNoteModal}
                    className="text-blue-600 hover:text-blue-700"
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

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href={`/dashboard/documents/upload?clientId=${client.id}`}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <FileText className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Upload Documents</p>
                <p className="text-sm text-gray-500">
                  Lab reports, assessments
                </p>
              </div>
            </Link>
            <Link
              href={`/dashboard/assessments/new?clientId=${client.id}`}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Activity className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">New Assessment</p>
                <p className="text-sm text-gray-500">Health questionnaire</p>
              </div>
            </Link>
            <Link
              href={`/dashboard/protocols/new?clientId=${client.id}`}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Truck className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Create Protocol</p>
                <p className="text-sm text-gray-500">Nutrition plan</p>
              </div>
            </Link>
          </div>
        </div>
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
