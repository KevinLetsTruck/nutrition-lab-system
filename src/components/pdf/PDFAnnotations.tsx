"use client";

import React, { useState, useRef, useCallback } from "react";
import { MessageSquare, Highlighter, Edit3, Trash2, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Annotation } from "./PDFViewer";

interface PDFAnnotationsProps {
  pageNumber: number;
  annotations: Annotation[];
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation: (annotation: Annotation) => void;
  onDeleteAnnotation: (annotationId: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  isAnnotationMode: boolean;
  currentTool: "highlight" | "note" | "text";
  className?: string;
}

interface AnnotationInput {
  show: boolean;
  x: number;
  y: number;
  type: "highlight" | "note" | "text";
  selection?: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  };
}

export const PDFAnnotations: React.FC<PDFAnnotationsProps> = ({
  pageNumber,
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  canvasWidth,
  canvasHeight,
  scale,
  isAnnotationMode,
  currentTool,
  className = "",
}) => {
  const [annotationInput, setAnnotationInput] = useState<AnnotationInput>({
    show: false,
    x: 0,
    y: 0,
    type: "note",
  });
  const [inputValue, setInputValue] = useState("");
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [currentSelection, setCurrentSelection] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Get mouse position relative to the canvas
  const getMousePosition = useCallback((e: React.MouseEvent) => {
    if (!overlayRef.current) return { x: 0, y: 0 };

    const rect = overlayRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  // Handle mouse down for selection start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isAnnotationMode) return;

      const pos = getMousePosition(e);

      if (currentTool === "highlight") {
        setIsSelecting(true);
        setSelectionStart(pos);
        setCurrentSelection({
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
        });
      } else if (currentTool === "note") {
        setAnnotationInput({
          show: true,
          x: pos.x,
          y: pos.y,
          type: "note",
        });
      }
    },
    [isAnnotationMode, currentTool, getMousePosition]
  );

  // Handle mouse move for selection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !selectionStart || currentTool !== "highlight")
        return;

      const pos = getMousePosition(e);
      setCurrentSelection({
        startX: selectionStart.x,
        startY: selectionStart.y,
        endX: pos.x,
        endY: pos.y,
      });
    },
    [isSelecting, selectionStart, currentTool, getMousePosition]
  );

  // Handle mouse up for selection end
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !currentSelection || currentTool !== "highlight")
        return;

      setIsSelecting(false);

      // Only create highlight if there's a meaningful selection
      const width = Math.abs(currentSelection.endX - currentSelection.startX);
      const height = Math.abs(currentSelection.endY - currentSelection.startY);

      if (width > 10 && height > 10) {
        setAnnotationInput({
          show: true,
          x: currentSelection.endX,
          y: currentSelection.endY,
          type: "highlight",
          selection: currentSelection,
        });
      }

      setSelectionStart(null);
      setCurrentSelection(null);
    },
    [isSelecting, currentSelection, currentTool]
  );

  // Save annotation
  const saveAnnotation = useCallback(() => {
    if (!inputValue.trim() || !annotationInput.show) return;

    const annotation: Annotation = {
      id: uuidv4(),
      pageNumber,
      type: annotationInput.type,
      coordinates: annotationInput.selection
        ? {
            x: Math.min(
              annotationInput.selection.startX,
              annotationInput.selection.endX
            ),
            y: Math.min(
              annotationInput.selection.startY,
              annotationInput.selection.endY
            ),
            width: Math.abs(
              annotationInput.selection.endX - annotationInput.selection.startX
            ),
            height: Math.abs(
              annotationInput.selection.endY - annotationInput.selection.startY
            ),
          }
        : {
            x: annotationInput.x,
            y: annotationInput.y,
          },
      content: inputValue,
      color: annotationInput.type === "highlight" ? "#ffeb3b" : "#4ade80",
      createdAt: new Date(),
      createdBy: "Current User",
    };

    onAddAnnotation(annotation);
    setAnnotationInput({ show: false, x: 0, y: 0, type: "note" });
    setInputValue("");
  }, [inputValue, annotationInput, pageNumber, onAddAnnotation]);

  // Cancel annotation input
  const cancelAnnotation = useCallback(() => {
    setAnnotationInput({ show: false, x: 0, y: 0, type: "note" });
    setInputValue("");
    setCurrentSelection(null);
    setSelectionStart(null);
    setIsSelecting(false);
  }, []);

  // Handle annotation click
  const handleAnnotationClick = useCallback(
    (annotation: Annotation, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedAnnotation(
        annotation.id === selectedAnnotation ? null : annotation.id
      );
    },
    [selectedAnnotation]
  );

  // Get page-specific annotations
  const pageAnnotations = annotations.filter(
    (a) => a.pageNumber === pageNumber
  );

  return (
    <div
      ref={overlayRef}
      className={`absolute inset-0 ${
        isAnnotationMode ? "cursor-crosshair" : "pointer-events-none"
      } ${className}`}
      style={{ width: canvasWidth, height: canvasHeight }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Current selection overlay */}
      {isSelecting && currentSelection && (
        <div
          className="absolute border-2 border-yellow-400 bg-yellow-200 opacity-30"
          style={{
            left: Math.min(currentSelection.startX, currentSelection.endX),
            top: Math.min(currentSelection.startY, currentSelection.endY),
            width: Math.abs(currentSelection.endX - currentSelection.startX),
            height: Math.abs(currentSelection.endY - currentSelection.startY),
          }}
        />
      )}

      {/* Existing annotations */}
      {pageAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute pointer-events-auto cursor-pointer group"
          style={{
            left: annotation.coordinates.x,
            top: annotation.coordinates.y,
            width: annotation.coordinates.width,
            height: annotation.coordinates.height,
          }}
          onClick={(e) => handleAnnotationClick(annotation, e)}
        >
          {annotation.type === "highlight" && (
            <div
              className="w-full h-full opacity-30 hover:opacity-50 transition-opacity"
              style={{ backgroundColor: annotation.color }}
            />
          )}

          {annotation.type === "note" && (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              style={{ backgroundColor: annotation.color }}
            >
              <MessageSquare className="w-4 h-4 text-slate-900" />
            </div>
          )}

          {/* Annotation tooltip */}
          {selectedAnnotation === annotation.id && (
            <div
              className="absolute z-10 bg-slate-800 text-white rounded-lg p-3 shadow-xl min-w-[200px] max-w-[300px]"
              style={{
                left: annotation.type === "note" ? 30 : 0,
                top:
                  annotation.type === "note"
                    ? -10
                    : (annotation.coordinates.height || 0) + 5,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {annotation.type === "highlight" ? (
                    <Highlighter className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-xs text-slate-300 font-medium">
                    {annotation.type === "highlight" ? "Highlight" : "Note"}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteAnnotation(annotation.id);
                    setSelectedAnnotation(null);
                  }}
                  className="text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <p className="text-sm text-slate-100 mb-2">
                {annotation.content}
              </p>

              <div className="text-xs text-slate-400">
                {annotation.createdBy} •{" "}
                {new Date(annotation.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Annotation input modal */}
      {annotationInput.show && (
        <div
          className="absolute z-20 bg-white rounded-lg shadow-xl border border-slate-200 p-4 min-w-[250px]"
          style={{
            left: Math.min(annotationInput.x, canvasWidth - 270),
            top: Math.min(annotationInput.y, canvasHeight - 150),
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {annotationInput.type === "highlight" ? (
                <Highlighter className="w-4 h-4 text-yellow-500" />
              ) : (
                <MessageSquare className="w-4 h-4 text-green-500" />
              )}
              <span className="text-sm font-medium text-slate-700">
                Add{" "}
                {annotationInput.type === "highlight" ? "Highlight" : "Note"}
              </span>
            </div>
            <button
              onClick={cancelAnnotation}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Enter your ${annotationInput.type}...`}
            className="w-full p-2 border border-slate-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            autoFocus
          />

          <div className="flex gap-2 mt-3">
            <button
              onClick={saveAnnotation}
              disabled={!inputValue.trim()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
            <button
              onClick={cancelAnnotation}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFAnnotations;
