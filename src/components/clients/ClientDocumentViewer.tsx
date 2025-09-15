"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Download,
  Upload,
  ClipboardList,
  FileCheck,
  UserCheck,
  Calendar,
  HardDrive,
  Filter,
  Search,
  Grid,
  List,
  Trash2,
  FileEdit,
  RefreshCw,
  Play,
} from "lucide-react";
// Use SimplePDFViewer to avoid canvas/PDF.js issues
import SimplePDFViewer from "../pdf/SimplePDFViewer";

interface ClientDocument {
  id: string;
  fileName: string;
  documentType: "lab_report" | "protocol" | "assessment" | "intake" | "other";
  labType?: string;
  fileSize: number;
  uploadedAt: string;
  status: "uploaded" | "processing" | "completed" | "failed"; // Updated to match database schema
  fileUrl?: string; // This is what comes from the database
  url?: string; // Legacy field for compatibility
  aiAnalysis?: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
  };
  pages?: number;
}

interface ClientDocumentViewerProps {
  clientId: string;
  documents: ClientDocument[];
  onRefresh?: () => void;
  onDelete?: (documentId: string) => void;
  compact?: boolean;
}

const documentCategories = {
  lab_report: {
    icon: FileText,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20",
    label: "Lab Report",
    description: "Blood work, biomarkers, and lab analysis",
  },
  protocol: {
    icon: ClipboardList,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20",
    label: "Protocol",
    description: "Treatment plans and recommendations",
  },
  assessment: {
    icon: FileCheck,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/20",
    label: "Assessment",
    description: "Health assessments and evaluations",
  },
  intake: {
    icon: UserCheck,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/20",
    label: "Intake Form",
    description: "Initial client information and history",
  },
  other: {
    icon: FileText,
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
    borderColor: "border-slate-400/20",
    label: "Other",
    description: "Miscellaneous documents",
  },
};

const statusConfig = {
  uploaded: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    label: "Uploaded",
  },
  pending: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    label: "Pending",
  },
  processing: {
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    label: "Processing",
  },
  completed: {
    color: "text-green-400",
    bg: "bg-green-400/10",
    label: "Completed",
  },
  failed: {
    color: "text-red-400",
    bg: "bg-red-400/10",
    label: "Failed",
  },
  error: {
    color: "text-red-400",
    bg: "bg-red-400/10",
    label: "Error",
  },
};

export const ClientDocumentViewer: React.FC<ClientDocumentViewerProps> = ({
  clientId,
  documents,
  onRefresh,
  onDelete,
  compact = false, // Add compact prop
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    name: string;
    url: string;
    type: "lab_report" | "protocol" | "assessment" | "intake" | "other";
    uploadedDate: Date;
    pages?: number;
    clientId: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "name" | "type" | "size">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // Delete confirmation modal is now handled by parent component

  // Debug component lifecycle
  React.useEffect(() => {
    return () => {};
  }, [clientId]);

  // Delete state debugging removed - now handled by parent

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.labType &&
          doc.labType.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType =
        filterType === "all" || doc.documentType === filterType;
      const matchesStatus =
        filterStatus === "all" || doc.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        case "name":
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case "type":
          aValue = a.documentType;
          bValue = b.documentType;
          break;
        case "size":
          aValue = a.fileSize;
          bValue = b.fileSize;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleDocumentClick = (doc: ClientDocument) => {
    // Check if document has a URL (use fileUrl)
    let documentUrl = doc.fileUrl;

    // If no URL but we have the document, try to construct one
    if (!documentUrl) {
      // For local development, assume documents are served from /uploads
      documentUrl = `/uploads/${doc.fileName}`;
    }

    if (documentUrl) {
      setSelectedDocument({
        id: doc.id,
        name: doc.fileName,
        url: documentUrl,
        type: doc.documentType,
        uploadedDate: new Date(doc.uploadedAt),
        pages: doc.pages,
        clientId: clientId,
      });
      setViewerOpen(true);
    } else {
      alert(
        "Document file not available. Please check if the file was uploaded correctly."
      );
    }
  };

  const handleReclassify = async (documentId: string) => {
    setReclassifyingId(documentId);

    try {
      const response = await fetch(
        `/api/medical/documents/${documentId}/reclassify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        const result = await response.json();

        // Refresh the documents list
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error("Failed to reclassify document");
      }
    } catch (error) {
      console.error("Error reclassifying document:", error);
    } finally {
      setReclassifyingId(null);
    }
  };

  const handleProcess = async (documentId: string) => {
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch("/api/medical/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          forceReprocess: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process document");
      }

      const result = await response.json();

      alert("Document processing started. This may take a few minutes.");

      // Refresh the documents list
      if (onRefresh) {
        setTimeout(onRefresh, 2000); // Refresh after 2 seconds
      }
    } catch (error) {
      console.error("Processing error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to process document"
      );
    }
  };

  const handleDeleteClick = (doc: ClientDocument) => {
    if (onDelete) {
      onDelete(doc.id);
    } else {
      console.error("❌ No onDelete handler provided");
    }
  };

  // handleDeleteConfirm is now handled by parent component

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    // Use consistent locale to avoid hydration mismatch
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC", // Use UTC to ensure consistency between server and client
    });
  };

  const getDocumentTypeStats = () => {
    const stats: Record<string, number> = {};
    documents.forEach((doc) => {
      stats[doc.documentType] = (stats[doc.documentType] || 0) + 1;
    });
    return stats;
  };

  const documentStats = getDocumentTypeStats();

  // Compact view for client detail page
  if (compact) {
    return (
      <div className="space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs mb-2 text-muted-foreground">
              No documents uploaded yet
            </p>
          </div>
        ) : (
          documents.slice(0, 6).map((doc) => {
            const category =
              documentCategories[doc.documentType] || documentCategories.other;
            const Icon = category.icon;

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 rounded text-xs border border-border bg-secondary hover:border-opacity-75 transition-colors cursor-pointer"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Icon className="w-3 h-3 flex-shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-foreground">
                      {doc.fileName}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                        {category.label}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDate(doc.uploadedAt)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDocumentClick(doc);
                    }}
                    className="p-2 hover:bg-gray-600 rounded transition-colors text-blue-400 hover:text-blue-300 border border-blue-400"
                    title="View Document"
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      minWidth: "32px",
                      minHeight: "32px",
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {(doc.status === "uploaded" || doc.status === "pending") && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcess(doc.id);
                      }}
                      className="p-1 hover:bg-opacity-20 rounded transition-colors"
                      title="Process Document"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  )}
                  {(doc.documentType === "assessment" ||
                    doc.fileName?.toLowerCase().includes("naq") ||
                    doc.fileName?.toLowerCase().includes("symptom")) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Assessment entry removed
                      }}
                      className="p-1 hover:bg-opacity-20 rounded transition-colors"
                      title="Manual Data Entry"
                    >
                      <FileEdit className="w-3 h-3" />
                    </button>
                  )}
                  {doc.status === "completed" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReclassify(doc.id);
                      }}
                      className="p-1 hover:bg-opacity-20 rounded transition-colors"
                      title="Reclassify Document"
                      disabled={reclassifyingId === doc.id}
                    >
                      {reclassifyingId === doc.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3" />
                      )}
                    </button>
                  )}
                  {(doc.fileUrl || doc.url) && (
                    <a
                      href={doc.fileUrl || doc.url}
                      download={doc.fileName}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 hover:bg-opacity-20 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(doc);
                      }}
                      className="p-2 hover:bg-red-100 rounded transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        {documents.length > 6 && (
          <div className="text-center py-1">
            <span className="text-xs text-muted-foreground">
              +{documents.length - 6} more documents
            </span>
          </div>
        )}

        {/* PDF Viewer Modal for compact view */}
        {selectedDocument && (
          <SimplePDFViewer
            document={selectedDocument}
            onClose={() => {
              setViewerOpen(false);
              setSelectedDocument(null);
            }}
            allowDownload={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Documents ({documents.length})
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view client documents, lab reports, and protocols
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            title="Refresh"
          >
            <Search className="w-4 h-4" />
          </button>
          <Link
            href={`/dashboard/documents/upload?clientId=${clientId}`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New
          </Link>
        </div>
      </div>

      {/* Document Type Overview */}
      {documents.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(documentCategories).map(([type, config]) => {
            const count = documentStats[type] || 0;
            if (count === 0) return null;

            const Icon = config.icon;
            return (
              <div
                key={type}
                className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 cursor-pointer hover:scale-105 transition-all`}
                onClick={() => setFilterType(type)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {config.label}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            {Object.entries(documentCategories).map(([type, config]) => (
              <option key={type} value={type}>
                {config.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="error">Error</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              setSortBy(sort as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document List/Grid */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No documents found
          </h3>
          <p className="text-gray-500 mb-4">
            {documents.length === 0
              ? "No documents have been uploaded yet"
              : "Try adjusting your search or filter criteria"}
          </p>
          <Link
            href={`/dashboard/documents/upload?clientId=${clientId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload First Document
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedDocuments.map((doc) => {
            const category =
              documentCategories[doc.documentType] || documentCategories.other; // Fallback to 'other' if type not found
            const status = statusConfig[doc.status] || statusConfig.uploaded; // Fallback to uploaded if status not found
            const Icon = category.icon;

            return (
              <div
                key={doc.id}
                className={`${category.bgColor} ${category.borderColor} border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group`}
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-6 h-6 ${category.color}`} />
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color} font-medium`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentClick(doc);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    {(doc.status === "uploaded" ||
                      doc.status === "pending") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProcess(doc.id);
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                        title="Process Document"
                      >
                        <Play className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {(doc.documentType === "assessment" ||
                      doc.fileName?.toLowerCase().includes("naq") ||
                      doc.fileName?.toLowerCase().includes("symptom")) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Assessment entry removed
                        }}
                        className="p-1 hover:bg-white/20 rounded"
                        title="Manual Data Entry"
                      >
                        <FileEdit className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {(doc.fileUrl || doc.url) && (
                      <a
                        href={doc.fileUrl || doc.url}
                        download={doc.fileName}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-white/20 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </a>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(doc);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {doc.fileName}
                </h3>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${category.bg} ${category.color}`}
                    >
                      {category.label}
                    </span>
                    {doc.labType && (
                      <span className="text-xs text-gray-500">
                        {doc.labType}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">
                        {formatDate(doc.uploadedAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      <span className="text-xs">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </div>
                  </div>
                </div>

                {doc.aiAnalysis && (
                  <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-xs text-green-800 font-medium mb-1">
                      AI Analysis Available
                    </p>
                    <p className="text-xs text-green-700 line-clamp-2">
                      {doc.aiAnalysis.summary}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedDocuments.map((doc) => {
            const category =
              documentCategories[doc.documentType] || documentCategories.other; // Fallback to 'other' if type not found
            const status = statusConfig[doc.status] || statusConfig.uploaded; // Fallback to uploaded if status not found
            const Icon = category.icon;

            return (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer group transition-all"
                onClick={() => handleDocumentClick(doc)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon
                      className={`w-6 h-6 ${category.color} flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {doc.fileName}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${category.bg} ${category.color}`}
                        >
                          {category.label}
                        </span>
                        {doc.labType && <span>{doc.labType}</span>}
                        <span>{formatDate(doc.uploadedAt)}</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentClick(doc);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="View Document"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    {(doc.status === "uploaded" ||
                      doc.status === "pending") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProcess(doc.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Process Document"
                      >
                        <Play className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {(doc.documentType === "assessment" ||
                      doc.fileName?.toLowerCase().includes("naq") ||
                      doc.fileName?.toLowerCase().includes("symptom")) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Assessment entry removed
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Manual Data Entry"
                      >
                        <FileEdit className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                    {(doc.fileUrl || doc.url) && (
                      <a
                        href={doc.fileUrl || doc.url}
                        download={doc.fileName}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </a>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(doc);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>

                {doc.aiAnalysis && (
                  <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                    <p className="text-xs text-green-800 font-medium mb-1">
                      <strong>AI Analysis:</strong> {doc.aiAnalysis.summary}
                    </p>
                    {doc.aiAnalysis.keyFindings.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-green-700 font-medium">
                          Key Findings:
                        </p>
                        <ul className="text-xs text-green-700 mt-1 space-y-1">
                          {doc.aiAnalysis.keyFindings
                            .slice(0, 3)
                            .map((finding, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-1"
                              >
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Robust PDF Viewer */}
      {selectedDocument && (
        <SimplePDFViewer
          document={selectedDocument}
          onClose={() => {
            setViewerOpen(false);
            setSelectedDocument(null);
          }}
          allowDownload={true}
        />
      )}

      {/* Delete confirmation modal is now handled by parent component */}
    </div>
  );
};

export default ClientDocumentViewer;
