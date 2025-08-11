"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  Edit3,
  Printer,
  Download,
  Maximize2,
  Minimize2,
  X,
  Sidebar,
  RotateCcw,
  Share2,
} from "lucide-react";

interface PDFToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  showSidebar: boolean;
  isFullscreen: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
  allowShare?: boolean;
  allowAnnotations?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetZoom: (scale: number | string) => void;
  onToggleSidebar: () => void;
  onToggleSearch: () => void;
  onToggleAnnotations?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
}

export const PDFToolbar: React.FC<PDFToolbarProps> = ({
  currentPage,
  totalPages,
  scale,
  showSidebar,
  isFullscreen,
  allowDownload = true,
  allowPrint = true,
  allowShare = false,
  allowAnnotations = true,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onZoomIn,
  onZoomOut,
  onSetZoom,
  onToggleSidebar,
  onToggleSearch,
  onToggleAnnotations,
  onDownload,
  onPrint,
  onShare,
  onToggleFullscreen,
  onClose,
}) => {
  const zoomPercentage = Math.round(scale * 100);

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    if (page >= 1 && page <= totalPages) {
      onGoToPage(page);
    }
  };

  const handleZoomSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "fit" || value === "page") {
      onSetZoom(value);
    } else {
      onSetZoom(parseFloat(value));
    }
  };

  return (
    <div className="pdf-toolbar bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
      {/* Left Section - Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={currentPage}
            onChange={handlePageInput}
            min={1}
            max={totalPages}
            className="w-16 bg-slate-900 border border-slate-600 text-slate-100 px-2 py-1 rounded text-center text-sm focus:border-green-400 focus:outline-none"
          />
          <span className="text-slate-300 text-sm">of {totalPages}</span>
        </div>

        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Center Section - Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onZoomOut}
          disabled={scale <= 0.5}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-slate-300" />
        </button>

        <select
          value={scale}
          onChange={handleZoomSelect}
          className="bg-slate-900 border border-slate-600 text-slate-100 px-3 py-1 rounded-lg text-sm focus:border-green-400 focus:outline-none min-w-[120px]"
        >
          <option value="0.5">50%</option>
          <option value="0.75">75%</option>
          <option value="1">100%</option>
          <option value="1.25">125%</option>
          <option value="1.5">150%</option>
          <option value="2">200%</option>
          <option value="3">300%</option>
          <option value="fit">Fit Width</option>
          <option value="page">Fit Page</option>
        </select>

        <span className="text-slate-400 text-sm min-w-[50px]">
          {zoomPercentage}%
        </span>

        <button
          onClick={onZoomIn}
          disabled={scale >= 3}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-slate-300" />
        </button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-all ${
            showSidebar
              ? "bg-green-500 text-slate-900"
              : "hover:bg-slate-700 text-slate-300"
          }`}
          title="Toggle Sidebar"
        >
          <Sidebar className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleSearch}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          title="Search"
        >
          <Search className="w-5 h-5 text-slate-300" />
        </button>

        {allowAnnotations && onToggleAnnotations && (
          <button
            onClick={onToggleAnnotations}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
            title="Annotations"
          >
            <Edit3 className="w-5 h-5 text-slate-300" />
          </button>
        )}

        <div className="w-px h-6 bg-slate-600 mx-1" />

        {allowPrint && onPrint && (
          <button
            onClick={onPrint}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
            title="Print"
          >
            <Printer className="w-5 h-5 text-slate-300" />
          </button>
        )}

        {allowDownload && onDownload && (
          <button
            onClick={onDownload}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
            title="Download"
          >
            <Download className="w-5 h-5 text-slate-300" />
          </button>
        )}

        {allowShare && onShare && (
          <button
            onClick={onShare}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
            title="Share"
          >
            <Share2 className="w-5 h-5 text-slate-300" />
          </button>
        )}

        <div className="w-px h-6 bg-slate-600 mx-1" />

        <button
          onClick={onToggleFullscreen}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-slate-300" />
          ) : (
            <Maximize2 className="w-5 h-5 text-slate-300" />
          )}
        </button>

        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all text-red-400 hover:text-red-300"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PDFToolbar;
