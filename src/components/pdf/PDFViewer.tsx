"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker - done in useEffect to avoid hydration mismatch

export interface Annotation {
  id: string;
  pageNumber: number;
  type: "highlight" | "note" | "drawing" | "text";
  coordinates: { x: number; y: number; width?: number; height?: number };
  content: string;
  color: string;
  createdAt: Date;
  createdBy: string;
}

export interface PDFViewerProps {
  documentId: string;
  documentUrl: string;
  documentName: string;
  documentType: "lab_report" | "protocol" | "assessment" | "intake" | "other";
  uploadedDate: Date;
  clientId: string;
  onClose: () => void;
  onAnnotationSave?: (annotations: Annotation[]) => void;
  allowAnnotations?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
  allowShare?: boolean;
  className?: string;
}

interface PDFViewerState {
  pdf: any;
  currentPage: number;
  totalPages: number;
  scale: number;
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  searchResults: any[];
  annotations: Annotation[];
  sidebarTab: "thumbnails" | "annotations" | "search";
  showSidebar: boolean;
  isFullscreen: boolean;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  documentUrl,
  documentName,
  documentType,
  uploadedDate,
  clientId,
  onClose,
  onAnnotationSave,
  allowAnnotations = true,
  allowDownload = true,
  allowPrint = true,
  allowShare = false,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<PDFViewerState>({
    pdf: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1,
    isLoading: true,
    error: null,
    searchTerm: "",
    searchResults: [],
    annotations: [],
    sidebarTab: "thumbnails",
    showSidebar: true,
    isFullscreen: false,
  });

  // Load PDF document
  useEffect(() => {
    // Configure PDF.js worker on client side only
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    }

    const loadPDF = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const loadingTask = pdfjsLib.getDocument({
          url: documentUrl,
          cMapUrl: "/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;

        setState((prev) => ({
          ...prev,
          pdf,
          totalPages: pdf.numPages,
          isLoading: false,
        }));

        // Render first page
        renderPage(1, pdf);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to load PDF document",
          isLoading: false,
        }));
      }
    };

    if (documentUrl) {
      loadPDF();
    }
  }, [documentUrl]);

  // Render specific page
  const renderPage = useCallback(
    async (pageNum: number, pdfDoc?: any) => {
      const pdf = pdfDoc || state.pdf;
      if (!pdf || !canvasRef.current) return;

      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: state.scale });
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
      } catch (error) {
        console.error("Error rendering page:", error);
      }
    },
    [state.pdf, state.scale]
  );

  // Navigation functions
  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum >= 1 && pageNum <= state.totalPages) {
        setState((prev) => ({ ...prev, currentPage: pageNum }));
        renderPage(pageNum);
      }
    },
    [state.totalPages, renderPage]
  );

  const nextPage = useCallback(() => {
    if (state.currentPage < state.totalPages) {
      goToPage(state.currentPage + 1);
    }
  }, [state.currentPage, state.totalPages, goToPage]);

  const prevPage = useCallback(() => {
    if (state.currentPage > 1) {
      goToPage(state.currentPage - 1);
    }
  }, [state.currentPage, goToPage]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    const newScale = Math.min(state.scale * 1.25, 3);
    setState((prev) => ({ ...prev, scale: newScale }));
    renderPage(state.currentPage);
  }, [state.scale, state.currentPage, renderPage]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(state.scale / 1.25, 0.5);
    setState((prev) => ({ ...prev, scale: newScale }));
    renderPage(state.currentPage);
  }, [state.scale, state.currentPage, renderPage]);

  const setZoom = useCallback(
    (newScale: number | string) => {
      let scale: number;

      if (typeof newScale === "string") {
        if (newScale === "fit" && containerRef.current && canvasRef.current) {
          const containerWidth = containerRef.current.clientWidth - 48; // padding
          const canvasWidth = canvasRef.current.width;
          scale = containerWidth / canvasWidth;
        } else if (
          newScale === "page" &&
          containerRef.current &&
          canvasRef.current
        ) {
          const containerHeight = containerRef.current.clientHeight - 48;
          const containerWidth = containerRef.current.clientWidth - 48;
          const canvasHeight = canvasRef.current.height;
          const canvasWidth = canvasRef.current.width;
          scale = Math.min(
            containerWidth / canvasWidth,
            containerHeight / canvasHeight
          );
        } else {
          scale = 1;
        }
      } else {
        scale = newScale;
      }

      setState((prev) => ({ ...prev, scale }));
      renderPage(state.currentPage);
    },
    [state.currentPage, renderPage]
  );

  // Search functionality
  const performSearch = useCallback(async () => {
    if (!state.pdf || !state.searchTerm.trim()) {
      setState((prev) => ({ ...prev, searchResults: [] }));
      return;
    }

    try {
      const results = [];
      const searchTerm = state.searchTerm.toLowerCase();

      for (let i = 1; i <= state.totalPages; i++) {
        const page = await state.pdf.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");

        if (text.toLowerCase().includes(searchTerm)) {
          const startIndex = text.toLowerCase().indexOf(searchTerm);
          const snippet = text.substring(
            Math.max(0, startIndex - 30),
            Math.min(text.length, startIndex + state.searchTerm.length + 30)
          );

          results.push({
            page: i,
            snippet: `...${snippet}...`,
            term: state.searchTerm,
          });
        }
      }

      setState((prev) => ({ ...prev, searchResults: results }));
    } catch (error) {
      console.error("Error searching PDF:", error);
    }
  }, [state.pdf, state.searchTerm, state.totalPages]);

  // Download functionality
  const downloadPDF = useCallback(() => {
    if (typeof document !== "undefined") {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [documentUrl, documentName]);

  // Print functionality
  const printPDF = useCallback(() => {
    if (typeof window !== "undefined") {
      const printWindow = window.open(documentUrl, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
    }
  }, [documentUrl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevPage();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextPage();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("keydown", handleKeyPress);
      }
    };
  }, [prevPage, nextPage, onClose, zoomIn, zoomOut]);

  // Re-render page when scale changes
  useEffect(() => {
    if (state.pdf && state.currentPage) {
      renderPage(state.currentPage);
    }
  }, [state.scale, renderPage, state.pdf, state.currentPage]);

  if (state.isLoading) {
    return (
      <div
        className={`pdf-viewer-container bg-slate-900 border border-slate-700 rounded-xl overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            <p className="text-slate-300 text-sm">Loading PDF document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div
        className={`pdf-viewer-container bg-slate-900 border border-slate-700 rounded-xl overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <p className="text-slate-300 text-lg mb-2">Failed to load PDF</p>
            <p className="text-slate-500 text-sm">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-400 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return {
    state,
    setState,
    canvasRef,
    containerRef,
    goToPage,
    nextPage,
    prevPage,
    zoomIn,
    zoomOut,
    setZoom,
    performSearch,
    downloadPDF,
    printPDF,
  };
};

export default PDFViewer;
