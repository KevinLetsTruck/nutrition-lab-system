"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Menu,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
} from "lucide-react";
import dynamic from "next/dynamic";

// Define the Document interface locally to avoid import issues
export interface Document {
  id: string;
  name: string;
  url: string;
  type: "lab_report" | "protocol" | "assessment" | "intake" | "other";
  uploadedDate: Date;
  pages?: number;
  clientId: string;
}

// Dynamically import PDFViewerModal with SSR disabled to prevent canvas module issues
const PDFViewerModal = dynamic(() => import("./PDFViewerModal"), {
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
});

interface MobilePDFViewerProps {
  document: Document;
  onClose: () => void;
  allowDownload?: boolean;
  allowShare?: boolean;
}

export const MobilePDFViewer: React.FC<MobilePDFViewerProps> = ({
  document,
  onClose,
  allowDownload = true,
  allowShare = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isMobile) {
    return (
      <PDFViewerModal
        document={document}
        onClose={onClose}
        allowDownload={allowDownload}
        allowShare={allowShare}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-slate-300" />
          </button>

          <div className="flex-1 mx-4 min-w-0">
            <h2 className="text-lg font-semibold text-slate-100 truncate">
              {document.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(document.uploadedDate).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {allowShare && (
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-all">
                <Share2 className="w-5 h-5 text-slate-300" />
              </button>
            )}
            {allowDownload && (
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-all">
                <Download className="w-5 h-5 text-slate-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 relative">
        <PDFViewerModal
          document={document}
          onClose={onClose}
          allowDownload={allowDownload}
          allowShare={allowShare}
        />
      </div>
    </div>
  );
};

export default MobilePDFViewer;
