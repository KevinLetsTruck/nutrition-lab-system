"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, MessageSquare, FileText, StickyNote } from "lucide-react";
import { Annotation } from "./PDFViewer";

interface PDFSidebarProps {
  pdf: any;
  currentPage: number;
  totalPages: number;
  scale: number;
  activeTab: "thumbnails" | "annotations" | "search";
  annotations: Annotation[];
  searchResults: any[];
  searchTerm: string;
  onTabChange: (tab: "thumbnails" | "annotations" | "search") => void;
  onGoToPage: (page: number) => void;
  onGoToAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  onSearchTermChange: (term: string) => void;
  onPerformSearch: () => void;
  className?: string;
}

interface ThumbnailProps {
  pdf: any;
  pageNumber: number;
  isActive: boolean;
  onClick: () => void;
}

const PDFThumbnail: React.FC<ThumbnailProps> = ({
  pdf,
  pageNumber,
  isActive,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const renderThumbnail = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        setIsLoading(true);
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 0.2 }); // Small scale for thumbnails
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        setIsLoading(false);
      } catch (error) {
        console.error("Error rendering thumbnail:", error);
        setIsLoading(false);
      }
    };

    renderThumbnail();
  }, [pdf, pageNumber]);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:border-slate-500 ${
        isActive
          ? "border-green-400 shadow-lg shadow-green-400/20"
          : "border-slate-600"
      }`}
    >
      <div className="bg-white p-2 relative">
        {isLoading ? (
          <div className="w-full h-32 bg-slate-200 animate-pulse flex items-center justify-center">
            <div className="text-slate-400 text-xs">Loading...</div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-auto max-h-32 object-contain"
          />
        )}
      </div>
      <div className="bg-slate-900 px-2 py-1">
        <span className="text-xs text-slate-400">Page {pageNumber}</span>
      </div>
    </div>
  );
};

export const PDFSidebar: React.FC<PDFSidebarProps> = ({
  pdf,
  currentPage,
  totalPages,
  activeTab,
  annotations,
  searchResults,
  searchTerm,
  onTabChange,
  onGoToPage,
  onGoToAnnotation,
  onDeleteAnnotation,
  onSearchTermChange,
  onPerformSearch,
  className = "",
}) => {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    await onPerformSearch();
    setIsSearching(false);
  };

  const formatAnnotationDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case "note":
        return <MessageSquare className="w-4 h-4" />;
      case "highlight":
        return <StickyNote className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getAnnotationColor = (type: string) => {
    switch (type) {
      case "note":
        return "text-blue-400";
      case "highlight":
        return "text-yellow-400";
      default:
        return "text-green-400";
    }
  };

  return (
    <div
      className={`pdf-sidebar bg-slate-800 border-r border-slate-700 w-64 p-4 flex flex-col ${className}`}
    >
      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => onTabChange("thumbnails")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === "thumbnails"
              ? "bg-green-500 text-slate-900"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          }`}
        >
          Pages
        </button>
        <button
          onClick={() => onTabChange("annotations")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === "annotations"
              ? "bg-green-500 text-slate-900"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          }`}
        >
          Notes ({annotations.length})
        </button>
        <button
          onClick={() => onTabChange("search")}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
            activeTab === "search"
              ? "bg-green-500 text-slate-900"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          }`}
        >
          Search
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* Thumbnails Tab */}
        {activeTab === "thumbnails" && (
          <div className="h-full overflow-y-auto space-y-3">
            {Array.from({ length: totalPages }, (_, index) => (
              <PDFThumbnail
                key={index + 1}
                pdf={pdf}
                pageNumber={index + 1}
                isActive={currentPage === index + 1}
                onClick={() => onGoToPage(index + 1)}
              />
            ))}
          </div>
        )}

        {/* Annotations Tab */}
        {activeTab === "annotations" && (
          <div className="h-full overflow-y-auto space-y-3">
            {annotations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No annotations yet</p>
                <p className="text-slate-500 text-xs mt-1">
                  Add notes and highlights to get started
                </p>
              </div>
            ) : (
              annotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="bg-slate-900 border border-slate-600 rounded-lg p-3 hover:border-slate-500 cursor-pointer transition-all group"
                  onClick={() => onGoToAnnotation(annotation)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={getAnnotationColor(annotation.type)}>
                        {getAnnotationIcon(annotation.type)}
                      </span>
                      <span className="text-xs text-green-400 font-medium">
                        Page {annotation.pageNumber}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteAnnotation(annotation.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 line-clamp-3 mb-2">
                    {annotation.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {annotation.createdBy}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatAnnotationDate(annotation.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Search in document..."
                  className="flex-1 bg-slate-900 border border-slate-600 text-slate-100 px-3 py-2 rounded-lg text-sm focus:border-green-400 focus:outline-none"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchTerm.trim()}
                  className="px-3 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {isSearching ? "..." : "Go"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <p className="text-xs text-slate-400">
                  Found {searchResults.length} result
                  {searchResults.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {searchResults.length === 0 && searchTerm ? (
                <div className="text-center py-8">
                  <div className="text-slate-600 text-2xl mb-2">🔍</div>
                  <p className="text-slate-400 text-sm">No results found</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Try different keywords
                  </p>
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => onGoToPage(result.page)}
                    className="p-3 bg-slate-900 border border-slate-600 rounded-lg hover:border-green-400 cursor-pointer transition-all"
                  >
                    <div className="text-xs text-green-400 font-medium mb-1">
                      Page {result.page}
                    </div>
                    <div className="text-sm text-slate-200 leading-relaxed">
                      {result.snippet}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFSidebar;
