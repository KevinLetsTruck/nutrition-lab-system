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

      // Handle Claude Desktop export response
      const exportResult = await response.json();

      setExportStatus("success");
      
      // Show success toast with basic info
      toast.success(exportResult.message, {
        description: (
          <div className="space-y-1">
            <p>
              <strong>Client:</strong> {clientName}
            </p>
            <p>
              <strong>File:</strong> {exportResult.filename}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {exportResult.location}
            </p>
            <p className="text-xs text-blue-400 mt-2">
              🤖 Claude prompts generated - check modal for copy-paste options
            </p>
          </div>
        ),
        duration: 6000,
      });

      // Store prompts for modal display (you'll implement the modal next)
      if (typeof window !== 'undefined') {
        (window as any).claudePrompts = exportResult.prompts;
        (window as any).claudeExportResult = exportResult;
        
        // Trigger custom event for modal display
        window.dispatchEvent(new CustomEvent('claudePromptsReady', { 
          detail: exportResult 
        }));
      }

      // Optional: Show system notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("FNTP Client Exported to Claude Analysis System", {
          body: `${clientName} data exported as ${exportResult.filename}`,
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
