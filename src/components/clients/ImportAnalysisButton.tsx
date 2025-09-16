"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, CheckCircle, AlertCircle, Brain } from "lucide-react";
import { toast } from "sonner";

interface ImportAnalysisButtonProps {
  clientId: string;
  clientName: string;
  onImportSuccess?: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function ImportAnalysisButton({
  clientId,
  clientName,
  onImportSuccess,
  variant = "outline",
  size = "sm",
}: ImportAnalysisButtonProps) {
  const { token } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleImport = async () => {
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to import analysis results.",
      });
      return;
    }

    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.json')) {
        toast.error("Invalid file type", {
          description: "Please select a JSON file with Claude analysis results.",
        });
        return;
      }

      setIsImporting(true);
      setImportStatus("idle");

      try {
        // Read file content
        const fileContent = await file.text();
        const analysisData = JSON.parse(fileContent);

        // Import analysis via API
        const response = await fetch(
          `/api/clients/${clientId}/import-analysis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              analysisData,
              version: "1.0",
              analysisDate: new Date().toISOString(),
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Import failed");
        }

        const result = await response.json();

        setImportStatus("success");
        toast.success("Analysis Imported Successfully!", {
          description: (
            <div className="space-y-1">
              <p>
                <strong>Client:</strong> {clientName}
              </p>
              <p>
                <strong>Confidence:</strong> {(result.analysis.confidence * 100).toFixed(1)}%
              </p>
              <p>
                <strong>Root Causes:</strong> {result.analysis.rootCauses?.length || 0}
              </p>
              <p>
                <strong>Storage:</strong> {result.summary.storedAs || "Processed"}
              </p>
              <p className="text-xs text-green-400 mt-2">
                ✅ {result.message}
              </p>
            </div>
          ),
          duration: 8000,
        });

        // Call success callback
        if (onImportSuccess) {
          onImportSuccess();
        }

        // Optional: Show system notification
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("FNTP Analysis Imported", {
            body: `${clientName} Claude analysis imported successfully`,
            icon: "/favicon.ico",
          });
        }

      } catch (error) {
        console.error("Import error:", error);
        setImportStatus("error");
        
        let errorMessage = "An unexpected error occurred during import.";
        if (error instanceof SyntaxError) {
          errorMessage = "Invalid JSON file format. Please check the file.";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error("Import Failed", {
          description: errorMessage,
          duration: 6000,
        });
      } finally {
        setIsImporting(false);
        document.body.removeChild(input);

        // Reset status after delay
        setTimeout(() => {
          setImportStatus("idle");
        }, 3000);
      }
    };

    // Trigger file picker
    document.body.appendChild(input);
    input.click();
  };

  const getButtonIcon = () => {
    if (isImporting) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (importStatus === "success")
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (importStatus === "error")
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Brain className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isImporting) return "Importing...";
    if (importStatus === "success") return "Imported!";
    if (importStatus === "error") return "Import Failed";
    return "Import Analysis";
  };

  const getButtonVariant = () => {
    if (importStatus === "success") return "default";
    if (importStatus === "error") return "destructive";
    return variant;
  };

  return (
    <Button
      onClick={handleImport}
      disabled={isImporting}
      variant={getButtonVariant()}
      size={size}
      className="gap-2"
    >
      {getButtonIcon()}
      {getButtonText()}
    </Button>
  );
}
