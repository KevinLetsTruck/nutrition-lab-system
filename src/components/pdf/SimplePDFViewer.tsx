"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, ExternalLink } from "lucide-react";

export interface Document {
  id: string;
  name: string;
  url: string;
  type: "lab_report" | "protocol" | "assessment" | "intake" | "other";
  uploadedDate: Date;
  pages?: number;
  clientId: string;
}

interface SimplePDFViewerProps {
  document: Document;
  onClose: () => void;
  allowDownload?: boolean;
}

const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({
  document,
  onClose,
  allowDownload = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before creating portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle escape key to close and prevent body scroll
  useEffect(() => {
    if (!isMounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Prevent background scrolling
    if (window.document?.body) {
      window.document.body.style.overflow = "hidden";
    }

    // Focus the modal when it opens
    if (modalRef.current) {
      modalRef.current.focus();
    }

    window.document.addEventListener("keydown", handleKeyDown);

    return () => {
      // Restore scrolling when modal closes
      if (window.document?.body) {
        window.document.body.style.overflow = "unset";
      }
      window.document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isMounted]);

  const handleDownload = () => {
    const link = window.document.createElement("a");
    link.href = document.url;
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(document.url, "_blank");
  };

  // Don't render on server-side or before component is mounted
  if (typeof window === "undefined" || !isMounted) {
    return null;
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        // Close if clicking on the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full h-full max-w-7xl max-h-[95vh] bg-card border border-border shadow-2xl overflow-hidden flex flex-col rounded-lg focus:outline-none"
        style={{ minHeight: "400px", maxHeight: "95vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-card border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {document.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {document.type.replace("_", " ").toUpperCase()} •{" "}
              {document.pages ? `${document.pages} pages` : "PDF Document"}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4 shrink-0">
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Open in New Tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 bg-muted/20 min-h-0 overflow-hidden">
          <iframe
            src={`${document.url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH&zoom=page-width`}
            className="w-full h-full border-0 rounded-none"
            title={document.name}
            style={{
              minHeight: "300px",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Fallback message */}
        <div className="px-6 py-3 bg-muted/30 border-t border-border shrink-0">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">
              Can't see the document clearly?
            </strong>{" "}
            Try{" "}
            <button
              onClick={handleDownload}
              className="text-primary hover:text-primary/80 underline hover:no-underline font-medium"
            >
              downloading it
            </button>{" "}
            or{" "}
            <button
              onClick={handleOpenInNewTab}
              className="text-primary hover:text-primary/80 underline hover:no-underline font-medium"
            >
              opening in a new tab
            </button>{" "}
            • Press{" "}
            <kbd className="px-1 py-0.5 bg-muted text-xs rounded">Esc</kbd> to
            close
          </p>
        </div>
      </div>
    </div>
  );

  // Ensure document.body is available before creating portal
  if (!window.document?.body) {
    return null;
  }
  return createPortal(modalContent, window.document.body);
};

export default SimplePDFViewer;
