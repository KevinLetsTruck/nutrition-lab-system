"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Truck,
  FileText,
  Eye,
  Plus,
  MessageSquare,
  Clock,
  Star,
  AlertCircle,
  Users,
  Trash2,
} from "lucide-react";
import NoteCard from "@/components/notes/NoteCard";
import NoteModal from "@/components/notes/NoteModal";
import NoteViewerModal from "@/components/notes/NoteViewerModal";
import ClientDocumentViewer from "@/components/clients/ClientDocumentViewer";
import DocumentUploadModal from "@/components/documents/DocumentUploadModal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { ExportClientButton } from "@/components/clients/ExportClientButton";
import { ImportAnalysisButton } from "@/components/clients/ImportAnalysisButton";
import { ClaudePromptsModal } from "@/components/exports/ClaudePromptsModal";
import { AnalysisResultsViewer } from "@/components/analysis/AnalysisResultsViewer";

// Dynamically import SimplePDFViewer with SSR disabled
const SimplePDFViewer = dynamic(
  () => import("@/components/pdf/SimplePDFViewer"),
  { ssr: false }
);

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
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    name: string;
    url: string;
    type: "lab_report" | "protocol" | "assessment" | "intake" | "other";
    uploadedDate: Date;
    clientId: string;
  } | null>(null);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);

  // Claude prompts modal state
  const [isClaudePromptsOpen, setIsClaudePromptsOpen] = useState(false);
  const [claudeExportResult, setClaudeExportResult] = useState<any>(null);

  useEffect(() => {
    const fetchCompleteClientData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // Single API call to get all client data (client + documents + notes)
        const response = await fetch(`/api/clients/${params.id}/complete`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Client not found");
          }
          throw new Error("Failed to fetch client data");
        }

        const data = await response.json();

        // Set all the data from the single API response
        setClient(data.client);
        setDocuments(data.documents || []);
        setNotes(data.notes || []);
        setNoteCounts(data.noteCounts || { interview: 0, coaching: 0 });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load client data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCompleteClientData();
    }
  }, [params.id, router]);

  // Listen for Claude prompts ready event
  useEffect(() => {
    const handleClaudePromptsReady = (event: CustomEvent) => {
      setClaudeExportResult(event.detail);
      setIsClaudePromptsOpen(true);
    };

    window.addEventListener('claudePromptsReady', handleClaudePromptsReady as EventListener);
    
    return () => {
      window.removeEventListener('claudePromptsReady', handleClaudePromptsReady as EventListener);
    };
  }, []);

  // Note: Filtering is now done locally since we have all notes in memory

  const openNewNoteModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const handleDocumentClick = (doc: any) => {
    setSelectedDocument({
      id: doc.id,
      name: doc.fileName,
      url: doc.fileUrl,
      type:
        (doc.documentType?.toLowerCase() as
          | "lab_report"
          | "protocol"
          | "assessment"
          | "intake"
          | "other") || "other",
      uploadedDate: new Date(doc.uploadedAt),
      clientId: client?.id || "",
    });
    setIsDocumentViewerOpen(true);
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
      const docToDelete = documents.find((doc) => doc.id === documentId);
      if (docToDelete) {
        setDocumentToDelete(docToDelete);
        setShowDeleteConfirm(true);
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

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No token found");
        setError("Please log in again");
        alert("Please log in again");
        return;
      }

      const response = await fetch(`/api/documents?id=${documentToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
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
  const handleRefresh = useCallback(async () => {
    try {
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
      } else {
        console.error(
          "❌ Failed to refresh documents:",
          documentsResponse.status,
          documentsResponse.statusText
        );
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    }
  }, [params.id, router]);

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

  // Helper function to safely handle healthGoals which can be string, array, or null
  const getHealthGoalsArray = (healthGoals: any): string[] => {
    if (!healthGoals) return [];
    if (Array.isArray(healthGoals)) return healthGoals;
    if (typeof healthGoals === "string") {
      // Split by common delimiters and clean up
      return healthGoals
        .split(/[,;|\n]/)
        .map((goal) => goal.trim())
        .filter((goal) => goal.length > 0);
    }
    return [];
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

        {/* Client Header - Full Width */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {client.firstName?.charAt(0).toUpperCase()}
                {client.lastName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {client.firstName} {client.lastName}
                </h1>
                <div className="flex items-center space-x-4 text-gray-300 mt-1">
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {client.email}
                  </span>
                  {client.phone && (
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {formatPhoneNumber(client.phone)}
                    </span>
                  )}
                  {client.dateOfBirth && (
                    <span>Age: {calculateAge(client.dateOfBirth)}</span>
                  )}
                  {client.gender && (
                    <span>
                      {client.gender === "M" ||
                      client.gender === "male" ||
                      client.gender === "Male"
                        ? "♂"
                        : "♀"}{" "}
                      {client.gender === "M" ||
                      client.gender === "male" ||
                      client.gender === "Male"
                        ? "Male"
                        : "Female"}
                    </span>
                  )}
                  {client.isTruckDriver && (
                    <span className="text-orange-400 flex items-center">
                      🚛 Commercial Driver
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right space-y-3">
              <div>
                <div className="text-green-400 text-sm font-medium">
                  ✓ Scheduled
                </div>
              </div>

              {/* Export and Import Buttons */}
              <div className="flex gap-2">
                <ExportClientButton
                  clientId={client.id}
                  clientName={`${client.firstName} ${client.lastName}`}
                  variant="secondary"
                  size="sm"
                />
                <ImportAnalysisButton
                  clientId={client.id}
                  clientName={`${client.firstName} ${client.lastName}`}
                  variant="outline"
                  size="sm"
                  onImportSuccess={() => {
                    // Don't reload immediately - let user see the success message
                    console.log("✅ Analysis imported successfully");
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results Section */}
        <div className="mb-6">
          <AnalysisResultsViewer
            clientId={client.id}
            clientName={`${client.firstName} ${client.lastName}`}
          />
        </div>

        {/* Two-Column Layout - Notes and Documents */}
        <div className="flex gap-4 h-[calc(100vh-300px)] min-h-[600px] w-full overflow-hidden">
          {/* Left Column - Notes */}
          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center">
                  <span className="text-lg mr-2">📝</span>
                  Notes
                </h3>
                <Button
                  onClick={openNewNoteModal}
                  size="sm"
                  className="flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Notes Sub-tabs - Moved to content area */}
              <div className="bg-gray-700 border-b border-gray-600 px-4 py-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab("interview")}
                    className={`${
                      activeTab === "interview"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    } px-3 py-2 rounded transition-colors flex items-center justify-center`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveTab("coaching")}
                    className={`${
                      activeTab === "coaching"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                    } px-3 py-2 rounded transition-colors flex items-center justify-center`}
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {notes.filter((note) =>
                    activeTab === "interview"
                      ? note.noteType === "INTERVIEW"
                      : note.noteType === "COACHING"
                  ).length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-4xl mb-3">
                        {activeTab === "interview" ? "🎤" : "🏃‍♂️"}
                      </div>
                      <p className="text-gray-400 mb-3">
                        No {activeTab} notes yet
                      </p>
                      <Button
                        onClick={openNewNoteModal}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Note
                      </Button>
                    </div>
                  ) : (
                    notes
                      .filter((note) =>
                        activeTab === "interview"
                          ? note.noteType === "INTERVIEW"
                          : note.noteType === "COACHING"
                      )
                      .map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-lg bg-gray-700 border border-gray-600 hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 
                              className="font-medium text-white text-sm cursor-pointer hover:text-blue-300"
                              onClick={() => handleViewNote(note)}
                            >
                              {note.title ||
                                `${note.noteType.toLowerCase()} note`}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {note.isImportant && (
                                <span
                                  className="text-red-400 text-xs"
                                  title="Important"
                                >
                                  ⭐
                                </span>
                              )}
                              {note.followUpNeeded && (
                                <span
                                  className="text-yellow-400 text-xs"
                                  title="Follow Up Needed"
                                >
                                  📋
                                </span>
                              )}
                              <span className="text-gray-400 text-xs">
                                {formatDate(note.createdAt)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Are you sure you want to delete this ${note.noteType.toLowerCase()} note?`)) {
                                    handleDeleteNote(note.id);
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Delete note"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          <p 
                            className="text-gray-300 text-xs line-clamp-2 cursor-pointer"
                            onClick={() => handleViewNote(note)}
                          >
                            {note.chiefComplaints ||
                              note.generalNotes ||
                              "Click to view details..."}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Documents */}
          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
            <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center">
                  <span className="text-lg mr-2">📄</span>
                  Documents
                </h3>
                <Button
                  onClick={() => setIsUploadModalOpen(true)}
                  size="sm"
                  className="flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-gray-400 text-sm mb-3">No documents yet</p>
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg bg-gray-700 border border-gray-600 hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {doc.fileName}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          <div className="mb-1">
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                              {doc.documentType
                                ?.replace("_", " ")
                                .toUpperCase() || "UNKNOWN"}
                            </span>
                          </div>
                          <div>
                            {formatFileSize(doc.fileSize)} •{" "}
                            {formatDate(doc.uploadedAt)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentClick(doc as any);
                            }}
                            className="p-2 hover:bg-gray-600 rounded transition-colors text-blue-400"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocumentToDelete(doc);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 hover:bg-red-600/20 rounded transition-colors text-red-400"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        client={client}
        onClose={() => {
          setIsNoteViewerOpen(false);
          setViewingNote(null);
        }}
        onEdit={handleEditFromViewer}
        onDelete={handleDeleteNote}
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
            className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Document
                </h3>
                <p className="text-sm text-gray-300">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="mb-6 text-white">
              Are you sure you want to delete this document?
              <span className="font-medium block mt-1">
                "{documentToDelete.fileName}"
              </span>
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                  setDocumentToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-gray-600 text-gray-200 border border-gray-500 hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDeleteDocument();
                }}
                className="flex items-center px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer */}
      {isDocumentViewerOpen && selectedDocument && (
        <SimplePDFViewer
          document={selectedDocument}
          onClose={() => {
            setIsDocumentViewerOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Claude Prompts Modal */}
      {isClaudePromptsOpen && claudeExportResult && (
        <ClaudePromptsModal
          isOpen={isClaudePromptsOpen}
          onClose={() => {
            setIsClaudePromptsOpen(false);
            setClaudeExportResult(null);
          }}
          exportResult={claudeExportResult}
        />
      )}
    </div>
  );
}
