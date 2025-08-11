"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function DocumentUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(clientId || "");
  const [documentType, setDocumentType] = useState("lab_report");
  const [labType, setLabType] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState("");

  // Fetch clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/clients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png"],
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedClientId || files.length === 0) {
      setError("Please select a client and add at least one file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", selectedClientId);
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

      setUploadComplete(true);
      setTimeout(() => {
        if (clientId) {
          router.push(`/dashboard/clients/${clientId}`);
        } else {
          router.push("/dashboard/clients");
        }
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (uploadComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete!</h1>
          <p className="text-gray-600">Your documents have been uploaded successfully.</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to client page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-600 mt-2">
          Upload lab reports, assessments, and other client documents
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h2>

          {/* Client Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!clientId} // Disable if clientId is pre-selected
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.firstName} {client.lastName} ({client.email})
                </option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type *
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lab_report">Lab Report</option>
              <option value="assessment">Assessment</option>
              <option value="protocol">Protocol</option>
              <option value="intake">Intake Form</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Lab Type (conditional) */}
          {documentType === "lab_report" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lab Type
              </label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select lab type...</option>
                <option value="nutriq">NutriQ</option>
                <option value="labcorp">LabCorp</option>
                <option value="quest">Quest</option>
                <option value="dutch">DUTCH</option>
                <option value="kbmo">KBMO</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {/* Upload Action */}
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedClientId || files.length === 0}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Drop Zone */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Files</h2>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, Images, CSV, Excel files
                </p>
              </>
            )}
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Selected Files ({files.length})
              </h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
