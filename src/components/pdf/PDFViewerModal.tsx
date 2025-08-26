"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import PDFToolbar from "./PDFToolbar";
import PDFSidebar from "./PDFSidebar";
import { Annotation } from "./PDFViewer";

// Extend HTMLCanvasElement to include our custom _renderTask property
interface ExtendedHTMLCanvasElement extends HTMLCanvasElement {
  _renderTask?: any;
}

// Configure PDF.js worker - done in useEffect to avoid hydration mismatch

export interface Document {
  id: string;
  name: string;
  url: string;
  type: "lab_report" | "protocol" | "assessment" | "intake" | "other";
  uploadedDate: Date;
  pages?: number;
  clientId: string;
}

interface PDFViewerModalProps {
  document: Document;
  onClose: () => void;
  allowAnnotations?: boolean;
  allowDownload?: boolean;
  allowPrint?: boolean;
  allowShare?: boolean;
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
  annotationMode: boolean;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  document,
  onClose,
  allowAnnotations = true,
  allowDownload = true,
  allowPrint = true,
  allowShare = false,
}) => {
  const canvasRef = useRef<ExtendedHTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

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
    annotationMode: false,
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
          url: document.url,
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
        let errorMessage = "Failed to load PDF document";

        if (error instanceof Error) {
          if (
            error.message.includes("404") ||
            error.message.includes("Not Found")
          ) {
            errorMessage =
              "Document file not found. The file may have been moved or deleted.";
          } else if (error.message.includes("Failed to fetch")) {
            errorMessage =
              "Unable to fetch document. Please check your internet connection.";
          }
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
      }
    };

    if (document.url) {
      loadPDF();
    }
  }, [document.url]);

  // Render specific page
  const renderPage = useCallback(
    async (pageNum: number, pdfDoc?: any) => {
      const pdf = pdfDoc || state.pdf;
      if (!pdf || !canvasRef.current) return;

      try {
        // Cancel any previous render task
        if (canvasRef.current._renderTask) {
          canvasRef.current._renderTask.cancel();
        }

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: state.scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        // Clear the canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Store the render task so we can cancel it if needed
        const renderTask = page.render(renderContext);
        canvas._renderTask = renderTask;

        await renderTask.promise;

        // Clear the render task reference when done
        canvas._renderTask = null;
      } catch (error) {
        if (error.name !== "RenderingCancelledException") {
          console.error("Error rendering page:", error);
        }
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
          const containerWidth = containerRef.current.clientWidth - 48;
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

  // Action handlers
  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, showSidebar: !prev.showSidebar }));
  }, []);

  const toggleSearch = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sidebarTab: prev.sidebarTab === "search" ? "thumbnails" : "search",
      showSidebar: prev.sidebarTab !== "search" ? true : prev.showSidebar,
    }));
  }, []);

  const toggleAnnotations = useCallback(() => {
    setState((prev) => ({ ...prev, annotationMode: !prev.annotationMode }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.document !== "undefined"
    ) {
      if (!window.document.fullscreenElement) {
        viewerRef.current?.requestFullscreen();
        setState((prev) => ({ ...prev, isFullscreen: true }));
      } else {
        window.document.exitFullscreen();
        setState((prev) => ({ ...prev, isFullscreen: false }));
      }
    }
  }, []);

  const downloadPDF = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.document !== "undefined"
    ) {
      const link = window.document.createElement("a");
      link.href = document.url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  }, [document.url, document.name]);

  const printPDF = useCallback(() => {
    if (typeof window !== "undefined") {
      const printWindow = window.open(document.url, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
    }
  }, [document.url]);

  const sharePDF = useCallback(() => {
    if (typeof navigator !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: document.name,
          url: document.url,
        });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(document.url);
        alert("Link copied to clipboard!");
      }
    }
  }, [document.url, document.name]);

  // Annotation handlers
  const goToAnnotation = useCallback(
    (annotation: Annotation) => {
      goToPage(annotation.pageNumber);
    },
    [goToPage]
  );

  const deleteAnnotation = useCallback((annotationId: string) => {
    setState((prev) => ({
      ...prev,
      annotations: prev.annotations.filter((a) => a.id !== annotationId),
    }));
  }, []);

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
          if (state.isFullscreen) {
            toggleFullscreen();
          } else {
            onClose();
          }
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
        case "s":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleSearch();
          }
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
  }, [
    prevPage,
    nextPage,
    onClose,
    zoomIn,
    zoomOut,
    toggleFullscreen,
    toggleSearch,
    state.isFullscreen,
  ]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setState((prev) => ({
        ...prev,
        isFullscreen:
          typeof window !== "undefined" &&
          typeof window.document !== "undefined"
            ? !!window.document.fullscreenElement
            : false,
      }));
    };

    if (
      typeof window !== "undefined" &&
      typeof window.document !== "undefined"
    ) {
      window.document.addEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    }

    return () => {
      if (
        typeof window !== "undefined" &&
        typeof window.document !== "undefined"
      ) {
        window.document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
      }
    };
  }, []);

  // Re-render page when scale changes
  useEffect(() => {
    if (state.pdf && state.currentPage) {
      renderPage(state.currentPage);
    }
  }, [state.scale, renderPage, state.pdf, state.currentPage]);

  // Cleanup effect to cancel render operations
  useEffect(() => {
    return () => {
      // Cancel any pending render operation when component unmounts
      if (canvasRef.current && canvasRef.current._renderTask) {
        canvasRef.current._renderTask.cancel();
      }
    };
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (state.isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
            <div className="text-center">
              <h3 className="text-slate-100 text-lg font-semibold mb-1">
                Loading PDF Document
              </h3>
              <p className="text-slate-400 text-sm">{document.name}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-slate-100 text-lg font-semibold mb-2">
              Failed to load PDF
            </h3>
            <p className="text-slate-400 text-sm mb-4">{state.error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-500 text-slate-900 rounded-lg font-semibold hover:bg-green-400 transition-all"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={viewerRef}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-slate-100 truncate">
                {document.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Uploaded {formatDate(document.uploadedDate)} •{" "}
                {state.totalPages} pages
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-slate-800 rounded-lg transition-all"
            >
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <PDFToolbar
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          scale={state.scale}
          showSidebar={state.showSidebar}
          isFullscreen={state.isFullscreen}
          allowDownload={allowDownload}
          allowPrint={allowPrint}
          allowShare={allowShare}
          allowAnnotations={allowAnnotations}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onGoToPage={goToPage}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onSetZoom={setZoom}
          onToggleSidebar={toggleSidebar}
          onToggleSearch={toggleSearch}
          onToggleAnnotations={toggleAnnotations}
          onDownload={downloadPDF}
          onPrint={printPDF}
          onShare={sharePDF}
          onToggleFullscreen={toggleFullscreen}
          onClose={onClose}
        />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          {state.showSidebar && (
            <PDFSidebar
              pdf={state.pdf}
              currentPage={state.currentPage}
              totalPages={state.totalPages}
              scale={state.scale}
              activeTab={state.sidebarTab}
              annotations={state.annotations}
              searchResults={state.searchResults}
              searchTerm={state.searchTerm}
              onTabChange={(tab) =>
                setState((prev) => ({ ...prev, sidebarTab: tab }))
              }
              onGoToPage={goToPage}
              onGoToAnnotation={goToAnnotation}
              onDeleteAnnotation={deleteAnnotation}
              onSearchTermChange={(term) =>
                setState((prev) => ({ ...prev, searchTerm: term }))
              }
              onPerformSearch={performSearch}
            />
          )}

          {/* Main Viewer */}
          <div className="flex-1 flex flex-col bg-slate-900">
            <div
              ref={containerRef}
              className="flex-1 overflow-auto p-6 flex items-center justify-center"
            >
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="shadow-2xl rounded-lg border border-slate-700 bg-white"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />

                {/* Annotation overlay */}
                {state.annotationMode && (
                  <div className="absolute inset-0 pointer-events-none">
                    {state.annotations
                      .filter((a) => a.pageNumber === state.currentPage)
                      .map((annotation) => (
                        <div
                          key={annotation.id}
                          className="absolute pointer-events-auto"
                          style={{
                            left: annotation.coordinates.x,
                            top: annotation.coordinates.y,
                            width: annotation.coordinates.width,
                            height: annotation.coordinates.height,
                          }}
                        >
                          {annotation.type === "highlight" && (
                            <div className="bg-yellow-300 opacity-30" />
                          )}
                          {annotation.type === "note" && (
                            <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center cursor-pointer">
                              <span className="text-slate-900 text-xs font-bold">
                                !
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;
