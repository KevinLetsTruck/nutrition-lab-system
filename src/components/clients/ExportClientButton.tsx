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
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Export failed");
      }

      if (data.success) {
        setExportStatus("success");
        toast.success("Export Complete!", {
          description: (
            <div className="space-y-1">
              <p>
                <strong>Client:</strong> {data.summary.clientName}
              </p>
              <p>
                <strong>Location:</strong> {data.exportPath}
              </p>
              <p>
                <strong>Files:</strong> {data.summary.exportedFiles.join(", ")}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                <p>📊 {data.summary.totalAssessments} assessments</p>
                <p>📄 {data.summary.totalDocuments} documents</p>
                <p>📝 {data.summary.totalNotes} notes</p>
                <p>💊 {data.summary.totalProtocols} protocols</p>
              </div>
            </div>
          ),
          duration: 8000,
        });

        // Optional: Show system notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("FNTP Client Export Complete", {
            body: `${clientName} data exported successfully`,
            icon: "/favicon.ico",
          });
        }
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
