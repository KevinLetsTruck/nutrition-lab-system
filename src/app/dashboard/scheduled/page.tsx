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

// Dynamically import PDFViewerModal with SSR disabled to prevent canvas module issues
const PDFViewerModal = dynamic(
  () => import("@/components/pdf/PDFViewerModal"),
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

interface PDFDocument {
  id: string;
  name: string;
  url: string;
  type: "lab_report" | "protocol" | "assessment" | "intake" | "other";
  uploadedDate: Date;
  pages?: number;
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
  const [viewingDocument, setViewingDocument] = useState<PDFDocument | null>(
    null
  );
  const [isNoteViewerOpen, setIsNoteViewerOpen] = useState(false);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);

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
  const handleViewNote = (note: Note) => {
    setViewingNote(note);
    setIsNoteViewerOpen(true);
  };

  const handleViewDocument = (document: ClientDocument) => {
    // Temporarily disabled - PDF viewer causing issues

    alert(
      `Document viewing is temporarily disabled. Document: ${document.fileName}`
    );

    /* // Convert ClientDocument to PDFDocument format
    const pdfDocument: PDFDocument = {
      id: document.id,
      name: document.fileName,
      url: document.fileUrl,
      type: document.documentType as
        | "lab_report"
        | "protocol"
        | "assessment"
        | "intake"
        | "other",
      uploadedDate: new Date(document.uploadedAt),
      clientId: "", // This will be filled from the client context
    };
    setViewingDocument(pdfDocument);
    setIsPDFViewerOpen(true); */
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Thursday Group Coaching Call
              </h1>
              <p
                className="text-lg mt-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Scheduled Clients Report
              </p>
            </div>

            {/* Date Display */}
            <Card className="border-brand-green/30">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-brand-green" />
                <p className="text-xs text-gray-400 mb-1">Next Coaching Call</p>
                <p className="text-sm font-medium text-white">
                  {getNextThursday()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="flex justify-start mb-6">
            <Card className="border-brand-green/30">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Users className="w-8 h-8 mr-3 text-brand-green" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {clients.length}
                    </p>
                    <p className="text-sm text-gray-400">Scheduled Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Client List */}
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
          <div className="space-y-4">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="hover:shadow-xl transition-all duration-300 border-2 border-brand-green/50 relative overflow-hidden"
              >
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-green via-green-500 to-brand-green" />

                <CardContent className="p-6">
                  {/* Client Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                        style={{ background: "var(--primary-green-light)" }}
                      >
                        <span
                          className="text-lg font-bold"
                          style={{ color: "var(--primary-green)" }}
                        >
                          {client.firstName[0]}
                          {client.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h2
                          className="text-xl font-bold mb-1"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {client.firstName} {client.lastName}
                        </h2>
                        <div className="flex items-center space-x-4 text-sm">
                          {client.dateOfBirth && (
                            <span style={{ color: "var(--text-secondary)" }}>
                              Age: {calculateAge(client.dateOfBirth)}
                              {client.gender && (
                                <span
                                  className="ml-2 text-xs px-2 py-1 rounded-full"
                                  style={{
                                    background:
                                      client.gender === "male"
                                        ? "rgba(59, 130, 246, 0.2)"
                                        : "rgba(236, 72, 153, 0.2)",
                                    color:
                                      client.gender === "male"
                                        ? "#3b82f6"
                                        : "#ec4899",
                                  }}
                                >
                                  {client.gender === "male" ? "M" : "F"}
                                </span>
                              )}
                            </span>
                          )}
                          <div className="flex items-center">
                            <Mail
                              className="w-4 h-4 mr-2"
                              style={{ color: "var(--text-secondary)" }}
                            />
                            <span style={{ color: "var(--text-primary)" }}>
                              {client.email}
                            </span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center">
                              <Phone
                                className="w-4 h-4 mr-2"
                                style={{ color: "var(--text-secondary)" }}
                              />
                              <span style={{ color: "var(--text-primary)" }}>
                                {formatPhoneNumber(client.phone)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: `${getStatusColor(
                            client.status as StatusType
                          )}20`,
                          color: getStatusColor(client.status as StatusType),
                        }}
                      >
                        {getStatusLabel(client.status as StatusType)}
                      </span>
                      <div
                        className="text-right text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <div>Client since: {formatDate(client.createdAt)}</div>
                        {client.lastVisit && (
                          <div>Last visit: {formatDate(client.lastVisit)}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Health Goals - Left Column */}
                    <div className="lg:col-span-1">
                      <div className="flex items-center mb-3">
                        <Target
                          className="w-5 h-5 mr-2"
                          style={{ color: "#10b981" }}
                        />
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Health Goals
                        </h3>
                      </div>
                      {client.healthGoals && client.healthGoals.length > 0 ? (
                        <div className="space-y-3">
                          {client.healthGoals.map((goal, index) => (
                            <div
                              key={index}
                              className="p-4 rounded-lg"
                              style={{
                                background: "var(--bg-secondary)",
                                border: "1px solid var(--border-primary)",
                              }}
                            >
                              <p style={{ color: "var(--text-primary)" }}>
                                {goal}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="p-6 rounded-lg text-center"
                          style={{
                            background: "var(--bg-secondary)",
                            border: "1px solid var(--border-primary)",
                          }}
                        >
                          <p style={{ color: "var(--text-secondary)" }}>
                            No health goals recorded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Notes and Documents Section - Right Two Columns Side by Side */}
                    <div className="lg:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Notes Section */}
                        <div>
                          <div className="flex items-center mb-3">
                            <MessageSquare
                              className="w-5 h-5 mr-2"
                              style={{ color: "#3b82f6" }}
                            />
                            <h3
                              className="text-lg font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              Notes
                            </h3>
                            {loadingNotes.has(client.id) && (
                              <div
                                className="ml-3 text-sm"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                Loading...
                              </div>
                            )}
                          </div>

                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {clientNotes[client.id]?.length > 0 ? (
                              clientNotes[client.id].map((note) => (
                                <div
                                  key={note.id}
                                  onClick={() => handleViewNote(note)}
                                  className="p-4 rounded-xl cursor-pointer hover:bg-gray-800/50 transition-all bg-gray-900/50 border border-gray-700"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4
                                      className="font-medium"
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {note.title}
                                    </h4>
                                    <span
                                      className="text-xs px-2 py-1 rounded-full"
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
                                  </div>
                                  <p
                                    className="text-sm line-clamp-3"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    {note.generalNotes}
                                  </p>
                                  <div
                                    className="flex items-center justify-between mt-2 text-xs"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    <span>{formatDate(note.createdAt)}</span>
                                    <div className="flex space-x-2">
                                      {note.isImportant && (
                                        <span className="px-1 py-0.5 bg-red-100 text-red-600 rounded">
                                          Important
                                        </span>
                                      )}
                                      {note.followUpNeeded && (
                                        <span className="px-1 py-0.5 bg-yellow-100 text-yellow-600 rounded">
                                          Follow Up
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : clientNotes[client.id] !== undefined ? (
                              <div
                                className="p-6 rounded-lg text-center"
                                style={{
                                  background: "var(--bg-secondary)",
                                  border: "1px solid var(--border-primary)",
                                }}
                              >
                                <MessageSquare
                                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                                  style={{ color: "var(--text-secondary)" }}
                                />
                                <p style={{ color: "var(--text-secondary)" }}>
                                  No notes available
                                </p>
                              </div>
                            ) : (
                              <div
                                className="p-6 rounded-lg text-center animate-pulse"
                                style={{
                                  background: "var(--bg-secondary)",
                                  border: "1px solid var(--border-primary)",
                                }}
                              >
                                <p style={{ color: "var(--text-secondary)" }}>
                                  Loading notes...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Documents Section */}
                        <div>
                          <div className="flex items-center mb-3">
                            <FolderOpen
                              className="w-5 h-5 mr-2"
                              style={{ color: "#8b5cf6" }}
                            />
                            <h3
                              className="text-lg font-semibold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              Documents
                            </h3>
                            {loadingDocuments.has(client.id) && (
                              <div
                                className="ml-3 text-sm"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                Loading...
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {clientDocuments[client.id]?.length > 0 ? (
                              clientDocuments[client.id].map((document) => (
                                <div
                                  key={document.id}
                                  onClick={() => handleViewDocument(document)}
                                  className="p-3 rounded-xl cursor-pointer hover:bg-gray-800/50 transition-all bg-gray-900/50 border border-gray-700"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h4
                                      className="font-medium truncate"
                                      style={{ color: "var(--text-primary)" }}
                                    >
                                      {document.fileName}
                                    </h4>
                                    <Eye
                                      className="w-4 h-4"
                                      style={{ color: "var(--text-secondary)" }}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span
                                      className="px-2 py-1 rounded-full"
                                      style={{
                                        background: "#8b5cf620",
                                        color: "#8b5cf6",
                                      }}
                                    >
                                      {document.documentType}
                                    </span>
                                    <span
                                      style={{ color: "var(--text-secondary)" }}
                                    >
                                      {(document.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                  </div>
                                  <div
                                    className="mt-2 text-xs"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    Uploaded: {formatDate(document.uploadedAt)}
                                  </div>
                                </div>
                              ))
                            ) : clientDocuments[client.id] !== undefined ? (
                              <div
                                className="p-6 rounded-lg text-center"
                                style={{
                                  background: "var(--bg-secondary)",
                                  border: "1px solid var(--border-primary)",
                                }}
                              >
                                <FolderOpen
                                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                                  style={{ color: "var(--text-secondary)" }}
                                />
                                <p style={{ color: "var(--text-secondary)" }}>
                                  No documents available
                                </p>
                              </div>
                            ) : (
                              <div
                                className="p-6 rounded-lg text-center animate-pulse"
                                style={{
                                  background: "var(--bg-secondary)",
                                  border: "1px solid var(--border-primary)",
                                }}
                              >
                                <p style={{ color: "var(--text-secondary)" }}>
                                  Loading documents...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
      {isNoteViewerOpen && viewingNote && (
        <NoteViewerModal
          note={viewingNote}
          isOpen={isNoteViewerOpen}
          onClose={() => {
            setIsNoteViewerOpen(false);
            setViewingNote(null);
          }}
          onEdit={() => {
            // Could add edit functionality here if needed
          }}
        />
      )}

      {/* Temporarily disable PDF viewer to debug
      {isPDFViewerOpen && viewingDocument && (
        <PDFViewerModal
          document={viewingDocument}
          onClose={() => {
            setIsPDFViewerOpen(false);
            setViewingDocument(null);
          }}
        />
      )} */}
    </div>
  );
}
