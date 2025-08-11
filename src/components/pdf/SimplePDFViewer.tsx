"use client";

import React, { useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";

interface SimplePDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentName;
      link.click();
    }
  };

  const handleOpenInNewTab = () => {
    if (typeof window !== "undefined") {
      window.open(documentUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {documentName}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden">
          <iframe
            src={documentUrl}
            className="w-full h-full border-0"
            title={documentName}
          />
        </div>
      </div>
    </div>
  );
};

export default SimplePDFViewer;
