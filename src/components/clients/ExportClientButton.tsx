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

        // Trigger Claude prompts modal
        const claudePromptsData = {
          filename: `${data.summary.clientName}-${new Date().toISOString().split("T")[0]}`,
          location: data.exportPath,
          prompts: {
            comprehensive: `FNTP FUNCTIONAL MEDICINE ANALYSIS - EXECUTE IMMEDIATELY

CRITICAL INSTRUCTIONS: 
- DO NOT ask clarifying questions or request file uploads
- CLIENT FOLDER IS READY: ${data.exportPath}
- ANALYZE all files in the folder directly
- PROCEED with complete analysis using all available data

SYSTEM ACTIVATION: You are my FNTP functional medicine analysis system. Load all protocols.

FOLDER LOCATION: ${data.exportPath}
- Contains: client-data.json (complete client information)
- Contains: client-summary.md (human-readable overview)  
- Contains: export-metadata.json (system information)
- Contains: documents/ folder with all client PDF files

CLIENT OVERVIEW:
- Name: ${data.summary.clientName}
- Export Date: ${new Date().toLocaleDateString()}
- Total Documents: ${data.summary.totalDocuments}
- Total Assessments: ${data.summary.totalAssessments}

ANALYSIS REQUIREMENTS:
1. READ client-data.json for complete client information
2. REVIEW client-summary.md for clinical context
3. ANALYZE all PDF documents in documents/ folder
4. EXTRACT lab values and medical history

5. Generate comprehensive FNTP analysis with 3-phase protocol
6. Provide LetsTruck supplement recommendations  
7. Include practitioner coaching notes

EXECUTE COMPREHENSIVE FNTP ANALYSIS NOW.`,
            focused: {
              gut: `GUT HEALTH ANALYSIS - Use folder data: ${data.exportPath}`,
              metabolic: `METABOLIC ANALYSIS - Use folder data: ${data.exportPath}`,
              hormonal: `HORMONAL ANALYSIS - Use folder data: ${data.exportPath}`,
            },
            followup: `FOLLOW-UP ANALYSIS - Use folder data: ${data.exportPath}`,
          },
          clientContext: {
            name: data.summary.clientName,
            primaryConcerns: "Review client-summary.md for health goals",
            medications: [],
            keyLabs: "Review documents in folder for lab results",
          },
        };

        // Dispatch event to show Claude prompts modal
        window.dispatchEvent(
          new CustomEvent("claudePromptsReady", {
            detail: claudePromptsData,
          })
        );
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