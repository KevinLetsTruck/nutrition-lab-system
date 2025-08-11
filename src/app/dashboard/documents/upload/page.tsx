"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function DocumentUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const [documentType, setDocumentType] = useState("lab_report");
  const [labType, setLabType] = useState("");

  // Fetch clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/clients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch clients");
        }

        const data = await response.json();
        setClients(data);

        // Auto-select client if provided in URL
        const clientIdFromUrl = searchParams.get("clientId");
        if (clientIdFromUrl) {
          setSelectedClient(clientIdFromUrl);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
        setError("Failed to load clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [router, searchParams]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedClient) {
      setError("Please select a client");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Upload each file to the database
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", selectedClient);
        formData.append("documentType", documentType);
        if (labType) formData.append("labType", labType);

        const response = await fetch("/api/documents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }
      }

      // Redirect to documents page
      router.push("/dashboard/documents");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Upload Documents
              </h2>
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Link>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Client Selection */}
            <div>
              <label
                htmlFor="client"
                className="block text-sm font-medium text-gray-700"
              >
                Select Client *
              </label>
              {loading ? (
                <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50">
                  <span className="text-gray-500">Loading clients...</span>
                </div>
              ) : (
                <select
                  id="client"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </option>
                  ))}
                </select>
              )}
              {clients.length === 0 && !loading && (
                <p className="mt-1 text-sm text-red-500">
                  No clients found. Please create a client first from the
                  Clients page.
                </p>
              )}
            </div>

            {/* Document Type */}
            <div>
              <label
                htmlFor="documentType"
                className="block text-sm font-medium text-gray-700"
              >
                Document Type
              </label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="lab_report">Lab Report</option>
                <option value="assessment">Assessment</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Lab Type (if lab report) */}
            {documentType === "lab_report" && (
              <div>
                <label
                  htmlFor="labType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Lab Type
                </label>
                <select
                  id="labType"
                  value={labType}
                  onChange={(e) => setLabType(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select lab type...</option>
                  <option value="nutriq">NutriQ</option>
                  <option value="labcorp">LabCorp</option>
                  <option value="quest">Quest Diagnostics</option>
                  <option value="dutch">DUTCH</option>
                  <option value="kbmo">KBMO</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {isDragActive
                    ? "Drop the files here..."
                    : "Drag & drop files here, or click to select"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, PNG, JPG up to 10MB
                </p>
              </div>
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Selected Files ({files.length})
                </h3>
                <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
                  {files.map((file, index) => (
                    <li
                      key={index}
                      className="pl-3 pr-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {file.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <Link
                href="/dashboard"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : `Upload ${files.length} File${
                      files.length !== 1 ? "s" : ""
                    }`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
