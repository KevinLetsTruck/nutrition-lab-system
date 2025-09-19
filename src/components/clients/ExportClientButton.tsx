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

      // Handle file download (original working functionality)
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
            <p>
              <strong>Client:</strong> {clientName}
            </p>
            <p>
              <strong>File:</strong> {filename}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              📦 ZIP file downloaded to your Downloads folder
            </p>
          </div>
        ),
        duration: 6000,
      });

      // Optional: Show system notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("FNTP Client Export Downloaded", {
          body: `${clientName} data downloaded as ${filename}`,
          icon: "/favicon.ico",
        });
      }

      // Trigger Claude prompts modal
      const claudePromptsData = {
        filename: filename,
        location: "Downloads folder",
        prompts: {
          comprehensive: `FNTP FUNCTIONAL MEDICINE ANALYSIS - EXECUTE IMMEDIATELY

CRITICAL INSTRUCTIONS: 
- DO NOT ask clarifying questions or request file uploads
- ZIP FILE IS READY: ${filename} in your Downloads folder
- EXTRACT and ANALYZE all contents directly
- PROCEED with complete analysis using all extracted files

SYSTEM ACTIVATION: You are my FNTP functional medicine analysis system. Load all protocols.

FILE LOCATION: Downloads/${filename}
- Extract the ZIP to access organized folder structure
- Contains: client-data.json (complete client information)
- Contains: client-summary.md (human-readable overview)
- Contains: All client PDF documents (lab reports, intake forms)
- Contains: export-metadata.json (system information)

CLIENT OVERVIEW:
- Name: ${clientName}
- Export Date: ${new Date().toLocaleDateString()}

ANALYSIS REQUIREMENTS:
1. EXTRACT the ZIP file: ${filename}
2. READ client-data.json for complete client information
3. REVIEW all PDF documents for lab values and medical history
4. ANALYZE client-summary.md for clinical context

5. Generate comprehensive FNTP analysis with 3-phase protocol
6. Provide LetsTruck supplement recommendations
7. Include practitioner coaching notes

EXTRACT ZIP FILE AND EXECUTE COMPREHENSIVE FNTP ANALYSIS NOW.`,
          focused: {
            gut: "GUT HEALTH ANALYSIS - Extract and use ZIP file data",
            metabolic: "METABOLIC ANALYSIS - Extract and use ZIP file data",
            hormonal: "HORMONAL ANALYSIS - Extract and use ZIP file data"
          },
          followup: "FOLLOW-UP ANALYSIS - Extract and use ZIP file data"
        },
        clientContext: {
          name: clientName,
          primaryConcerns: "Review extracted data for health goals",
          medications: [],
          keyLabs: "Review documents in extracted ZIP file"
        }
      };

      // Dispatch event to show Claude prompts modal
      window.dispatchEvent(
        new CustomEvent("claudePromptsReady", {
          detail: claudePromptsData,
        })
      );
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
