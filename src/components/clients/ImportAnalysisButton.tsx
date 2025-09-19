"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImportAnalysisButtonProps {
  clientId: string;
  clientName: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
}

export function ImportAnalysisButton({
  clientId,
  clientName,
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
        description: "Please log in to import analysis data.",
      });
      return;
    }

    setIsImporting(true);
    setImportStatus("idle");

    try {
      const response = await fetch(`/api/clients/${clientId}/import-analysis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Import failed");
      }

      const result = await response.json();
      setImportStatus("success");

      toast.success("Analysis imported successfully!", {
        description: `${clientName}'s Claude analysis has been imported and saved.`,
      });

      // Refresh the page to show new analysis
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus("error");
      toast.error("Import failed", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const getButtonText = () => {
    if (isImporting) return "Importing...";
    if (importStatus === "success") return "Imported!";
    if (importStatus === "error") return "Import Failed";
    return "Import Analysis";
  };

  const getIcon = () => {
    if (isImporting) return <Loader2 className="animate-spin" />;
    if (importStatus === "success") return <CheckCircle />;
    if (importStatus === "error") return <AlertCircle />;
    return <Brain />;
  };

  return (
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
  );
}
