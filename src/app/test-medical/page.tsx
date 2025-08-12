"use client";

import { useState, useEffect } from "react";
import { Upload, CheckCircle, XCircle, AlertCircle, Cloud } from "lucide-react";

interface S3Status {
  s3Connected: boolean;
  bucket?: string;
  region?: string;
  message: string;
}

export default function TestMedicalPage() {
  const [s3Status, setS3Status] = useState<S3Status | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [ocrStatus, setOcrStatus] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [labValues, setLabValues] = useState<any[]>([]);
  const [functionalAnalysis, setFunctionalAnalysis] = useState<any[]>([]);
  const [fntpProtocols, setFntpProtocols] = useState<any[]>([]);

  // Check S3 status on component mount
  useEffect(() => {
    checkS3Status();
  }, []);

  // Auto-refresh OCR status
  useEffect(() => {
    if (autoRefresh && results?.documents?.length > 0) {
      const interval = setInterval(() => {
        const documentIds = results.documents.map((doc: any) => doc.id);
        checkOCRStatus(documentIds);
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, results]);

  const checkS3Status = async () => {
    try {
      const response = await fetch("/api/medical/upload");
      const data = await response.json();
      setS3Status(data);
    } catch (error) {
      setS3Status({
        s3Connected: false,
        message: "Failed to check S3 status",
      });
    }
  };

  const fetchLabValues = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/medical/documents/${documentId}/lab-values`
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch lab values:", error);
    }
    return null;
  };

  const fetchFunctionalAnalysis = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/medical/documents/${documentId}/analysis`
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch functional analysis:", error);
    }
    return null;
  };

  const fetchFNTPProtocol = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/medical/documents/${documentId}/protocol`
      );
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error("Failed to fetch FNTP protocol:", error);
    }
    return null;
  };

  const checkOCRStatus = async (documentIds: string[]) => {
    try {
      const statusPromises = documentIds.map((id) =>
        fetch(`/api/medical/documents/${id}/status`).then((r) => r.json())
      );
      const statuses = await Promise.all(statusPromises);
      setOcrStatus(statuses);

      // Check for completed documents and fetch their lab values and analysis
      const completedDocs = statuses.filter(
        (status) => status.status === "COMPLETED"
      );
      if (completedDocs.length > 0) {
        const labPromises = completedDocs.map((doc) => fetchLabValues(doc.id));
        const labResults = await Promise.all(labPromises);
        setLabValues(labResults.filter(Boolean));

        // Fetch functional analysis for completed documents
        const analysisPromises = completedDocs.map((doc) =>
          fetchFunctionalAnalysis(doc.id)
        );
        const analysisResults = await Promise.all(analysisPromises);
        setFunctionalAnalysis(analysisResults.filter(Boolean));

        // Fetch FNTP protocols for completed documents
        const protocolPromises = completedDocs.map((doc) =>
          fetchFNTPProtocol(doc.id)
        );
        const protocolResults = await Promise.all(protocolPromises);
        setFntpProtocols(protocolResults.filter(Boolean));
      }
    } catch (error) {
      console.error("Failed to check OCR status:", error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setResults(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("isRadioShow", "true");
      formData.append("source", "test_page");

      const response = await fetch("/api/medical/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResults(data);

      // Start OCR monitoring if successful
      if (data.success && data.documents.length > 0) {
        setAutoRefresh(true);
        const documentIds = data.documents.map((doc: any) => doc.id);
        checkOCRStatus(documentIds);
      }
    } catch (error) {
      setResults({
        success: false,
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#4ade80] mb-4">
            Medical Document System Test
          </h1>
          <p className="text-gray-300">
            Test S3 storage and document upload functionality
          </p>
        </div>

        {/* S3 Status Card */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cloud className="w-6 h-6 text-[#4ade80]" />
            <h2 className="text-xl font-semibold">S3 Storage Status</h2>
            <button
              onClick={checkS3Status}
              className="ml-auto px-3 py-1 bg-[#4ade80] text-[#0f172a] rounded text-sm font-medium hover:bg-[#22c55e] transition-colors"
            >
              Refresh
            </button>
          </div>

          {s3Status ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {s3Status.s3Connected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={
                    s3Status.s3Connected ? "text-green-400" : "text-red-400"
                  }
                >
                  {s3Status.message}
                </span>
              </div>
              {s3Status.bucket && (
                <div className="text-sm text-gray-400">
                  Bucket: {s3Status.bucket} | Region: {s3Status.region}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-400">Checking S3 status...</span>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-[#4ade80]" />
            <h2 className="text-xl font-semibold">Document Upload Test</h2>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.heic,.webp"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4ade80] file:text-[#0f172a] hover:file:bg-[#22c55e] file:cursor-pointer cursor-pointer"
              />
              <p className="text-sm text-gray-400 mt-2">
                Supports: PDF, JPEG, PNG, TIFF, HEIC, WebP (max 10MB each, up to
                10 files)
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Selected Files:</h3>
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${Date.now()}-${index}`}
                    className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg"
                  >
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!files.length || uploading || !s3Status?.s3Connected}
              className="w-full bg-[#4ade80] text-[#0f172a] py-3 rounded-lg font-semibold hover:bg-[#22c55e] disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? "Uploading..." : "Upload Documents"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Results</h2>
            <div className="space-y-4">
              {results.success ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>{results.message}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-5 h-5" />
                  <span>{results.error}</span>
                </div>
              )}

              {results.stats && (
                <div className="text-sm text-gray-400">
                  Total Time: {results.stats.totalTime}ms | Successful:{" "}
                  {results.stats.successful} | Failed: {results.stats.failed}
                </div>
              )}

              {results.documents && results.documents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-green-400">
                    Successfully Uploaded:
                  </h3>
                  {results.documents.map((doc: any, index: number) => (
                    <div
                      key={doc.id}
                      className="bg-[#0f172a] p-3 rounded-lg text-sm"
                    >
                      <div className="font-medium">{doc.filename}</div>
                      <div className="text-gray-400">
                        ID: {doc.id} | Type: {doc.documentType} | Size:{" "}
                        {(doc.size / 1024).toFixed(1)} KB
                        {doc.optimized && " | Optimized"}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.errors && results.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-red-400">Upload Errors:</h3>
                  {results.errors.map((error: string, index: number) => (
                    <div
                      key={index}
                      className="bg-red-900/20 border border-red-500/20 p-3 rounded-lg text-sm text-red-300"
                    >
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* OCR Processing Status */}
        {ocrStatus.length > 0 && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">OCR Processing Status</h2>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  autoRefresh
                    ? "bg-[#4ade80] text-[#0f172a]"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
              </button>
            </div>

            <div className="space-y-3">
              {ocrStatus.map((status) => (
                <div key={status.id} className="bg-[#0f172a] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {status.originalFileName}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        status.status === "COMPLETED"
                          ? "bg-green-500/20 text-green-400"
                          : status.status === "PROCESSING"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : status.status === "FAILED"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {status.status}
                    </span>
                  </div>

                  {status.status === "COMPLETED" && (
                    <div className="space-y-1 text-sm text-gray-400">
                      <div>Type: {status.documentType}</div>
                      <div>
                        Confidence: {(status.ocrConfidence * 100).toFixed(1)}%
                      </div>
                      {status.metadata?.labSource && (
                        <div>Lab Source: {status.metadata.labSource}</div>
                      )}
                      {status.metadata?.wordCount && (
                        <div>Words Extracted: {status.metadata.wordCount}</div>
                      )}
                      {status.textPreview && (
                        <div className="mt-2 p-2 bg-[#1e293b] rounded text-xs">
                          <div className="text-gray-500 mb-1">
                            Text Preview:
                          </div>
                          <div className="text-gray-300">
                            {status.textPreview}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {status.processing && (
                    <div className="text-sm text-gray-400">
                      Queue Status: {status.processing.status}
                      {status.processing.startedAt && (
                        <div>
                          Started:{" "}
                          {new Date(
                            status.processing.startedAt
                          ).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}

                  {status.errorMessage && (
                    <div className="text-sm text-red-400 mt-2">
                      Error: {status.errorMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lab Values Display */}
        {labValues.length > 0 && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Extracted Lab Values</h2>

            {labValues.map((labData, index) => (
              <div
                key={`lab-${labData.document.id}-${index}`}
                className="mb-6 bg-[#0f172a] p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-[#4ade80]">
                    {labData.document.originalFileName}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {labData.stats.totalValues} values •{" "}
                    {labData.stats.highConfidence} high confidence
                  </div>
                </div>

                {Object.entries(labData.categorized).map(
                  ([category, values]) => {
                    if (!Array.isArray(values) || values.length === 0)
                      return null;

                    return (
                      <div key={category} className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">
                          {category} ({values.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {values.map((value: any, idx: number) => (
                            <div
                              key={`${value.testName}-${value.value}-${idx}`}
                              className="bg-[#1e293b] p-3 rounded border border-[#334155]"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {value.testName}
                                </span>
                                {value.flag && value.flag !== "normal" && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                      value.flag === "high"
                                        ? "bg-red-500/20 text-red-400"
                                        : value.flag === "low"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : value.flag === "critical"
                                        ? "bg-red-600/20 text-red-300"
                                        : "bg-gray-500/20 text-gray-400"
                                    }`}
                                  >
                                    {value.flag.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="text-lg font-semibold">
                                {value.value} {value.unit}
                              </div>
                              {value.referenceMin !== null &&
                                value.referenceMax !== null && (
                                  <div className="text-xs text-gray-500">
                                    Range: {value.referenceMin}-
                                    {value.referenceMax}
                                  </div>
                                )}
                              <div className="text-xs text-gray-400 mt-1">
                                {(value.confidence * 100).toFixed(1)}%
                                confidence
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ))}
          </div>
        )}

        {/* Functional Medicine Analysis Display */}
        {functionalAnalysis.length > 0 && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              Functional Medicine Analysis
            </h2>

            {functionalAnalysis.map((analysis, index) => (
              <div
                key={`analysis-${analysis.document.id}-${index}`}
                className="mb-6 bg-[#0f172a] p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-[#4ade80]">
                    {analysis.document.originalFileName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        analysis.analysis.overallHealth.grade === "A"
                          ? "bg-green-500/20 text-green-400"
                          : analysis.analysis.overallHealth.grade === "B"
                          ? "bg-blue-500/20 text-blue-400"
                          : analysis.analysis.overallHealth.grade === "C"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : analysis.analysis.overallHealth.grade === "D"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      Grade {analysis.analysis.overallHealth?.grade || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400">
                      Score: {analysis.analysis.overallHealth?.score || 0}/100
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-300">
                    {analysis.analysis.overallHealth?.summary ||
                      "Analysis in progress..."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[#1e293b] p-3 rounded border border-[#334155]">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {analysis.analysis.patternsDetected || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Health Patterns
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1e293b] p-3 rounded border border-[#334155]">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">
                        {analysis.analysis.criticalFindings || 0}
                      </div>
                      <div className="text-xs text-gray-400">
                        Critical Findings
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1e293b] p-3 rounded border border-[#334155]">
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${
                          analysis.analysis.dotRiskLevel === "high"
                            ? "text-red-400"
                            : analysis.analysis.dotRiskLevel === "medium"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {analysis.analysis.dotRiskLevel?.toUpperCase() || "LOW"}
                      </div>
                      <div className="text-xs text-gray-400">
                        DOT Risk Level
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={() =>
                      fetchFunctionalAnalysis(analysis.document.id)
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
                  >
                    Refresh Analysis
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FNTP Protocol Recommendations Display */}
        {fntpProtocols.length > 0 && (
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">
              FNTP Protocol Recommendations
            </h2>

            {fntpProtocols.map((protocolData, index) => (
              <div
                key={`protocol-${protocolData.document.id}-${index}`}
                className="mb-6 bg-[#0f172a] p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-[#4ade80]">
                    Protocol for{" "}
                    {protocolData.document?.client?.name || "Driver"}
                  </h3>
                  <span className="text-sm text-gray-400">
                    Generated:{" "}
                    {protocolData.generatedAt
                      ? new Date(protocolData.generatedAt).toLocaleDateString()
                      : "Now"}
                  </span>
                </div>

                {protocolData.protocol && (
                  <>
                    {/* Executive Summary */}
                    <div className="mb-4 p-3 bg-[#1e293b] rounded border border-[#334155]">
                      <h4 className="font-medium text-blue-400 mb-2">
                        Executive Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Key Findings:</strong>
                          <ul className="ml-4 mt-1">
                            {protocolData.protocol.executiveSummary.keyFindings.map(
                              (finding: string, idx: number) => (
                                <li
                                  key={`finding-${idx}-${finding.slice(0, 20)}`}
                                  className="text-gray-300"
                                >
                                  • {finding}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <strong>Expected Outcomes:</strong>{" "}
                          {protocolData.protocol.executiveSummary.timeframe}
                        </div>
                      </div>
                    </div>

                    {/* Immediate Supplements */}
                    {protocolData.protocol.supplements?.immediate.length >
                      0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-green-400 mb-2">
                          Immediate Supplements (Priority 1)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {protocolData.protocol.supplements.immediate.map(
                            (supp: any, idx: number) => (
                              <div
                                key={`supp-${supp.name}-${idx}`}
                                className="bg-[#1e293b] p-3 rounded border border-[#334155]"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-white">
                                    {supp.name}
                                  </span>
                                  {supp.source === "letstruck" && (
                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                                      LetsTruck
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-300 space-y-1">
                                  <div>
                                    <strong>Dosage:</strong> {supp.dosage}
                                  </div>
                                  <div>
                                    <strong>Timing:</strong> {supp.timing}
                                  </div>
                                  <div>
                                    <strong>Purpose:</strong> {supp.purpose}
                                  </div>
                                  <div className="text-xs text-orange-400">
                                    <strong>Road Instructions:</strong>{" "}
                                    {supp.roadInstructions}
                                  </div>
                                </div>
                                {supp.productUrl && (
                                  <a
                                    href={supp.productUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                                  >
                                    View Product →
                                  </a>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Nutrition Plan */}
                    {protocolData.protocol.nutrition && (
                      <div className="mb-4">
                        <h4 className="font-medium text-yellow-400 mb-2">
                          Nutrition Plan:{" "}
                          {protocolData.protocol.nutrition.phase}
                        </h4>
                        <div className="bg-[#1e293b] p-3 rounded border border-[#334155]">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-2">
                                Guidelines:
                              </h5>
                              <ul className="text-sm text-gray-400 space-y-1">
                                {protocolData.protocol.nutrition.guidelines
                                  .slice(0, 4)
                                  .map((guideline: string, idx: number) => (
                                    <li key={idx}>• {guideline}</li>
                                  ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-300 mb-2">
                                Truck Stop Options:
                              </h5>
                              <div className="text-sm text-gray-400 space-y-1">
                                {protocolData.protocol.nutrition.truckStopOptions
                                  .slice(0, 2)
                                  .map((option: any, idx: number) => (
                                    <div key={idx}>
                                      <strong>{option.chain}:</strong>{" "}
                                      {option.recommendations[0]}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lifestyle Protocols */}
                    {protocolData.protocol.lifestyle && (
                      <div className="mb-4">
                        <h4 className="font-medium text-purple-400 mb-2">
                          Lifestyle Recommendations
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {protocolData.protocol.lifestyle
                            .slice(0, 2)
                            .map((category: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-[#1e293b] p-3 rounded border border-[#334155]"
                              >
                                <h5 className="font-medium text-white capitalize mb-2">
                                  {category.category}
                                </h5>
                                <div className="text-sm text-gray-300">
                                  <div>
                                    <strong>Action:</strong>{" "}
                                    {category.recommendations[0].instruction}
                                  </div>
                                  <div>
                                    <strong>Frequency:</strong>{" "}
                                    {category.recommendations[0].frequency}
                                  </div>
                                  <div className="text-xs text-orange-400 mt-1">
                                    <strong>Trucker Tip:</strong>{" "}
                                    {
                                      category.recommendations[0]
                                        .truckerModification
                                    }
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Monitoring */}
                    {protocolData.protocol.monitoring && (
                      <div className="mb-4">
                        <h4 className="font-medium text-red-400 mb-2">
                          Monitoring & Follow-up
                        </h4>
                        <div className="bg-[#1e293b] p-3 rounded border border-[#334155] text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <strong>
                                Next Labs (
                                {protocolData.protocol.monitoring.timeline}):
                              </strong>
                              <ul className="text-gray-400 mt-1">
                                {protocolData.protocol.monitoring.labsToReorder
                                  .slice(0, 3)
                                  .map((lab: string, idx: number) => (
                                    <li key={idx}>• {lab}</li>
                                  ))}
                              </ul>
                            </div>
                            <div>
                              <strong>Success Metrics:</strong>
                              <ul className="text-gray-400 mt-1">
                                {protocolData.protocol.monitoring.successMetrics
                                  .slice(0, 2)
                                  .map((metric: string, idx: number) => (
                                    <li key={idx}>• {metric}</li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Protocol Generation Button */}
                {!protocolData.protocol && (
                  <div className="text-center">
                    <div className="text-gray-400 mb-3">
                      Protocol ready to generate for this document
                    </div>
                    <button
                      onClick={() =>
                        fetchFNTPProtocol(protocolData.document.id)
                      }
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
                    >
                      Generate FNTP Protocol
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
