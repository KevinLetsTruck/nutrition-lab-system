"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  ChevronRight,
} from "lucide-react";

interface Document {
  id: string;
  fileName: string;
  documentType: string;
  labType?: string;
  status: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${doc.client.firstName} ${doc.client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.documentType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded": return "badge text-blue-400";
      case "processing": return "badge-orange";
      case "completed": return "badge";
      case "failed": return "badge-red";
      default: return "badge";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lab_report": return "🧪";
      case "assessment": return "📋";
      case "protocol": return "📄";
      case "intake": return "📝";
      default: return "📄";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto"></div>
          <p className="text-[#94a3b8] mt-2">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Documents</h1>
          <p className="text-[#94a3b8] mt-1">
            Manage all client documents, lab reports, and assessments
          </p>
        </div>
        <Link
          href="/dashboard/documents/upload"
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Documents
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-[#4ade80] mr-3" />
            <div>
              <p className="text-sm text-[#94a3b8]">Total Documents</p>
              <p className="text-2xl font-bold text-[#f1f5f9]">{documents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🧪</div>
            <div>
              <p className="text-sm text-[#94a3b8]">Lab Reports</p>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {documents.filter(d => d.documentType === "lab_report").length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📋</div>
            <div>
              <p className="text-sm text-[#94a3b8]">Assessments</p>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {documents.filter(d => d.documentType === "assessment").length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="text-2xl mr-3">✅</div>
            <div>
              <p className="text-sm text-[#94a3b8]">Processed</p>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                {documents.filter(d => d.status === "completed").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#f1f5f9] mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search files or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#f1f5f9] mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Statuses</option>
              <option value="uploaded">Uploaded</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#f1f5f9] mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Types</option>
              <option value="lab_report">Lab Reports</option>
              <option value="assessment">Assessments</option>
              <option value="protocol">Protocols</option>
              <option value="intake">Intake Forms</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="card p-0 overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 px-6">
            <FileText className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#f1f5f9] mb-2">
              No documents found
            </h3>
            <p className="text-[#94a3b8] mb-4">
              {documents.length === 0 
                ? "Get started by uploading your first document"
                : "Try adjusting your search or filters"
              }
            </p>
            <Link
              href="/dashboard/documents/upload"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-dark">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#f1f5f9] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-[#334155] transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {getTypeIcon(document.documentType)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#f1f5f9]">
                            {document.fileName}
                          </div>
                          {document.labType && (
                            <div className="text-xs text-[#94a3b8]">
                              {document.labType.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/clients/${document.client.id}`}
                        className="flex items-center text-[#4ade80] hover:text-[#22c55e] transition-colors duration-200"
                      >
                        <User className="w-4 h-4 mr-2" />
                        <div>
                          <div className="text-sm font-medium">
                            {document.client.firstName} {document.client.lastName}
                          </div>
                          <div className="text-xs text-[#94a3b8]">
                            {document.client.email}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-[#f1f5f9] capitalize">
                        {document.documentType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(document.status)}>
                        {document.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#94a3b8]">
                      {formatFileSize(document.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-[#94a3b8]">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(document.uploadedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => window.open(document.fileUrl, "_blank")}
                          className="text-[#4ade80] hover:text-[#22c55e] p-1 transition-colors duration-200"
                          title="View Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={document.fileUrl}
                          download={document.fileName}
                          className="text-[#94a3b8] hover:text-[#f1f5f9] p-1 transition-colors duration-200"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
