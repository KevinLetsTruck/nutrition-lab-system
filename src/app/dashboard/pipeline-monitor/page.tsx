"use client";
import { useState, useEffect } from "react";

// High contrast styles for better readability
const highContrastStyles = {
  label: "text-white font-bold text-lg",
  input:
    "w-full bg-gray-900/50 border-2 border-gray-700 rounded-md px-4 py-3 text-white font-semibold text-lg placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-600",
  button: "font-bold text-lg py-3 px-6",
  heading: "text-2xl font-bold text-white",
  subheading: "text-xl font-bold text-gray-300",
  text: "text-lg font-medium text-gray-300",
  smallText: "text-base font-medium text-gray-400",
  card: "bg-gray-800/50 shadow-xl rounded-lg p-6 border-2 border-gray-700",
  statusCard: "p-4 rounded-lg border-2",
};

export default function PipelineMonitor() {
  const [documentId, setDocumentId] = useState("");
  const [status, setStatus] = useState(null);
  const [labValues, setLabValues] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const checkStatus = async () => {
    if (!documentId) return;

    try {
      setError(null);

      // Check document status
      const docRes = await fetch(`/api/medical/documents/${documentId}/status`);
      if (!docRes.ok) {
        throw new Error(`Document not found (${docRes.status})`);
      }
      const docData = await docRes.json();
      setStatus(docData);

      // Check lab values
      const labRes = await fetch(
        `/api/medical/documents/${documentId}/lab-values`
      );
      if (labRes.ok) {
        const labData = await labRes.json();
        setLabValues(labData.labValues || []);
      }

      // Check analysis
      const analysisRes = await fetch(
        `/api/medical/documents/${documentId}/analysis`
      );
      if (analysisRes.ok) {
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData);
      } else if (analysisRes.status === 404) {
        // Analysis not available - this is normal for legacy documents
        setAnalysis(null);
      }
    } catch (error) {
      console.error("Error checking status:", error);
      setError(error.message);
    }
  };

  const startMonitoring = () => {
    if (!documentId.trim()) {
      setError("Please enter a document ID");
      return;
    }
    setIsMonitoring(true);
    checkStatus();
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setStatus(null);
    setLabValues([]);
    setAnalysis(null);
    setError(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress("Preparing upload...");

    try {
      const formData = new FormData();
      formData.append("files", file); // Use "files" not "file"
      // Don't include clientId for pipeline monitor uploads - they'll be standalone test documents
      formData.append("source", "pipeline_monitor");

      setUploadProgress("Uploading document...");

      const response = await fetch("/api/medical/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.documents && result.documents.length > 0) {
        setUploadProgress("Upload successful! Starting monitor...");
        setDocumentId(result.documents[0].id);

        // Auto-start monitoring
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress("");
          setIsMonitoring(true);
          checkStatus();
        }, 1000);
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  useEffect(() => {
    if (isMonitoring && documentId) {
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [documentId, isMonitoring]);

  const getStatusIcon = (condition) => {
    return condition ? "✅" : "⏳";
  };

  const getStatusColor = (functional) => {
    switch (functional) {
      case "optimal":
        return "bg-green-200 text-green-800";
      case "suboptimal":
        return "bg-yellow-200 text-yellow-800";
      case "concerning":
        return "bg-orange-200 text-orange-800";
      case "critical":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getHealthStatusColor = (health) => {
    switch (health) {
      case "excellent":
        return "text-green-600 font-bold";
      case "good":
        return "text-green-500 font-bold";
      case "fair":
        return "text-yellow-600 font-bold";
      case "needs-attention":
        return "text-orange-600 font-bold";
      case "critical":
        return "text-red-600 font-bold";
      default:
        return "text-gray-600 font-bold";
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e]">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black text-white mb-2">
            🔬 AI Pipeline Monitor
          </h1>
          <p className={highContrastStyles.heading}>
            Real-time monitoring of Kevin Rutherford's 3-Stage Medical Document
            Processing System
          </p>
        </div>

        <div className="bg-gray-800/50 shadow-lg rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Document Testing Options
          </h2>

        {/* Upload New Document Section */}
          <div className="border-b border-gray-700 pb-6 mb-6">
            <h3 className="text-lg font-medium mb-3 flex items-center text-white">
            <span className="mr-2">📤</span>
            Option 1: Upload & Test with Real Document
          </h3>
          <p className="text-sm text-gray-400 mb-4 font-medium">
            Upload a lab report (PDF or image) and watch the AI pipeline process
            it in real-time
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.heic,.webp"
                onChange={handleFileUpload}
                disabled={isUploading || isMonitoring}
                className="block w-full text-sm text-white font-medium bg-gray-900/50 border-2 border-gray-700 rounded-md p-2
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-bold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {isUploading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">{uploadProgress}</span>
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-800 font-medium">
            Supported formats: PDF, JPG, PNG, TIFF, HEIC, WEBP (max 10MB)
          </div>
        </div>

        {/* Manual Document ID Section */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center text-gray-900">
            <span className="mr-2">🔍</span>
            Option 2: Monitor Existing Document
          </h3>
          <p className="text-sm text-gray-900 mb-4 font-medium">
            Enter a document ID to monitor an already uploaded document
          </p>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Document ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter Document ID (e.g., cmeagkso20004v2yscdxnwunj)"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full bg-white border-2 border-gray-400 rounded-md px-3 py-3 pr-10 text-gray-900 font-medium placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isMonitoring || isUploading}
                />
                {documentId && !isMonitoring && (
                  <button
                    onClick={() => setDocumentId("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 hover:bg-gray-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                    title="Clear"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isMonitoring && !isUploading ? (
                <button
                  onClick={startMonitoring}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Monitoring
                </button>
              ) : isMonitoring ? (
                <button
                  onClick={stopMonitoring}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Stop Monitoring
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-400 text-white px-6 py-2 rounded-md cursor-not-allowed"
                >
                  Uploading...
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {isMonitoring && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 flex items-center">
              <span className="animate-pulse mr-2">🔄</span>
              Monitoring document {documentId}... (updates every 2 seconds)
            </p>
          </div>
        )}
      </div>

      {/* Welcome Message - Show when no document is being monitored */}
      {!status && !isMonitoring && !isUploading && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-8 text-center shadow-lg mt-6">
          <h2 className="text-4xl font-black mb-4 text-gray-900">
            🚀 Ready to Analyze Medical Documents
          </h2>
          <p className="text-xl text-gray-800 font-semibold mb-6">
            Upload a PDF above to see the AI pipeline in action!
          </p>
          <div className="text-lg text-gray-700 font-medium">
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-800/50 p-4 rounded-lg border-2 border-blue-500/50">
                <span className="text-2xl">📄</span>
                <p className="font-bold mt-2">OCR</p>
                <p className="text-sm">Text Extraction</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border-2 border-green-500/50">
                <span className="text-2xl">🔍</span>
                <p className="font-bold mt-2 text-white">Structure</p>
                <p className="text-sm text-gray-400">AI Analysis</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                <span className="text-2xl">🧪</span>
                <p className="font-bold mt-2">Extraction</p>
                <p className="text-sm">Lab Values</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-2 border-orange-200">
                <span className="text-2xl">📊</span>
                <p className="font-bold mt-2">Analysis</p>
                <p className="text-sm">Health Insights</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className="space-y-6">
          {/* Pipeline Status Overview */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">🔍</span>
              Pipeline Status Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Document Status</h3>
                <p className="text-lg font-bold text-blue-600">
                  {status.status}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Stage 1: OCR</h3>
                <p className="text-2xl">
                  {getStatusIcon(status.extractedText)}
                </p>
                <p className="text-sm text-gray-600">Text Extraction</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">
                  Stage 2: Structure
                </h3>
                <p className="text-2xl">
                  {getStatusIcon(status.metadata?.structureAnalysis)}
                </p>
                <p className="text-sm text-gray-600">Document Analysis</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">
                  Stage 3: Extraction
                </h3>
                <p className="text-2xl">
                  {getStatusIcon(labValues.length > 0)}
                </p>
                <p className="text-sm text-gray-600">
                  {labValues.length} Lab Values
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">
                  Stage 4: Analysis
                </h3>
                <p className="text-2xl">
                  {analysis && analysis.hasAnalysis
                    ? "✅"
                    : analysis && analysis.hasAnalysis === false
                    ? "ℹ️"
                    : getStatusIcon(status.metadata?.functionalAnalysis)}
                </p>
                <p className="text-sm text-gray-600">Functional Medicine</p>
              </div>
            </div>
          </div>

          {/* Structure Analysis Results */}
          {status.metadata?.structureAnalysis && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">📄</span>
                Document Structure Analysis (Prompt #1)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300">
                  <h3 className="font-bold text-green-900 text-xl mb-2">
                    Document Type
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {status.metadata.structureAnalysis.documentType}
                  </p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-300">
                  <h3 className="font-bold text-blue-900 text-xl mb-2">
                    OCR Quality
                  </h3>
                  <p className="text-3xl font-black text-gray-900">
                    {status.metadata.structureAnalysis.ocrQuality.overall}/10
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-300">
                  <h3 className="font-bold text-purple-900 text-xl mb-2">
                    Expected Tests
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      status.metadata.structureAnalysis.extractionStrategy
                        .expectedTestCount
                    }
                  </p>
                </div>
              </div>

              {status.metadata.structureAnalysis.criticalObservations?.length >
                0 && (
                <div className="mt-4 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <h3 className="font-bold text-yellow-900 mb-3 text-xl">
                    Critical Observations
                  </h3>
                  <ul className="space-y-3">
                    {status.metadata.structureAnalysis.criticalObservations.map(
                      (obs, i) => (
                        <li
                          key={i}
                          className="flex items-start bg-white p-3 rounded border border-yellow-200"
                        >
                          <span className="text-yellow-600 mr-3 text-xl font-bold">
                            ⚠️
                          </span>
                          <span className="text-base font-medium text-gray-800">
                            {obs}
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Lab Values Extraction */}
          {labValues.length > 0 && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🧪</span>
                Lab Values Extraction (Prompt #2) - {labValues.length} Values
                Found
              </h2>

              {status.metadata?.aiExtraction && (
                <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <h3 className="font-bold text-blue-900 text-xl mb-2">
                        Extraction Confidence
                      </h3>
                      <p className="text-3xl font-black text-gray-900">
                        {status.metadata?.aiExtraction?.extractionSummary
                          ?.confidence
                          ? (
                              status.metadata.aiExtraction.extractionSummary
                                .confidence * 100
                            ).toFixed(1)
                          : "0"}
                        %
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-blue-900 text-xl mb-2">
                        Method
                      </h3>
                      <p className="text-lg font-bold text-gray-800">
                        {status.metadata?.aiExtraction?.extractionSummary
                          ?.extractionMethod || "AI-Powered"}
                      </p>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-blue-900 text-xl mb-2">
                        Validation
                      </h3>
                      <p className="text-2xl font-black">
                        {status.metadata?.aiExtraction?.isValid
                          ? "✅ PASSED"
                          : status.metadata?.aiExtraction
                          ? "❌ FAILED"
                          : "⏳ PENDING"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labValues.map((lab, i) => (
                  <div
                    key={i}
                    className="border-2 border-gray-300 rounded-lg p-5 bg-white hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-900 text-lg">
                        {lab.testName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded text-sm font-bold ${getStatusColor(
                          lab.functionalStatus
                        )}`}
                      >
                        {lab.functionalStatus || lab.status || "unknown"}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">
                      {lab.value}{" "}
                      <span className="text-lg font-semibold text-gray-700">
                        {lab.unit}
                      </span>
                    </p>
                    {lab.referenceRange && (
                      <div className="text-base font-medium text-gray-800 mt-3 pt-3 border-t border-gray-200">
                        <p>
                          Reference:{" "}
                          <span className="font-normal">
                            {lab.referenceRange}
                          </span>
                        </p>
                        {lab.functionalRange && (
                          <p className="text-blue-800">
                            Functional:{" "}
                            <span className="font-normal">
                              {lab.functionalRange}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legacy Document Notice - Commented out as requested */}
          {/* analysis && analysis.hasAnalysis === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center text-amber-800">
                <span className="mr-2">ℹ️</span>
                Legacy Document Detected
              </h2>
              <div className="text-amber-700">
                <p className="mb-3">
                  <strong>
                    This document was processed with the previous system.
                  </strong>
                </p>
                <p className="mb-3">{analysis.message}</p>
                <div className="bg-white p-4 rounded border border-amber-200">
                  <h3 className="font-semibold mb-2">
                    🚀 New AI Pipeline Features:
                  </h3>
                  <ul className="list-disc ml-5 space-y-1 text-sm">
                    <li>
                      <strong>Document Structure Analysis</strong> - AI
                      identifies document layout and sections
                    </li>
                    <li>
                      <strong>Enhanced Lab Extraction</strong> - 98% confidence
                      with functional medicine ranges
                    </li>
                    <li>
                      <strong>Functional Medicine Analysis</strong> - Pattern
                      recognition and root cause analysis
                    </li>
                    <li>
                      <strong>Truck Driver Specialization</strong> -
                      Lifestyle-adapted recommendations
                    </li>
                    <li>
                      <strong>Client-Ready Reports</strong> - Human-readable
                      narrative summaries
                    </li>
                  </ul>
                </div>
                <p className="mt-3 font-medium">💡 {analysis.suggestion}</p>
              </div>
            </div>
          )} */}

          {/* Functional Medicine Analysis */}
          {analysis && analysis.hasAnalysis && analysis.functionalAnalysis && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🔬</span>
                Functional Medicine Analysis (Prompt #3)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">
                    Overall Health
                  </h3>
                  <p
                    className={`text-lg ${getHealthStatusColor(
                      analysis.functionalAnalysis.summary.overallHealth
                    )}`}
                  >
                    {analysis.functionalAnalysis.summary.overallHealth.toUpperCase()}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">
                    Patterns Found
                  </h3>
                  <p className="text-lg font-bold text-green-600">
                    {status.metadata.functionalAnalysis.patterns.length}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Root Causes</h3>
                  <p className="text-lg font-bold text-orange-600">
                    {status.metadata.functionalAnalysis.rootCauses.length}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700">Concerns</h3>
                  <p className="text-lg font-bold text-purple-600">
                    {
                      status.metadata.functionalAnalysis.summary.primaryConcerns
                        .length
                    }
                  </p>
                </div>
              </div>

              {/* Patterns */}
              {status.metadata.functionalAnalysis.patterns.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    🎯 Identified Patterns
                  </h3>
                  <div className="space-y-3">
                    {status.metadata.functionalAnalysis.patterns.map(
                      (pattern, i) => (
                        <div
                          key={i}
                          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {pattern.name}
                            </h4>
                            <div className="flex gap-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  pattern.severity === "mild"
                                    ? "bg-green-200 text-green-800"
                                    : pattern.severity === "moderate"
                                    ? "bg-yellow-200 text-yellow-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {pattern.severity}
                              </span>
                              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-200 text-blue-800">
                                {pattern.confidence || "unknown"} confidence
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">
                            {pattern.explanation}
                          </p>
                          <p className="text-xs text-gray-600">
                            <strong>Markers:</strong>{" "}
                            {pattern.markers.join(", ")}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Primary Concerns */}
              {status.metadata.functionalAnalysis.summary.primaryConcerns
                .length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    🚨 Primary Concerns
                  </h3>
                  <ul className="list-disc ml-5 space-y-1">
                    {status.metadata.functionalAnalysis.summary.primaryConcerns.map(
                      (concern, i) => (
                        <li key={i} className="text-gray-700">
                          {concern}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Immediate Recommendations */}
              {status.metadata.functionalAnalysis.recommendations?.immediate
                ?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    📋 Immediate Recommendations
                  </h3>
                  <ul className="list-decimal ml-5 space-y-1">
                    {status.metadata.functionalAnalysis.recommendations.immediate.map(
                      (rec, i) => (
                        <li key={i} className="text-gray-700">
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Truck Driver Considerations */}
              {status.metadata.functionalAnalysis.truckDriverConsiderations
                ?.relevant && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <span className="mr-2">🚛</span>
                    Truck Driver Specific Adaptations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">
                        Challenges Addressed:
                      </h4>
                      <ul className="text-sm text-gray-700 list-disc ml-4">
                        {status.metadata.functionalAnalysis.truckDriverConsiderations.specificChallenges.map(
                          (challenge, i) => (
                            <li key={i}>{challenge}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">
                        Road-Ready Solutions:
                      </h4>
                      <ul className="text-sm text-gray-700 list-disc ml-4">
                        {status.metadata.functionalAnalysis.truckDriverConsiderations.adaptedRecommendations.map(
                          (rec, i) => (
                            <li key={i}>{rec}</li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Narrative Report */}
          {status.metadata?.narrativeReport && (
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">📄</span>
                Client-Friendly Narrative Report
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
                  {status.metadata.narrativeReport}
                </pre>
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    const blob = new Blob([status.metadata.narrativeReport], {
                      type: "text/plain",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `functional-medicine-report-${documentId}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  📥 Download Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!status && !isMonitoring && !isUploading && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔬</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">
            Ready to Test AI Pipeline
          </h2>
          <p className="text-gray-500 mb-4">
            Upload a real lab report above or enter an existing document ID to
            watch the AI pipeline in action
          </p>
          <div className="text-sm text-gray-400">
            <p className="mb-2">
              📤 <strong>Best:</strong> Upload your own lab report (PDF/image)
              for immediate testing
            </p>
            <p className="mb-2">
              🔍 <strong>Alternative:</strong> Use existing document ID:
              cmeagkso20004v2yscdxnwunj
            </p>
            <p>
              📊 Monitor shows all 4 stages: OCR → Structure Analysis → Lab
              Extraction → Functional Analysis
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
