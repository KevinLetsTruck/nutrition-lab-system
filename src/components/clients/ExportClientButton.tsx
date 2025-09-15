"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ExportClientButtonProps {
  clientId: string;
  clientName: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function ExportClientButton({
  clientId,
  clientName,
  variant = "outline",
  size = "sm",
}: ExportClientButtonProps) {
  const { token } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleExport = async () => {
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to export client data.",
      });
      return;
    }

    setIsExporting(true);
    setExportStatus("idle");

    try {
      const response = await fetch(
        `/api/clients/${clientId}/export-for-analysis`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Try to parse error as JSON, fallback to text
        let errorMessage = "Export failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = await response.text();
        }
        throw new Error(errorMessage);
      }

      // Check if response is JSON (local save) or blob (browser download)
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Local save mode - handle JSON response with prompts
        const exportResult = await response.json();

        setExportStatus("success");
        
        toast.success(exportResult.message, {
          description: (
            <div className="space-y-1">
              <p><strong>Client:</strong> {clientName}</p>
              <p><strong>File:</strong> {exportResult.filename}</p>
              <p className="text-xs text-gray-500 mt-2">{exportResult.location}</p>
              <p className="text-xs text-blue-400 mt-2">
                🤖 Claude prompts generated - check modal for copy-paste options
              </p>
            </div>
          ),
          duration: 6000,
        });

        // Store prompts for modal display
        if (typeof window !== 'undefined') {
          (window as any).claudePrompts = exportResult.prompts;
          (window as any).claudeExportResult = exportResult;
          
          window.dispatchEvent(new CustomEvent('claudePromptsReady', { 
            detail: exportResult 
          }));
        }
      } else {
        // Browser download mode - handle blob response
        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');
        const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);
        const filename = filenameMatch ? filenameMatch[1] : `${clientName}-export.zip`;

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setExportStatus("success");
        toast.success("Export Downloaded!", {
          description: (
            <div className="space-y-1">
              <p><strong>Client:</strong> {clientName}</p>
              <p><strong>File:</strong> {filename}</p>
              <p className="text-xs text-gray-500 mt-2">
                📦 ZIP file downloaded to your Downloads folder
              </p>
              <p className="text-xs text-blue-400 mt-2">
                💡 Save to /Users/kr/FNTP-Claude-Analysis-System/1-incoming-exports/ for Claude Desktop analysis
              </p>
            </div>
          ),
          duration: 8000,
        });
      }

      // Optional: Show system notification
      if ("Notification" in window && Notification.permission === "granted") {
        const notificationTitle = contentType?.includes('application/json') 
          ? "FNTP Client Exported to Claude Analysis System"
          : "FNTP Client Export Downloaded";
        const filename = contentType?.includes('application/json') 
          ? (window as any).claudeExportResult?.filename || "export.zip"
          : filename || "export.zip";
          
        new Notification(notificationTitle, {
          body: `${clientName} data exported as ${filename}`,
          icon: "/favicon.ico",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      setExportStatus("error");
      toast.error("Export Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during export.",
      });
    } finally {
      setIsExporting(false);

      // Reset status after a delay
      setTimeout(() => {
        setExportStatus("idle");
      }, 3000);
    }
  };

  const getButtonIcon = () => {
    if (isExporting) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (exportStatus === "success")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (exportStatus === "error")
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Download className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isExporting) return "Exporting...";
    if (exportStatus === "success") return "Exported!";
    if (exportStatus === "error") return "Export Failed";
    return "Export for Analysis";
  };

  const getButtonVariant = () => {
    if (exportStatus === "success") return "default";
    if (exportStatus === "error") return "destructive";
    return variant;
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant={getButtonVariant()}
      size={size}
      className="gap-2"
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
