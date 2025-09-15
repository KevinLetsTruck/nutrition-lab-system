"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  FileText,
  Phone,
  Mail,
  Target,
  Eye,
  MessageSquare,
  FolderOpen,
} from "lucide-react";
import NoteViewerModal from "@/components/notes/NoteViewerModal";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dynamically import SimplePDFViewer with SSR disabled
const SimplePDFViewer = dynamic(
  () => import("@/components/pdf/SimplePDFViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            <div className="text-center">
              <h3 className="text-slate-100 text-lg font-semibold mb-1">
                Loading PDF Viewer
              </h3>
              <p className="text-slate-400 text-sm">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    ),
  }
);

// Helper function to safely handle healthGoals data type conversion
function getHealthGoalsArray(healthGoals: any): string[] {
  if (!healthGoals) return [];
  if (Array.isArray(healthGoals)) return healthGoals;
  if (typeof healthGoals === "string") {
    try {
      const parsed = JSON.parse(healthGoals);
      return Array.isArray(parsed) ? parsed : [healthGoals];
    } catch {
      return [healthGoals];
    }
  }
  return [];
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  healthGoals?: string[];
  status: string;
  lastVisit?: string;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  generalNotes: string;
  noteType: "INTERVIEW" | "COACHING";
  isImportant: boolean;
  followUpNeeded: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClientDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  documentType: string;
  uploadedAt: string;
}

interface SelectedDocument {
  id: string;
  name: string;
  url: string;
  type: "lab_report" | "protocol" | "assessment" | "intake" | "other";
  uploadedDate: Date;
  clientId: string;
}

type StatusType =
  | "SIGNED_UP"
  | "INITIAL_INTERVIEW_COMPLETED"
  | "ASSESSMENT_COMPLETED"
  | "DOCS_UPLOADED"
  | "SCHEDULED"
  | "ONGOING"
  | "ARCHIVED";

export default function ScheduledClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeClientTab, setActiveClientTab] = useState<string>("");

  // Notes and Documents state
  const [clientNotes, setClientNotes] = useState<Record<string, Note[]>>({});
  const [clientDocuments, setClientDocuments] = useState<
    Record<string, ClientDocument[]>
  >({});
  const [loadingNotes, setLoadingNotes] = useState<Set<string>>(new Set());
  const [loadingDocuments, setLoadingDocuments] = useState<Set<string>>(
    new Set()
  );

  // Modal state
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<SelectedDocument | null>(null);
  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);

  useEffect(() => {
    fetchScheduledClients();
  }, []);

  // Fetch all data for scheduled clients
  useEffect(() => {
    if (clients.length > 0) {
      clients.forEach((client) => {
        fetchClientNotes(client.id);
        fetchClientDocuments(client.id);
      });
    }
  }, [clients]);

  const fetchScheduledClients = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/clients?status=SCHEDULED", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch scheduled clients");
      }

      const data = await response.json();
      setClients(data);
      // Set first client as active tab
      if (data.length > 0) {
        setActiveClientTab(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes for a specific client
  const fetchClientNotes = async (clientId: string) => {
    if (clientNotes[clientId] || loadingNotes.has(clientId)) return;

    setLoadingNotes((prev) => new Set([...prev, clientId]));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/clients/${clientId}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const notes = await response.json();
        setClientNotes((prev) => ({ ...prev, [clientId]: notes }));
      }
    } catch (err) {
      console.error("Failed to fetch notes for client:", clientId, err);
    } finally {
      setLoadingNotes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  // Fetch documents for a specific client
  const fetchClientDocuments = async (clientId: string) => {
    if (clientDocuments[clientId] || loadingDocuments.has(clientId)) return;

    setLoadingDocuments((prev) => new Set([...prev, clientId]));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/documents?clientId=${clientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const documents = await response.json();
        setClientDocuments((prev) => ({ ...prev, [clientId]: documents }));
      } else {
        console.error(
          "Failed to fetch documents:",
          response.status,
          response.statusText
        );
      }
    } catch (err) {
      console.error("Failed to fetch documents for client:", clientId, err);
    } finally {
      setLoadingDocuments((prev) => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  // Modal handlers
  const handleViewNote = (note: Note, client: Client) => {
    setViewingNote(note);
    setViewingClient(client);
    setIsNoteViewerOpen(true);
  };

  const handleViewDocument = (document: ClientDocument) => {
    setSelectedDocument({
      id: document.id,
      name: document.fileName,
      url: document.fileUrl,
      type:
        (document.documentType?.toLowerCase() as
          | "lab_report"
          | "protocol"
          | "assessment"
          | "intake"
          | "other") || "other",
      uploadedDate: new Date(document.uploadedAt),
      clientId: "",
    });
    setIsDocumentViewerOpen(true);
  };

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

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getNextThursday = () => {
    const today = new Date();
    const currentDay = today.getDay();

    // Calculate days until next Thursday (4 = Thursday)
    // If today is Thursday, get next Thursday (7 days)
    let daysUntilThursday = (4 - currentDay + 7) % 7;
    if (daysUntilThursday === 0) {
      daysUntilThursday = 7; // If today is Thursday, get next Thursday
    }

    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);

    return nextThursday.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusLabel = (status: StatusType) => {
    const statusLabels: Record<StatusType, string> = {
      SIGNED_UP: "Signed Up",
      INITIAL_INTERVIEW_COMPLETED: "Interview Completed",
      ASSESSMENT_COMPLETED: "Assessment Completed",
      DOCS_UPLOADED: "Docs Uploaded",
      SCHEDULED: "Scheduled",
      ONGOING: "Ongoing",
      ARCHIVED: "Archived",
    };
    return statusLabels[status];
  };

  const getStatusColor = (status: StatusType) => {
    const statusColors: Record<StatusType, string> = {
      SIGNED_UP: "#3b82f6",
      INITIAL_INTERVIEW_COMPLETED: "#f59e0b",
      ASSESSMENT_COMPLETED: "#8b5cf6",
      DOCS_UPLOADED: "#06b6d4",
      SCHEDULED: "#10b981",
      ONGOING: "#84cc16",
      ARCHIVED: "#6b7280",
    };
    return statusColors[status] || "#6b7280";
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4" style={{ color: "var(--text-secondary)" }}>
            Loading scheduled clients...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div
          className="card p-6 text-center max-w-md"
          style={{ background: "var(--bg-card)" }}
        >
          <div className="text-red-400 text-4xl mb-4">⚠️</div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Error Loading Clients
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>{error}</p>
          <Button
            onClick={fetchScheduledClients}
            className="mt-4 bg-brand-green hover:bg-brand-green/90 border-brand-green"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header - Compact & Sleek */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600/50">
            <div className="flex items-center justify-between">
              {/* Left Side - Title & Stats */}
              <div className="flex items-center space-x-6">
                <div>
                  <h1
                    className="text-xl font-bold leading-tight"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Thursday Group Coaching Call
                  </h1>
                  <p
                    className="text-sm opacity-75 leading-tight"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Scheduled Clients Report
                  </p>
                </div>

                {/* Inline Stats */}
                <div className="flex items-center space-x-1 bg-brand-green/20 rounded-lg px-3 py-2 border border-brand-green/30">
                  <Users className="w-4 h-4 text-brand-green" />
                  <span className="text-lg font-bold text-white">
                    {clients.length}
                  </span>
                  <span className="text-xs text-gray-300">clients</span>
                </div>
              </div>

              {/* Right Side - Compact Date */}
              <div className="flex items-center space-x-2 bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600">
                <Calendar className="w-4 h-4 text-brand-green" />
                <div className="text-right">
                  <p className="text-xs text-gray-400 leading-tight">
                    Next Call
                  </p>
                  <p className="text-sm font-medium text-white leading-tight">
                    {getNextThursday()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Tabs Layout */}
        {clients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2 text-white">
                No Scheduled Clients
              </h3>
              <p className="text-gray-400">
                There are no clients with "Scheduled" status for this week's
                coaching call.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            {/* Client Tabs Navigation */}
            <div className="bg-gray-700 border-b border-gray-600">
              <nav
                className="flex space-x-1 p-2 overflow-x-auto"
                aria-label="Client Tabs"
              >
                {/* Clean client cards - no initials or badges */}
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setActiveClientTab(client.id)}
                    className={`${
                      activeClientTab === client.id
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white"
                    } px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center justify-center min-w-0`}
                  >
                    <div className="flex flex-col items-center min-w-0">
                      <span className="truncate font-semibold">
                        {client.firstName} {client.lastName}
                      </span>
                      <span className="text-xs opacity-75">
                        {client.dateOfBirth
                          ? `Age ${calculateAge(client.dateOfBirth)}`
                          : "No age"}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Active Client Content */}
            {clients.map(
              (client) =>
                activeClientTab === client.id && (
                  <div key={client.id} className="p-6">
                    {/* Client Header - Compact */}
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                            {client.firstName[0]}
                            {client.lastName[0]}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">
                              {client.firstName} {client.lastName}
                            </h2>
                            <div className="flex items-center space-x-4 text-gray-300 text-sm">
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {client.email}
                              </span>
                              {client.phone && (
                                <span className="flex items-center">
                                  <Phone className="w-3 h-3 mr-1" />
                                  {formatPhoneNumber(client.phone)}
                                </span>
                              )}
                              {client.dateOfBirth && (
                                <span>
                                  Age: {calculateAge(client.dateOfBirth)}
                                </span>
                              )}
                              {client.gender && (
                                <span>
                                  {client.gender === "M" ||
                                  client.gender === "male" ||
                                  client.gender === "Male"
                                    ? "♂ Male"
                                    : "♀ Female"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              background: `${getStatusColor(
                                client.status as StatusType
                              )}20`,
                              color: getStatusColor(
                                client.status as StatusType
                              ),
                            }}
                          >
                            {getStatusLabel(client.status as StatusType)}
                          </span>
                          <div className="text-xs text-gray-400 mt-1">
                            Client since: {formatDate(client.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Two-Column Content Layout - Notes and Documents */}
                    <div className="grid grid-cols-2 gap-6 h-[calc(100vh-400px)]">
                      {/* Left Column - Notes */}
                      <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden flex flex-col">
                        <div className="bg-gray-600 px-4 py-3 border-b border-gray-500">
                          <h3 className="font-semibold text-white flex items-center justify-between">
                            <div className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                              Notes
                            </div>
                            {loadingNotes.has(client.id) && (
                              <span className="text-xs text-gray-300">
                                Loading...
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto">
                          {clientNotes[client.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {clientNotes[client.id].map((note) => (
                                <div
                                  key={note.id}
                                  onClick={() => handleViewNote(note, client)}
                                  className="p-3 rounded-lg bg-gray-600 border border-gray-500 hover:bg-gray-500 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-white text-sm">
                                      {note.title}
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{
                                          background:
                                            note.noteType === "INTERVIEW"
                                              ? "#3b82f620"
                                              : "#f59e0b20",
                                          color:
                                            note.noteType === "INTERVIEW"
                                              ? "#3b82f6"
                                              : "#f59e0b",
                                        }}
                                      >
                                        {note.noteType === "INTERVIEW"
                                          ? "Interview"
                                          : "Coaching"}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        {formatDate(note.createdAt)}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-xs line-clamp-2">
                                    {note.generalNotes}
                                  </p>
                                  <div className="flex space-x-1 mt-2">
                                    {note.isImportant && (
                                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                                        Important
                                      </span>
                                    )}
                                    {note.followUpNeeded && (
                                      <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                        Follow Up
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                              <p className="text-gray-400">
                                No notes available
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Documents */}
                      <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
                        <div className="bg-gray-600 px-4 py-3 border-b border-gray-500">
                          <h3 className="font-semibold text-white flex items-center justify-between">
                            <div className="flex items-center">
                              <FolderOpen className="w-4 h-4 mr-2 text-purple-400" />
                              Documents
                            </div>
                            {loadingDocuments.has(client.id) && (
                              <span className="text-xs text-gray-300">
                                Loading...
                              </span>
                            )}
                          </h3>
                        </div>
                        <div className="p-4 h-full overflow-y-auto">
                          {clientDocuments[client.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {clientDocuments[client.id].map((document) => (
                                <div
                                  key={document.id}
                                  onClick={() => handleViewDocument(document)}
                                  className="p-3 rounded-lg bg-gray-600 border border-gray-500 hover:bg-gray-500 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                                      <FileText className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                      <p className="text-white text-xs font-medium truncate">
                                        {document.fileName}
                                      </p>
                                    </div>
                                    <Eye className="w-5 h-5 text-gray-400" />
                                  </div>
                                  <div className="flex items-center justify-between text-xs">
                                    <span
                                      className="px-2 py-0.5 rounded-full"
                                      style={{
                                        background: "#8b5cf620",
                                        color: "#8b5cf6",
                                      }}
                                    >
                                      {document.documentType}
                                    </span>
                                    <span className="text-gray-400">
                                      {(document.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {formatDate(document.uploadedAt)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-16">
                              <FolderOpen className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                              <p className="text-gray-400 text-sm">
                                No documents
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        )}

        {/* Print-friendly footer */}
        <div className="mt-8 text-center print:block">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Generated on {getCurrentDate()} • DestinationHealth Coaching Report
          </p>
        </div>
      </div>

      {/* Modals */}
      {isNoteViewerOpen && viewingNote && viewingClient && (
        <NoteViewerModal
          note={viewingNote}
          client={viewingClient}
          isOpen={isNoteViewerOpen}
          onClose={() => {
            setIsNoteViewerOpen(false);
            setViewingNote(null);
            setViewingClient(null);
          }}
          onEdit={() => {
            // Could add edit functionality here if needed
          }}
        />
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
    </div>
  );
}
