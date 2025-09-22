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

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".md") && !file.name.endsWith(".txt") && !file.name.endsWith(".json")) {
      toast.error("Invalid file type", {
        description:
          "Please select a .md, .txt, or .json file containing Claude analysis.",
      });
      return;
    }

    setIsImporting(true);
    setImportStatus("idle");

    try {
      // Read file content
      const fileContent = await file.text();
      
      let analysisData;
      let apiEndpoint;
      
      if (file.name.endsWith('.json')) {
        // Handle JSON file from Claude Desktop
        try {
          const jsonData = JSON.parse(fileContent);
          
          // Validate it's a Claude Desktop export document
          if (jsonData.exportMetadata && jsonData.supplementRecommendations) {
            analysisData = jsonData;
            apiEndpoint = `/api/clients/${clientId}/import-supplement-analysis`;
          } else {
            throw new Error("Invalid JSON structure");
          }
        } catch (jsonError) {
          toast.error("Invalid JSON file", {
            description: "Please ensure the file contains valid Claude Desktop export data.",
          });
          return;
        }
      } else {
        // Handle text/markdown files (legacy format)
        analysisData = {
          type: "text_analysis",
          content: fileContent,
          filename: file.name,
          wordCount: fileContent.split(" ").length,
          importDate: new Date().toISOString(),
        };
        apiEndpoint = `/api/clients/${clientId}/import-analysis`;
      }

      const requestBody = file.name.endsWith('.json') 
        ? { analysisText: fileContent, filename: file.name }
        : { analysisData, version: "2.0.0" };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Import failed");
      }

      const result = await response.json();
      setImportStatus("success");

      if (file.name.endsWith('.json')) {
        // JSON import success message
        toast.success("Structured protocol imported successfully!", {
          description: `${result.supplementsCreated || 0} supplements imported for ${clientName}. ${result.totalMonthlyCost ? `Monthly cost: $${result.totalMonthlyCost}` : ''}`,
          duration: 5000
        });

        // Show medication warnings if any
        if (result.medicationWarnings > 0) {
          toast.warning("Medication interactions detected", {
            description: `${result.medicationWarnings} potential interactions found. Review supplement recommendations.`,
            duration: 8000
          });
        }
      } else {
        // Text/markdown import success message
        toast.success("Analysis imported successfully!", {
          description: `${clientName}'s Claude analysis has been imported and saved.`,
        });
      }

      // Refresh the page to show new analysis
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
        accept=".md,.txt,.json,text/plain,text/markdown,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
