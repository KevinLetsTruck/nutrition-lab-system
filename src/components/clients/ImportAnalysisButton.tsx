"use client";

import { useState, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (!token) {
      toast.error("Authentication required", {
        description: "Please log in to import analysis data.",
      });
      return;
    }

    // Trigger file picker
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      toast.error("Invalid file type", {
        description: "Please select a .md or .txt file containing Claude analysis.",
      });
      return;
    }

    setIsImporting(true);
    setImportStatus("idle");

    try {
      // Read file content
      const fileContent = await file.text();
      
      const analysisData = {
        type: "text_analysis",
        content: fileContent,
        filename: file.name,
        wordCount: fileContent.split(' ').length,
        importDate: new Date().toISOString()
      };

      const response = await fetch(`/api/clients/${clientId}/import-analysis`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          analysisData,
          version: "2.0.0"
        }),
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
