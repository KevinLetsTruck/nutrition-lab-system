"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Download, Eye, Calendar, User } from "lucide-react";

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/documents", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch documents");
        }

        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLabTypeLabel = (labType: string) => {
    const labels: Record<string, string> = {
      nutriq: "NutriQ",
      labcorp: "LabCorp",
      quest: "Quest",
      dutch: "DUTCH",
      kbmo: "KBMO",
    };
    return labels[labType] || labType;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <Link
                href="/dashboard/documents/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Upload Document
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No documents uploaded yet</p>
            <Link
              href="/dashboard/documents/upload"
              className="text-blue-600 hover:text-blue-700"
            >
              Upload your first document
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-10 w-10 text-gray-400 mr-4" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {doc.fileName}
                          </p>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            {doc.client.firstName} {doc.client.lastName}
                            <span className="mx-2">•</span>
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                            <span className="mx-2">•</span>
                            {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          {doc.labType && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                              {getLabTypeLabel(doc.labType)}
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              doc.status
                            )}`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {doc.aiAnalysis && (
                            <button
                              className="text-green-600 hover:text-green-700"
                              title="View AI Analysis"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            className="text-gray-600 hover:text-gray-700"
                            title="Download"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {doc.aiAnalysis && (
                      <div className="mt-3 p-3 bg-green-50 rounded-md">
                        <p className="text-sm text-green-800">
                          <strong>AI Analysis:</strong> {doc.aiAnalysis.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
