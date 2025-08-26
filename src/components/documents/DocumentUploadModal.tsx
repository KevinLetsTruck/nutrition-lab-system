"use client";

import { useState } from "react";
import { X, Upload, FileText, Trash2 } from "lucide-react";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  clientId: string;
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onUpload,
  clientId,
}: DocumentUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      await onUpload(selectedFiles);
      // Reset form and close modal
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFiles([]);
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-2xl max-w-lg w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Upload Documents
          </h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Select Documents
            </label>
            <p className="text-xs mb-2 text-muted-foreground">
              Upload client documents for your records
            </p>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center transition-colors hover:border-primary/50 relative">
              <div>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select files or drag and drop
                </p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Supports PDF, JPG, PNG, DOC, DOCX
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                disabled={uploading}
              />
            </div>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">
                Selected Files ({selectedFiles.length})
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded bg-muted"
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="p-1 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedFiles.length === 0 || uploading}
              className="flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading
                ? "Uploading..."
                : `Upload ${
                    selectedFiles.length > 0 ? `(${selectedFiles.length})` : ""
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
