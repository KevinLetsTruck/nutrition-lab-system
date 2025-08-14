"use client";

import React from "react";
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
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = document.url;
    link.download = document.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(document.url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="w-full h-full max-w-7xl max-h-screen bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {document.name}
            </h2>
            <p className="text-sm text-gray-500">
              {document.type.replace("_", " ").toUpperCase()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Open in New Tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 bg-gray-100">
          <iframe
            src={`${document.url}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full border-0"
            title={document.name}
            style={{ minHeight: "600px" }}
          />
        </div>

        {/* Fallback message */}
        <div className="p-4 bg-yellow-50 border-t border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> If the PDF doesn't display correctly, you can{" "}
            <button
              onClick={handleDownload}
              className="underline hover:no-underline"
            >
              download it
            </button>{" "}
            or{" "}
            <button
              onClick={handleOpenInNewTab}
              className="underline hover:no-underline"
            >
              open it in a new tab
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimplePDFViewer;
