"use client";

import { useState, useEffect, useCallback } from "react";
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
import NoteViewerModal from "@/components/notes/NoteViewerModal";
import ClientDocumentViewer from "@/components/clients/ClientDocumentViewer";
import DocumentUploadModal from "@/components/documents/DocumentUploadModal";

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
  healthGoals?: string[];
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
  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Document delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(
    null
  );

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
          await Promise.all([fetchAllNotes(), fetchNoteCounts()]);
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

  // Refetch all notes when filters change (we'll filter locally now)
  useEffect(() => {
    if (params.id) {
      fetchAllNotes();
    }
  }, [searchTerm, showImportant, showFollowUp, sortBy, params.id]);

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

  const handleDeleteNote = async (noteId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId));
        await fetchNoteCounts();
      } else {
        throw new Error("Failed to delete note");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  // Handle delete button click - just show the modal
  const handleDeleteDocumentClick = useCallback(
    (documentId: string) => {
      console.log("🗑️ handleDeleteDocumentClick called with ID:", documentId);
      const docToDelete = documents.find((doc) => doc.id === documentId);
      if (docToDelete) {
        console.log("📄 Found document to delete:", docToDelete.fileName);
        setDocumentToDelete(docToDelete);
        setShowDeleteConfirm(true);
        console.log("✅ Modal state set - showDeleteConfirm: true");
      } else {
        console.error("❌ Document not found with ID:", documentId);
      }
    },
    [documents]
  );

  // Actually delete the document
  const confirmDeleteDocument = useCallback(async () => {
    if (!documentToDelete) {
      console.error("❌ No document to delete");
      return;
    }

    console.log(
      "🔥 Confirming delete for document:",
      documentToDelete.fileName
    );

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No token found");
        setError("Please log in again");
        alert("Please log in again");
        return;
      }

      console.log(
        "🔐 Token found, making DELETE request to:",
        `/api/documents?id=${documentToDelete.id}`
      );

      const response = await fetch(`/api/documents?id=${documentToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Delete response status:", response.status);

      if (response.ok) {
        console.log("✅ Document deleted successfully, updating local state");
        setDocuments((prev) =>
          prev.filter((doc) => doc.id !== documentToDelete.id)
        );
        setError("");
        alert("Document deleted successfully!");

        // Close modal
        setShowDeleteConfirm(false);
        setDocumentToDelete(null);
      } else {
        const errorData = await response.json();
        console.error("❌ Delete failed with error:", errorData);
        const errorMessage = errorData.error || "Failed to delete document";
        setError(errorMessage);
        alert(`Failed to delete document: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete document";
      console.error("💥 Error deleting document:", err);
      setError(errorMessage);
      alert(`Error deleting document: ${errorMessage}`);
    }
  }, [documentToDelete, setDocuments, setError]);

  // Memoized refresh handler to prevent unnecessary component remounting
  const handleRefresh = useCallback(() => {
    fetchClientAndDocuments();
  }, []);

  const handleDocumentUpload = async (files: File[]) => {
    const token = localStorage.getItem("token");
    const uploadPromises: Promise<any>[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("clientId", params.id as string);
      formData.append("documentType", "other"); // Default type, AI will determine actual type

      const uploadPromise = fetch("/api/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        return response.json();
      });

      uploadPromises.push(uploadPromise);
    }

    try {
      const newDocuments = await Promise.all(uploadPromises);
      setDocuments((prev) => [...newDocuments, ...prev]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload some documents"
      );
      throw err; // Re-throw to let modal handle the error state
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

  const fetchAllNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token || !params.id) return;

      const searchParams = new URLSearchParams();
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
      console.error("Failed to fetch notes:", err);
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

  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setIsNoteViewerOpen(true);
  };

  const handleEditFromViewer = (note: Note) => {
    setIsNoteViewerOpen(false);
    setViewingNote(null);
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  // Since we're now fetching filtered data from the server, we can use notes directly
  const filteredNotes = notes;

  // Use the note counts from state
  const interviewNotesCount = noteCounts.interview;
  const coachingNotesCount = noteCounts.coaching;

  const formatNoteContent = (note: Note) => {
    return note.generalNotes || "";
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

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Check if it's a 10-digit US number
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }

    // If not 10 digits, return as-is
    return phone;
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/clients"
              className="flex items-center text-sm transition-colors duration-200 hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {client.firstName} {client.lastName}
            </h1>
            {/* Status badge in header */}
            <div
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                background:
                  client.status === "SIGNED_UP"
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
                    : "rgba(107, 114, 128, 0.2)",
                color:
                  client.status === "SIGNED_UP"
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
                    : "var(--text-secondary)",
              }}
            >
              {client.status === "SIGNED_UP"
                ? "📝 Signed Up"
                : client.status === "INITIAL_INTERVIEW_COMPLETED"
                ? "✅ Interview Done"
                : client.status === "ASSESSMENT_COMPLETED"
                ? "📋 Assessment Done"
                : client.status === "DOCS_UPLOADED"
                ? "📄 Docs Uploaded"
                : client.status === "SCHEDULED"
                ? "📅 Scheduled"
                : client.status === "ONGOING"
                ? "🔄 Ongoing"
                : client.status === "ARCHIVED"
                ? "📦 Archived"
                : client.status}
            </div>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/dashboard/clients/${client.id}/edit`}
              className="btn-primary flex items-center text-sm px-3 py-2"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center px-3 py-2 rounded-lg transition-colors duration-200 text-sm"
              style={{
                background: "var(--red-accent)",
                color: "var(--text-primary)",
              }}
            >
              <Trash2 className="w-4 h-4 mr-1" />
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

        {/* Compact Client Overview */}
        <div className="card p-4 mb-3 max-w-3xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span style={{ color: "var(--text-secondary)" }}>Email:</span>
              <div
                style={{ color: "var(--text-primary)" }}
                className="font-medium"
              >
                {client.email}
              </div>
            </div>
            {client.phone && (
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Phone:</span>
                <div
                  style={{ color: "var(--text-primary)" }}
                  className="font-medium"
                >
                  {formatPhoneNumber(client.phone)}
                </div>
              </div>
            )}
            {client.dateOfBirth && (
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Age:</span>
                <div
                  style={{ color: "var(--text-primary)" }}
                  className="font-medium"
                >
                  {calculateAge(client.dateOfBirth)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Health Goals Section */}
        {client.healthGoals && client.healthGoals.length > 0 && (
          <div className="card p-4 mb-3 max-w-3xl">
            <h3
              className="text-lg font-medium mb-3 flex items-center"
              style={{ color: "#10b981" }}
            >
              <span className="w-5 h-5 mr-3">🎯</span>
              Health Goals
            </h3>
            <div className="space-y-2">
              {client.healthGoals.map((goal, index) => (
                <div
                  key={index}
                  className="p-3 rounded-md"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <p style={{ color: "var(--text-primary)" }}>{goal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section - Two Cards Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Interview Notes Card */}
          <div className="card p-3">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-lg font-bold flex items-center"
                style={{ color: "#3b82f6" }}
              >
                <MessageSquare
                  className="w-5 h-5 mr-3"
                  style={{ color: "#3b82f6" }}
                />
                Interview Notes ({interviewNotesCount})
              </h3>
              <button
                onClick={() => {
                  setActiveTab("interview");
                  openNewNoteModal();
                }}
                className="btn-primary text-xs px-2 py-1 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
            </div>

            {/* Interview Notes List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.filter((note) => note.noteType === "INTERVIEW").length ===
              0 ? (
                <div className="text-center py-6">
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No interview notes yet
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("interview");
                      openNewNoteModal();
                    }}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Create First Note
                  </button>
                </div>
              ) : (
                notes
                  .filter((note) => note.noteType === "INTERVIEW")
                  .slice(0, 4)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="p-2 rounded text-xs border hover:border-opacity-75 transition-colors cursor-pointer"
                      style={{
                        borderColor: "var(--border-primary)",
                        background: "var(--bg-secondary)",
                      }}
                      onClick={() => handleViewNote(note)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-medium truncate flex-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {note.title || `Interview Note`}
                        </span>
                        <div className="flex items-center space-x-1 ml-2">
                          {note.isImportant && (
                            <Star
                              className="w-3 h-3"
                              style={{ color: "#fbbf24" }}
                            />
                          )}
                          {note.followUpNeeded && (
                            <AlertCircle
                              className="w-3 h-3"
                              style={{ color: "var(--primary-green)" }}
                            />
                          )}
                          <span
                            style={{ color: "var(--text-secondary)" }}
                            className="text-xs"
                          >
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p
                        className="line-clamp-2 leading-tight"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatNoteContent(note).substring(0, 100)}...
                      </p>
                    </div>
                  ))
              )}
              {notes.filter((note) => note.noteType === "INTERVIEW").length >
                4 && (
                <div className="text-center py-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    +
                    {notes.filter((note) => note.noteType === "INTERVIEW")
                      .length - 4}{" "}
                    more notes
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Coaching Notes Card */}
          <div className="card p-3">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-lg font-bold flex items-center"
                style={{ color: "#f59e0b" }}
              >
                <MessageSquare
                  className="w-5 h-5 mr-3"
                  style={{ color: "#f59e0b" }}
                />
                Coaching Notes ({coachingNotesCount})
              </h3>
              <button
                onClick={() => {
                  setActiveTab("coaching");
                  openNewNoteModal();
                }}
                className="btn-primary text-xs px-2 py-1 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
            </div>

            {/* Coaching Notes List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notes.filter((note) => note.noteType === "COACHING").length ===
              0 ? (
                <div className="text-center py-6">
                  <p
                    className="text-xs mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No coaching notes yet
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("coaching");
                      openNewNoteModal();
                    }}
                    className="btn-primary text-xs px-3 py-1"
                  >
                    Create First Note
                  </button>
                </div>
              ) : (
                notes
                  .filter((note) => note.noteType === "COACHING")
                  .slice(0, 4)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="p-2 rounded text-xs border hover:border-opacity-75 transition-colors cursor-pointer"
                      style={{
                        borderColor: "var(--border-primary)",
                        background: "var(--bg-secondary)",
                      }}
                      onClick={() => handleViewNote(note)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="font-medium truncate flex-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {note.title || `Coaching Note`}
                        </span>
                        <div className="flex items-center space-x-1 ml-2">
                          {note.isImportant && (
                            <Star
                              className="w-3 h-3"
                              style={{ color: "#fbbf24" }}
                            />
                          )}
                          {note.followUpNeeded && (
                            <AlertCircle
                              className="w-3 h-3"
                              style={{ color: "var(--primary-green)" }}
                            />
                          )}
                          <span
                            style={{ color: "var(--text-secondary)" }}
                            className="text-xs"
                          >
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p
                        className="line-clamp-2 leading-tight"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatNoteContent(note).substring(0, 100)}...
                      </p>
                    </div>
                  ))
              )}
              {notes.filter((note) => note.noteType === "COACHING").length >
                4 && (
                <div className="text-center py-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    +
                    {notes.filter((note) => note.noteType === "COACHING")
                      .length - 4}{" "}
                    more notes
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Section - Compact and Reduced Space */}
        <div className="card p-3">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-lg font-bold flex items-center"
              style={{ color: "#8b5cf6" }}
            >
              <FileText className="w-5 h-5 mr-3" style={{ color: "#8b5cf6" }} />
              Documents ({documents.length})
            </h3>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary text-xs px-2 py-1 flex items-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              Upload
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <ClientDocumentViewer
              clientId={client.id}
              documents={documents}
              onRefresh={handleRefresh}
              onDelete={handleDeleteDocumentClick}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSubmit={handleCreateNote}
        onDelete={handleDeleteNote}
        clientId={params.id as string}
        noteType={activeTab === "interview" ? "INTERVIEW" : "COACHING"}
        initialData={editingNote || undefined}
        isEditing={!!editingNote}
      />

      {/* Note Viewer Modal */}
      <NoteViewerModal
        isOpen={isNoteViewerOpen}
        note={viewingNote}
        onClose={() => {
          setIsNoteViewerOpen(false);
          setViewingNote(null);
        }}
        onEdit={handleEditFromViewer}
      />

      {/* Document Upload Modal */}
      {isUploadModalOpen && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onUpload={handleDocumentUpload}
          clientId={params.id as string}
        />
      )}

      {/* Document Delete Confirmation Modal */}
      {showDeleteConfirm && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div
            className="rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            style={{ background: "var(--bg-card)" }}
            onClick={(e) => {
              console.log("🎯 Modal content clicked", e.target);
              e.stopPropagation();
            }}
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
                  Delete Document
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
              Are you sure you want to delete this document?
              <span className="font-medium block mt-1">
                "{documentToDelete.fileName}"
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  console.log("❌ Cancel button clicked");
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                  setDocumentToDelete(null);
                }}
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
                onClick={(e) => {
                  console.log("🔥 DELETE BUTTON CLICKED IN MODAL");
                  e.stopPropagation();
                  confirmDeleteDocument();
                }}
                className="flex items-center px-4 py-2 rounded-md transition-colors hover:opacity-80"
                style={{
                  background: "#dc2626",
                  color: "white",
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
