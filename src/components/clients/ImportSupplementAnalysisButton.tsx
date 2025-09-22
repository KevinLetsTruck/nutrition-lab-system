"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Pill, Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner";

interface ImportSupplementAnalysisButtonProps {
  clientId: string;
  clientName: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function ImportSupplementAnalysisButton({
  clientId,
  clientName,
  variant = "outline",
  size = "sm",
}: ImportSupplementAnalysisButtonProps) {
  const { token } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to import supplement analysis.",
      });
      return;
    }

    // Trigger file picker
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt")) {
      toast.error("Invalid file type", {
        description:
          "Please select a .md or .txt file containing Claude supplement analysis.",
      });
      return;
    }

    setIsImporting(true);
    setImportStatus("idle");

    try {
      // Read file content
      const fileContent = await file.text();

      const response = await fetch(
        `/api/clients/${clientId}/import-supplement-analysis`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            analysisText: fileContent,
            filename: file.name,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Import failed");
      }

      const result = await response.json();
      setImportStatus("success");

      toast.success("Structured supplement analysis imported!", {
        description: `${result.supplementsCreated} supplements imported for ${clientName}. Monthly cost: $${result.totalMonthlyCost}`,
        duration: 5000,
      });

      // Show medication warnings if any
      if (result.medicationWarnings > 0) {
        toast.warning("Medication interactions detected", {
          description: `${result.medicationWarnings} potential interactions found. Review supplement recommendations.`,
          duration: 8000,
        });
      }

      // Refresh the page to show new supplements
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus("error");
      toast.error("Import failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getButtonText = () => {
    if (isImporting) return "Importing...";
    if (importStatus === "success") return "Imported!";
    if (importStatus === "error") return "Import Failed";
    return "Import Supplements";
  };

  const getIcon = () => {
    if (isImporting) return <Loader2 className="animate-spin" />;
    if (importStatus === "success") return <CheckCircle />;
    if (importStatus === "error") return <AlertCircle />;
    return <Pill />;
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleImport}
        disabled={isImporting}
        className="gap-2"
      >
        {getIcon()}
        {getButtonText()}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt,text/plain,text/markdown"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
